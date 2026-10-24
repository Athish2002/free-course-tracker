"""
Invariant Audit & Zero-Defect Mathematical Invariants Test for CoursePulse.
Enforces that data/courses.json conforms to schema, models, visual proofs, and integrity invariants.
"""

from pathlib import Path
import json
import jsonschema

from src.models import CoursesDatabase, Course
from src.io_utils import load_courses_database, load_json

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
COURSES_FILE = DATA_DIR / "courses.json"
SCHEMA_FILE = DATA_DIR / "schema.json"
DOCS_DIR = BASE_DIR / "docs"


def test_schema_json_compliance():
    """Asserts data/courses.json conforms 100% to data/schema.json."""
    assert COURSES_FILE.exists(), f"Missing {COURSES_FILE}"
    assert SCHEMA_FILE.exists(), f"Missing {SCHEMA_FILE}"

    data = load_json(COURSES_FILE)
    schema = load_json(SCHEMA_FILE)

    # Validates without raising ValidationError
    jsonschema.validate(instance=data, schema=schema)


def test_pydantic_database_validation():
    """Asserts data/courses.json parses cleanly into Pydantic V2 CoursesDatabase."""
    db = load_courses_database(COURSES_FILE, SCHEMA_FILE)
    assert db.total_courses == len(db.courses)
    assert db.active_courses == sum(1 for c in db.courses if c.status == "Active")


def test_unique_course_ids_and_urls():
    """Asserts no duplicate course IDs or URLs exist in the database."""
    db = load_courses_database(COURSES_FILE)
    ids = [c.id for c in db.courses]
    urls = [c.url for c in db.courses]

    assert len(ids) == len(set(ids)), f"Duplicate IDs found: {set([x for x in ids if ids.count(x) > 1])}"
    assert len(urls) == len(set(urls)), f"Duplicate URLs found: {set([x for x in urls if urls.count(x) > 1])}"


def test_screenshot_files_exist_on_disk():
    """Asserts every course's visual_proof.screenshot_path points to an existing file."""
    db = load_courses_database(COURSES_FILE)
    missing_screenshots: list[str] = []

    for course in db.courses:
        rel_path = course.visual_proof.screenshot_path
        abs_path = BASE_DIR / rel_path
        if not abs_path.exists():
            missing_screenshots.append(f"{course.id}: {rel_path}")

    assert not missing_screenshots, f"Missing screenshots on disk: {missing_screenshots}"


def test_paywall_free_invariants():
    """Asserts all active courses have is_paywall_free=True and 100% syllabus completeness."""
    db = load_courses_database(COURSES_FILE)

    for course in db.courses:
        if course.status == "Active":
            assert course.is_paywall_free is True, f"Active course {course.id} must be paywall-free"
            assert course.syllabus_completeness_pct == 100, f"Course {course.id} syllabus incomplete"
            assert course.duration_hours > 0, f"Course {course.id} duration must be positive"
