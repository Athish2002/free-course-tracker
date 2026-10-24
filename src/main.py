"""
CoursePulse Master Orchestration Pipeline.
Executes autonomous candidate lead collection, authenticity gating,
paywall/trial detection, Playwright visual audits, and static artifact compilation.
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path
from typing import Any

from src.authenticity import audit_course_authenticity
from src.builders import build_all
from src.collector import fetch_course_leads
from src.inspector import run_inspection
from src.io_utils import atomic_write_json, load_courses_database, load_json
from src.models import CoursesDatabase
from src.paywall_detector import detect_paywall

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("coursepulse.main")

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
COURSES_FILE = DATA_DIR / "courses.json"
SCHEMA_FILE = DATA_DIR / "schema.json"
CANDIDATES_FILE = DATA_DIR / "candidates.json"
SUMMARY_FILE = DATA_DIR / "summary.json"


def process_candidate_leads(dry_run: bool = False) -> int:
    """
    Ingests and screens candidate leads from institutional feeds.
    Appends newly discovered genuine leads to candidates.json.
    """
    logger.info("Ingesting candidate leads from institutional feeds...")
    leads = fetch_course_leads()
    if not leads:
        logger.info("No new RSS/feed candidate leads discovered.")
        return 0

    candidates_data: list[dict[str, Any]] = []
    if CANDIDATES_FILE.exists():
        try:
            candidates_data = load_json(CANDIDATES_FILE)
            if not isinstance(candidates_data, list):
                candidates_data = []
        except Exception:
            candidates_data = []

    existing_urls = {c.get("url") for c in candidates_data if isinstance(c, dict)}
    courses_db = load_courses_database(COURSES_FILE, SCHEMA_FILE)
    existing_course_urls = {c.url for c in courses_db.courses}

    admitted_count = 0
    for lead in leads:
        lead_url = lead.get("url", "")
        if lead_url in existing_urls or lead_url in existing_course_urls:
            continue

        # Authenticity gate
        audit_res = audit_course_authenticity(lead_url, lead.get("title", ""))
        if not audit_res.get("is_authentic"):
            logger.debug("Lead %s rejected by authenticity gate: %s", lead_url, audit_res.get("reason"))
            continue

        lead["status"] = "Discovered"
        lead["authenticity_notes"] = audit_res.get("reason", "Verified domain")
        candidates_data.append(lead)
        existing_urls.add(lead_url)
        admitted_count += 1

    if not dry_run and admitted_count > 0:
        atomic_write_json(CANDIDATES_FILE, candidates_data)
        logger.info("Admitted %d new candidate leads to %s", admitted_count, CANDIDATES_FILE.name)
    else:
        logger.info("Candidate processing finished (%d new leads admitted)", admitted_count)

    return admitted_count


def run_pipeline(
    dry_run: bool = False,
    skip_inspection: bool = False,
    skip_collection: bool = False,
    vet_only: bool = False,
    rebuild_only: bool = False,
) -> int:
    """
    Main orchestration entrypoint.
    """
    logger.info("==================================================")
    logger.info(" Starting CoursePulse Autonomous Verification Run ")
    logger.info("==================================================")

    # 1. Rebuild only shortcut
    if rebuild_only:
        logger.info("Rebuild-only requested. Generating README and HTML dashboard...")
        result = build_all(base_dir=ROOT_DIR, force=True)
        logger.info("Rebuild complete: %s", result)
        return 0

    # 2. Ingest candidate leads
    if not skip_collection and not vet_only:
        process_candidate_leads(dry_run=dry_run)

    # 3. Inspect courses for paywalls & broken links
    if not skip_inspection and not dry_run and not vet_only:
        logger.info("Executing Playwright DOM inspection & paywall verification...")
        try:
            inspection_results = run_inspection(use_headless=True, concurrency=5)
            logger.info("Inspection results: %s", inspection_results)
        except Exception as e:
            logger.error("Inspection error: %s", e, exc_info=True)

    # 4. Strict Pydantic and JSONSchema Invariant Audit
    logger.info("Performing final database schema verification...")
    try:
        courses_db = load_courses_database(COURSES_FILE, SCHEMA_FILE)
        logger.info(
            "Database valid: %d total courses, %d active",
            courses_db.total_courses,
            courses_db.active_courses,
        )
    except Exception as e:
        logger.error("Database invariant verification failed: %s", e)
        return 1

    # 5. Compile static distribution artifacts
    logger.info("Compiling README.md and docs/index.html...")
    build_results = build_all(base_dir=ROOT_DIR, skip_if_unchanged=False, force=True)
    logger.info("Compilation successful: %s", build_results)

    logger.info("CoursePulse verification run completed successfully.")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(
        description="CoursePulse — Autonomous Anti-Paywall Open Course Tracker"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Execute pipeline without modifying database files",
    )
    parser.add_argument(
        "--skip-inspection",
        action="store_true",
        help="Skip network/Playwright inspection and only compile static outputs",
    )
    parser.add_argument(
        "--skip-collection",
        action="store_true",
        help="Skip RSS feed candidate lead collection",
    )
    parser.add_argument(
        "--vet-only",
        action="store_true",
        help="Only run candidate vetting without running full site inspections",
    )
    parser.add_argument(
        "--rebuild-only",
        action="store_true",
        help="Only rebuild README and docs/index.html",
    )

    args = parser.parse_args()
    code = run_pipeline(
        dry_run=args.dry_run,
        skip_inspection=args.skip_inspection,
        skip_collection=args.skip_collection,
        vet_only=args.vet_only,
        rebuild_only=args.rebuild_only,
    )
    sys.exit(code)


if __name__ == "__main__":
    main()
