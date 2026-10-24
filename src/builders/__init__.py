"""
CoursePulse Builders Module.
Orchestrates static generation of README.md and docs/index.html dashboard
with SHA-256 fingerprint caching to avoid redundant rebuilds.
"""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any

from src.builders.html_builder import build_html_file
from src.builders.readme_builder import build_readme_file
from src.io_utils import load_courses_database
from src.models import CoursesDatabase


def _compute_build_fingerprint(base_dir: Path) -> str:
    """Computes a SHA-256 hash of data/courses.json and builder source files."""
    hasher = hashlib.sha256()

    courses_json = base_dir / "data" / "courses.json"
    if courses_json.exists():
        hasher.update(courses_json.read_bytes())

    for py_file in sorted((base_dir / "src" / "builders").glob("*.py")):
        hasher.update(py_file.read_bytes())

    return hasher.hexdigest()


def build_all(
    base_dir: Path | None = None,
    skip_if_unchanged: bool = False,
    force: bool = False,
) -> dict[str, str]:
    """
    Executes all builders (README and HTML dashboard).

    Args:
        base_dir: Root directory of free-course-tracker. Defaults to cwd.
        skip_if_unchanged: If True, skips rebuild if SHA-256 fingerprint matches.
        force: If True, forces full rebuild regardless of fingerprint.

    Returns:
        Dictionary mapping artifact name to its written file path.
    """
    if base_dir is None:
        base_dir = Path.cwd()

    courses_file = base_dir / "data" / "courses.json"
    readme_file = base_dir / "README.md"
    html_file = base_dir / "docs" / "index.html"
    fingerprint_file = base_dir / ".build_fingerprint"

    current_fingerprint = _compute_build_fingerprint(base_dir)

    if skip_if_unchanged and not force and fingerprint_file.exists():
        cached_fingerprint = fingerprint_file.read_text(encoding="utf-8").strip()
        if cached_fingerprint == current_fingerprint and readme_file.exists() and html_file.exists():
            return {
                "status": "skipped",
                "readme": str(readme_file),
                "html": str(html_file),
            }

    # Load and validate courses
    courses_db = load_courses_database(courses_file)

    # Build outputs
    build_readme_file(courses_db, readme_file)
    build_html_file(courses_db, html_file)

    # Persist build fingerprint
    fingerprint_file.write_text(current_fingerprint, encoding="utf-8")

    return {
        "status": "built",
        "readme": str(readme_file),
        "html": str(html_file),
    }


if __name__ == "__main__":
    result = build_all(force=True)
    print(f"Build completed: {result}")
