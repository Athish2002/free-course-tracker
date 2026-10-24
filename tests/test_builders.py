"""
Unit tests for CoursePulse Static Builders (README & HTML Dashboard).
"""

from pathlib import Path
import tempfile
import shutil

from src.models import CoursesDatabase
from src.io_utils import load_courses_database
from src.builders.readme_builder import generate_readme, build_readme_file
from src.builders.html_builder import generate_html_dashboard, build_html_file
from src.builders import build_all

BASE_DIR = Path(__file__).resolve().parent.parent
COURSES_FILE = BASE_DIR / "data" / "courses.json"


def test_readme_builder_generation():
    courses_db = load_courses_database(COURSES_FILE)
    readme_text = generate_readme(courses_db)

    assert "# CoursePulse" in readme_text
    assert "Real-Time Directory Telemetry" in readme_text
    assert "Directory Catalog by Category" in readme_text
    assert f"Active Audited Courses**: `{courses_db.active_courses}` / `{courses_db.total_courses}`" in readme_text
    assert "CS50x" in readme_text
    assert "MIT" in readme_text


def test_html_builder_generation():
    courses_db = load_courses_database(COURSES_FILE)
    html_text = generate_html_dashboard(courses_db)

    assert "<!DOCTYPE html>" in html_text
    assert "CoursePulse" in html_text
    assert "searchInput" in html_text
    assert "proofModal" in html_text
    assert "COURSES_DATA" in html_text
    assert "bento-card" in html_text
    assert f"id=\"stat-total\">{courses_db.total_courses}</span>" in html_text


def test_build_all_execution_and_fingerprint():
    # Run build_all with force=True
    res = build_all(base_dir=BASE_DIR, force=True)
    assert res["status"] == "built"
    assert Path(res["readme"]).exists()
    assert Path(res["html"]).exists()

    # Second call with skip_if_unchanged=True should return skipped
    res_skipped = build_all(base_dir=BASE_DIR, skip_if_unchanged=True)
    assert res_skipped["status"] == "skipped"
