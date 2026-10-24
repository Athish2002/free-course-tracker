"""
Self-Healing Site Inspector & Paywall Verification Engine for CoursePulse.
"""

from __future__ import annotations

import asyncio
import concurrent.futures
import json
import logging
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import httpx

from src.constants import BROWSER_HEADERS, STALENESS_THRESHOLD_DAYS
from src.io_utils import atomic_write_json
from src.authenticity import audit_course_authenticity
from src.paywall_detector import detect_paywall
from src.visual_hasher import should_skip_screenshot_write
from src.audit_ledger import record_audit_entry

try:
    from playwright.async_api import async_playwright
except ImportError:
    async_playwright = None

logger = logging.getLogger("coursepulse.inspector")

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "courses.json"
SCHEMA_FILE = Path(__file__).resolve().parent.parent / "data" / "schema.json"


def check_and_flag_stale_courses(
    courses: list[dict[str, Any]],
    threshold_days: int = STALENESS_THRESHOLD_DAYS
) -> int:
    """Auto-downgrades Active courses whose verification_date exceeds threshold_days."""
    today = datetime.now(timezone.utc).date()
    stale_count = 0
    for course in courses:
        if course.get("status") == "Active":
            v_date_str = course.get("verification_date")
            is_stale = False
            if not v_date_str:
                is_stale = True
            else:
                try:
                    v_date = datetime.strptime(v_date_str, "%Y-%m-%d").date()
                    if (today - v_date).days > threshold_days:
                        is_stale = True
                except Exception:
                    is_stale = True
            if is_stale:
                course["status"] = "Review Needed"
                course["inspection_notes"] = f"Stale — last verified {v_date_str} (> {threshold_days} days ago), pending re-inspection"
                stale_count += 1
    return stale_count


