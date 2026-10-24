"""
Local CI Workflow & Data Integrity Validator for CoursePulse.
Runs pre-flight checks before pushing to remote repository.
"""

from __future__ import annotations

import json
from pathlib import Path
import sys
import jsonschema

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "courses.json"
SCHEMA_FILE = BASE_DIR / "data" / "schema.json"
WORKFLOW_FILE = BASE_DIR / ".github" / "workflows" / "tracker.yml"


def validate_all() -> bool:
    print("Running CoursePulse Pre-Flight CI Validation...")

    # 1. Validate Schema
    if not SCHEMA_FILE.exists() or not DATA_FILE.exists():
        print("FAIL: Data or schema file missing!")
        return False

    with open(SCHEMA_FILE, "r", encoding="utf-8") as sf:
        schema = json.load(sf)
    with open(DATA_FILE, "r", encoding="utf-8") as df:
        data = json.load(df)

    try:
        jsonschema.validate(instance=data, schema=schema)
        print("PASS: data/courses.json matches schema.")
    except Exception as e:
        print(f"FAIL: Schema validation failed: {e}")
        return False

    # 2. Check Workflow
    if not WORKFLOW_FILE.exists():
        print("FAIL: GitHub Actions workflow missing!")
        return False
    print("PASS: GitHub Actions workflow present.")

    # 3. Check Screenshots
    courses = data.get("courses", [])
    missing = []
    for c in courses:
        p = BASE_DIR / c.get("visual_proof", {}).get("screenshot_path", "")
        if not p.exists():
            missing.append(c.get("id"))

    if missing:
        print(f"FAIL: Missing screenshot proof for courses: {missing}")
        return False
    print(f"PASS: All {len(courses)} courses have verified visual screenshot proof.")

    print("ALL PRE-FLIGHT CHECKS PASSED.")
    return True


if __name__ == "__main__":
    success = validate_all()
    sys.exit(0 if success else 1)
