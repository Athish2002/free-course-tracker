#!/usr/bin/env python3
"""
CoursePulse link check.
Loads each course URL with a plain HTTP request and records whether it answered, and whether it
ended up on a different site (a lapsed domain usually redirects to a parking or for-sale page).
It does not check what the page says about cost or content. Standard library only.
"""

import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
TIMEOUT_SECS = 15


def _host(url):
    host = (urllib.parse.urlsplit(url).hostname or "").lower()
    return host[4:] if host.startswith("www.") else host


def check_url(url):
    """Returns ok=True only for a successful answer that stayed on the same site."""
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        },
    )
    try:
        t0 = time.time()
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECS) as resp:
            latency_ms = int((time.time() - t0) * 1000)
            final_url = resp.geturl()
            if _host(final_url) != _host(url):
                return {"ok": False, "status": resp.status, "latency_ms": latency_ms, "final_url": final_url,
                        "error": f"Redirected to another site: {_host(final_url)}"}
            # Parked domains often serve a tiny page that redirects in JavaScript, which this client does not
            # run (cs61b.org did this in Nov 2026: 1.7 KB, empty title). Script-rendered course sites also have
            # empty titles but are larger (8 KB and up when measured), so only small untitled pages are flagged.
            # This is a heuristic: a flagged link needs a person to open it.
            body = resp.read(300_000).decode("utf-8", "replace")
            title = re.search(r"<title[^>]*>(.*?)</title>", body, re.I | re.S)
            if (not title or not title.group(1).strip()) and len(body.encode("utf-8")) < 4000:
                return {"ok": False, "status": resp.status, "latency_ms": latency_ms, "final_url": final_url,
                        "error": "Page has no title (possibly a parked domain or a script redirect)"}
            return {"ok": True, "status": resp.status, "latency_ms": latency_ms, "final_url": final_url, "error": None}
    except urllib.error.HTTPError as e:
        # A 403 is often bot protection, but it is not a successful answer: report it, do not count it as reachable.
        return {"ok": False, "status": e.code, "latency_ms": 0, "final_url": url, "error": f"HTTP {e.code}"}
    except Exception as e:
        return {"ok": False, "status": 0, "latency_ms": 0, "final_url": url, "error": str(e)}


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    catalog_path = os.path.join(root, "data", "courses.json")
    report_path = os.path.join(root, "health-report.md")

    if not os.path.exists(catalog_path):
        print(f"Error: {catalog_path} not found.")
        sys.exit(1)

    with open(catalog_path, "r", encoding="utf-8") as f:
        courses = json.load(f)

    print(f"Checking {len(courses)} course links...")

    results = []
    failed = []

    for idx, c in enumerate(courses):
        title = c.get("title", "Untitled")
        url = c.get("url", "")
        print(f"[{idx + 1}/{len(courses)}] {title[:40]}...")
        res = check_url(url)
        results.append({"course": c, "check": res})

        if not res["ok"]:
            failed.append((c, res))
            print(f"  [NOT REACHABLE] {res['error']}")
        else:
            print(f"  [OK] Status {res['status']} ({res['latency_ms']}ms)")

    lines = [
        "# CoursePulse Link Check",
        "",
        "Each course URL was requested once with a plain HTTP client. Reachable means it answered and stayed on "
        "the same site. This does not check cost, content, or whether the course is still offered.",
        "",
        f"**Checked at:** {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}",
        f"**Courses checked:** {len(courses)}",
        f"**Reachable:** {len(courses) - len(failed)}",
        f"**Not reachable or moved:** {len(failed)}",
        "",
        "## Results",
        "",
        "| Course Title | Provider | Status | Latency | Course URL |",
        "| :--- | :--- | :---: | :---: | :--- |",
    ]

    for item in results:
        c = item["course"]
        h = item["check"]
        status = f"`{h['status']}`" if h["ok"] else f"**{h['error']}**"
        latency = f"{h['latency_ms']}ms" if h["latency_ms"] else "-"
        lines.append(f"| {c['title']} | {c['provider']} | {status} | {latency} | [Link]({c['url']}) |")

    if failed:
        lines += ["", "## Needs a look", ""]
        for c, h in failed:
            lines.append(f"- **{c['title']}** (`{c['id']}`): {h['error']} -> {c['url']}")

    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"\nLink check finished. Report saved to {report_path}")
    print(f"Reachable: {len(courses) - len(failed)} / {len(courses)}")

    if len(failed) > 5:
        print("More than 5 course links are not reachable or moved. Failing so someone looks.")
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