async def run_inspection_async(
    use_headless: bool = True,
    concurrency: int = 5,
    timeout_per_course: int = 30,
    per_institution_concurrency: int = 4
) -> dict[str, Any]:
    """
    Concurrent Playwright & Async HTTPX inspection engine for CoursePulse.
    Audits every course for paywalls, credit card requirements, and broken links.
    """
    logger.info("Starting CoursePulse Paywall Verification Engine (concurrency=%d)", concurrency)
    start_time = time.time()

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    courses = data.get("courses", [])
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    screenshots_dir = Path(__file__).resolve().parent.parent / "docs" / "screenshots"
    screenshots_dir.mkdir(parents=True, exist_ok=True)

    check_and_flag_stale_courses(courses)

    sem = asyncio.Semaphore(concurrency)
    inst_semaphores: dict[str, asyncio.Semaphore] = {}

    def get_inst_sem(inst: str) -> asyncio.Semaphore:
        k = (inst or "unknown").strip().lower()
        if k not in inst_semaphores:
            inst_semaphores[k] = asyncio.Semaphore(per_institution_concurrency)
        return inst_semaphores[k]

    browser = None
    playwright_mgr = None

    if use_headless and async_playwright is not None:
        try:
            playwright_mgr = await async_playwright().start()
            browser = await playwright_mgr.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
            )
        except Exception as pw_err:
            logger.warning("Playwright launch failed: %s. Using HTTPX fallback.", pw_err)
            browser = None
            playwright_mgr = None

    status_changes = 0

    async def inspect_single_course(course: dict[str, Any]) -> None:
        nonlocal status_changes
        cid = course.get("id", "")
        current_url = course.get("url", "")
        old_status = course.get("status", "Active")

        try:
            auth_res = audit_course_authenticity(course)
            if not auth_res["is_authentic"]:
                course["status"] = "Review Needed"
                course["inspection_notes"] = f"Authenticity check failed: {auth_res.get('reason')}"
                return

            inst_sem = get_inst_sem(course.get("institution", ""))
            async with sem, inst_sem:
                rendered_text = ""
                rendered_html = ""
                http_status = 200

                if browser is not None:
                    context = await browser.new_context(
                        viewport={"width": 1280, "height": 800},
                        user_agent=BROWSER_HEADERS["User-Agent"]
                    )
                    page = await context.new_page()
                    try:
                        resp = await page.goto(current_url, wait_until="domcontentloaded", timeout=timeout_per_course * 1000)
                        http_status = resp.status if resp else 200
                        rendered_text = await page.evaluate("() => document.body ? document.body.innerText : ''")
                        rendered_html = await page.content()

                        # Capture screenshot
                        shot_bytes = await page.screenshot(type="png", full_page=False)
                        target_file = screenshots_dir / f"{cid}.png"
                        if not should_skip_screenshot_write(target_file, shot_bytes):
                            target_file.write_bytes(shot_bytes)
                    finally:
                        await context.close()
                else:
                    # Non-blocking async HTTPX fallback
                    async with httpx.AsyncClient(headers=BROWSER_HEADERS, timeout=12.0, follow_redirects=True) as client:
                        resp = await client.get(current_url)
                        http_status = resp.status_code
                        rendered_text = resp.text
                        rendered_html = resp.text

                # Status decision based on HTTP status and paywall detection
                if http_status in (404, 410):
                    course["status"] = "Broken Link"
                    course["inspection_notes"] = f"HTTP {http_status} Dead Link"
                    record_audit_entry(cid, "INSPECT_FAIL", "Broken Link", f"HTTP {http_status}", False)
                    status_changes += 1
                    return

                paywall_eval = detect_paywall(rendered_text, rendered_html)
                is_free = paywall_eval["is_paywall_free"]
                course["is_paywall_free"] = is_free
                course["syllabus_completeness_pct"] = paywall_eval["syllabus_completeness_pct"]
                course["verification_date"] = today

                vp = course.setdefault("visual_proof", {})
                vp["screenshot_path"] = f"docs/screenshots/{cid}.png"
                vp["status"] = "verified"
                vp["captured_at"] = datetime.now(timezone.utc).isoformat()
                vp["paywall_free_confirmed"] = is_free
                vp["trial_trap_detected"] = paywall_eval["trial_trap_detected"]
                vp["locked_modules_detected"] = paywall_eval["locked_modules_detected"]

                if is_free:
                    course["status"] = "Active"
                    course["inspection_notes"] = "Verified 100% paywall-free with full open syllabus"
                else:
                    course["status"] = "Paywalled"
                    traps = ", ".join(paywall_eval["detected_traps"]) or "Locked modules detected"
                    course["inspection_notes"] = f"Paywall detected: {traps}"

                record_audit_entry(cid, "INSPECT", course["status"], course["inspection_notes"], is_free)
                if old_status != course["status"]:
                    status_changes += 1

        except Exception as e:
            logger.error("Inspection error on course %s: %s", cid, e)

    try:
        tasks = [inspect_single_course(c) for c in courses]
        await asyncio.gather(*tasks, return_exceptions=True)
    finally:
        if browser:
            try:
                await browser.close()
            except Exception:
                pass
        if playwright_mgr:
            try:
                await playwright_mgr.stop()
            except Exception:
                pass

    now_iso = datetime.now(timezone.utc).isoformat()
    data["last_updated"] = now_iso
    data["total_courses"] = len(courses)
    data["active_courses"] = sum(1 for c in courses if c.get("status") == "Active")

    atomic_write_json(DATA_FILE, data, schema_path=SCHEMA_FILE)
    elapsed = time.time() - start_time
    logger.info("Inspection complete: %d courses audited in %.2fs (%d status changes)", len(courses), elapsed, status_changes)

    return {
        "total_courses": len(courses),
        "active_courses": data["active_courses"],
        "status_changes": status_changes,
        "elapsed_seconds": elapsed,
    }


def run_inspection(
    use_headless: bool = True,
    concurrency: int = 5,
    timeout_per_course: int = 30
) -> dict[str, Any]:
    """Synchronous wrapper executing run_inspection_async."""
    return asyncio.run(
        run_inspection_async(
            use_headless=use_headless,
            concurrency=concurrency,
            timeout_per_course=timeout_per_course
        )
    )
