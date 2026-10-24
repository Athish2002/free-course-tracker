"""
Candidate Course Lead Ingestion Engine.
Scrapes university RSS feeds, educational publication dispatches, and public community leads.
"""

from __future__ import annotations

import hashlib
import logging
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from urllib.parse import urlparse
import httpx

from src.constants import BROWSER_HEADERS

logger = logging.getLogger("coursepulse.collector")

COURSE_FEEDS = [
    {
        "name": "MIT OpenCourseWare New Courses",
        "url": "https://ocw.mit.edu/rss/new_courses.xml",
        "institution": "MIT",
        "platform": "MIT OpenCourseWare",
        "category": "Computer Science",
    },
    {
        "name": "freeCodeCamp News Feed",
        "url": "https://www.freecodecamp.org/news/rss/",
        "institution": "freeCodeCamp",
        "platform": "freeCodeCamp.org",
        "category": "Web Development",
    },
]


def generate_lead_id(url: str, title: str) -> str:
    """Generates deterministic SHA-256 slug identifier."""
    raw = f"{url.strip().lower()}:{title.strip().lower()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def fetch_course_leads() -> list[dict[str, Any]]:
    """Fetches candidate course announcements from official institutional RSS feeds."""
    leads: list[dict[str, Any]] = []

    for feed_info in COURSE_FEEDS:
        try:
            with httpx.Client(headers=BROWSER_HEADERS, timeout=10.0, follow_redirects=True) as client:
                resp = client.get(feed_info["url"])
                if resp.status_code != 200:
                    continue

                root = ET.fromstring(resp.content)
                items = root.findall(".//item")
                for item in items[:10]:
                    title_elem = item.find("title")
                    link_elem = item.find("link")
                    title = title_elem.text.strip() if title_elem is not None and title_elem.text else ""
                    link = link_elem.text.strip() if link_elem is not None and link_elem.text else ""

                    if not title or not link:
                        continue

                    leads.append({
                        "lead_id": generate_lead_id(link, title),
                        "title": title,
                        "url": link,
                        "institution": feed_info["institution"],
                        "platform": feed_info["platform"],
                        "category": feed_info["category"],
                        "discovered_at": datetime.now(timezone.utc).isoformat(),
                    })
        except Exception as e:
            logger.warning("Feed ingestion error on %s: %s", feed_info["name"], e)

    return leads
