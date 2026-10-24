"""
Integration tests for Candidate Lead Collection, Audit Ledger, Visual Hasher,
and Stale Course Flagging in CoursePulse.
"""

from pathlib import Path
import tempfile
import json
import respx
import httpx
import pytest

from src.collector import fetch_course_leads, generate_lead_id
from src.audit_ledger import record_audit_entry, compact_audit_log
from src.visual_hasher import compute_dhash, hamming_distance, should_skip_screenshot_write
from src.inspector import check_and_flag_stale_courses


def test_generate_lead_id_deterministic():
    id1 = generate_lead_id("https://ocw.mit.edu/courses/18-06/", "Linear Algebra")
    id2 = generate_lead_id("https://ocw.mit.edu/courses/18-06/", "Linear Algebra")
    id3 = generate_lead_id("https://ocw.mit.edu/courses/6-006/", "Algorithms")

    assert id1 == id2
    assert id1 != id3
    assert len(id1) == 16


@respx.mock
def test_fetch_course_leads_mocked():
    sample_rss = """<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>MIT OpenCourseWare</title>
        <item>
          <title>Introduction to Computational Thinking</title>
          <link>https://ocw.mit.edu/courses/6-0002/</link>
        </item>
      </channel>
    </rss>
    """
    respx.get("https://ocw.mit.edu/rss/new_courses.xml").mock(
        return_value=httpx.Response(200, text=sample_rss)
    )
    respx.get("https://www.freecodecamp.org/news/rss/").mock(
        return_value=httpx.Response(404)
    )

    leads = fetch_course_leads()
    assert len(leads) >= 1
    found = [l for l in leads if "Computational Thinking" in l["title"]]
    assert len(found) == 1
    assert found[0]["url"] == "https://ocw.mit.edu/courses/6-0002/"
    assert found[0]["institution"] == "MIT"


def test_audit_ledger_recording_and_compaction():
    with tempfile.TemporaryDirectory() as tmpdir:
        ledger_file = Path(tmpdir) / "audit_log.jsonl"
        archive_file = Path(tmpdir) / "audit_log.archive.jsonl.gz"

        # Record 5 entries
        for i in range(5):
            record_audit_entry(
                course_id=f"course-{i}",
                action="VERIFIED",
                status="Active",
                notes="Paywall free",
                is_paywall_free=True,
                ledger_path=ledger_file,
            )

        assert ledger_file.exists()
        lines = ledger_file.read_text(encoding="utf-8").strip().split("\n")
        assert len(lines) == 5

        # Parse one entry
        entry = json.loads(lines[0])
        assert entry["course_id"] == "course-0"
        assert "attestation_sha256" in entry

        # Test compaction
        compacted = compact_audit_log(
            ledger_path=ledger_file,
            archive_path=archive_file,
            max_records=3,
            keep_records=2,
        )
        assert compacted == 3
        assert archive_file.exists()
        remaining_lines = ledger_file.read_text(encoding="utf-8").strip().split("\n")
        assert len(remaining_lines) == 2


def test_visual_hasher_metrics():
    # Construct synthetic 100x100 PNGs
    from PIL import Image
    import io

    img1 = Image.new("RGB", (100, 100), color=(255, 255, 255))
    buf1 = io.BytesIO()
    img1.save(buf1, format="PNG")
    bytes1 = buf1.getvalue()

    img2 = Image.new("RGB", (100, 100), color=(0, 0, 0))
    buf2 = io.BytesIO()
    img2.save(buf2, format="PNG")
    bytes2 = buf2.getvalue()

    hash1 = compute_dhash(bytes1)
    hash2 = compute_dhash(bytes2)

    # Identical image check
    assert hamming_distance(hash1, hash1) == 0

    with tempfile.TemporaryDirectory() as tmpdir:
        f_path = Path(tmpdir) / "test.png"
        f_path.write_bytes(bytes1)

        # Same bytes should skip
        assert should_skip_screenshot_write(f_path, bytes1) is True


def test_check_and_flag_stale_courses():
    courses = [
        {"id": "fresh", "status": "Active", "verification_date": "2026-10-24"},
        {"id": "stale", "status": "Active", "verification_date": "2020-01-01"},
    ]
    stale_count = check_and_flag_stale_courses(courses, threshold_days=30)
    assert stale_count == 1
    assert courses[0]["status"] == "Active"
    assert courses[1]["status"] == "Review Needed"
    assert "Stale" in courses[1]["inspection_notes"]
