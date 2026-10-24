"""
Unit tests for Pydantic V2 Domain Models in CoursePulse.
"""

import pytest
from pydantic import ValidationError

from src.models import Course, CoursesDatabase, VisualProof


def test_visual_proof_valid():
    proof = VisualProof(
        screenshot_path="docs/screenshots/sample.png",
        screenshot_url="https://example.com/screenshot.png",
        captured_at="2026-10-24T12:00:00Z",
        status="verified",
        paywall_free_confirmed=True,
    )
    assert proof.screenshot_path == "docs/screenshots/sample.png"
    assert proof.status == "verified"
    assert proof.paywall_free_confirmed is True


def test_course_valid_instantiation():
    course_data = {
        "id": "harvard-cs50x",
        "title": "CS50x: Introduction to Computer Science",
        "institution": "Harvard University",
        "platform": "Harvard Online / CS50",
        "category": "Computer Science",
        "level": "Beginner",
        "duration_hours": 120,
        "url": "https://cs50.harvard.edu/x/",
        "status": "Active",
        "certificate_offered": True,
        "certificate_type": "Free Verified Certificate",
        "prerequisites": "None",
        "verification_date": "2026-10-24",
        "inspection_notes": "Verified open access course",
        "is_paywall_free": True,
        "syllabus_completeness_pct": 100,
        "free_learning_materials": ["Lectures", "Problem Sets"],
        "visual_proof": {
            "screenshot_path": "docs/screenshots/harvard-cs50x.png",
            "status": "verified",
        },
    }
    course = Course.model_validate(course_data)
    assert course.id == "harvard-cs50x"
    assert course.is_paywall_free is True
    assert course.duration_hours == 120


def test_course_invalid_id_format():
    invalid_data = {
        "id": "Harvard CS50!",  # Contains invalid uppercase and special chars
        "title": "CS50x",
        "institution": "Harvard",
        "platform": "CS50",
        "category": "Computer Science",
        "level": "Beginner",
        "duration_hours": 10,
        "url": "https://example.com",
        "verification_date": "2026-10-24",
        "visual_proof": {"screenshot_path": "docs/screenshots/test.png"},
    }
    with pytest.raises(ValidationError):
        Course.model_validate(invalid_data)


def test_course_invalid_category():
    invalid_data = {
        "id": "sample-course",
        "title": "Sample Course",
        "institution": "Harvard",
        "platform": "CS50",
        "category": "Astrology & Alchemy",  # Invalid category
        "level": "Beginner",
        "duration_hours": 10,
        "url": "https://example.com",
        "verification_date": "2026-10-24",
        "visual_proof": {"screenshot_path": "docs/screenshots/test.png"},
    }
    with pytest.raises(ValidationError):
        Course.model_validate(invalid_data)


def test_course_invalid_duration():
    invalid_data = {
        "id": "sample-course",
        "title": "Sample Course",
        "institution": "Harvard",
        "platform": "CS50",
        "category": "Computer Science",
        "level": "Beginner",
        "duration_hours": 0,  # Must be >= 1
        "url": "https://example.com",
        "verification_date": "2026-10-24",
        "visual_proof": {"screenshot_path": "docs/screenshots/test.png"},
    }
    with pytest.raises(ValidationError):
        Course.model_validate(invalid_data)


def test_courses_database_validation():
    db_data = {
        "$schema": "./schema.json",
        "last_updated": "2026-10-24T12:00:00Z",
        "total_courses": 1,
        "active_courses": 1,
        "courses": [
            {
                "id": "sample-course",
                "title": "Sample Course",
                "institution": "MIT",
                "platform": "MIT OCW",
                "category": "Computer Science",
                "level": "Beginner",
                "duration_hours": 10,
                "url": "https://ocw.mit.edu/courses/test",
                "status": "Active",
                "verification_date": "2026-10-24",
                "visual_proof": {"screenshot_path": "docs/screenshots/test.png"},
            }
        ],
    }
    db = CoursesDatabase.model_validate(db_data)
    assert db.total_courses == 1
    assert len(db.courses) == 1
    assert db.courses[0].id == "sample-course"
