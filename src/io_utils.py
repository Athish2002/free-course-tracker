"""
Atomic file persistence and JSON schema validation utilities.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any
import jsonschema

from src.models import CoursesDatabase

logger = logging.getLogger("coursepulse.io_utils")


def load_json(file_path: Path) -> Any:
    """Reads and parses a JSON file with UTF-8 encoding."""
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def atomic_write_json(file_path: Path, data: Any, schema_path: Path | None = None) -> None:
    """
    Atomically writes JSON payload to disk using a temporary file rename.
    Optionally validates against a JSON schema prior to disk replacement.
    """
    file_path = Path(file_path)
    file_path.parent.mkdir(parents=True, exist_ok=True)

    if schema_path is not None and schema_path.exists():
        with open(schema_path, "r", encoding="utf-8") as sf:
            schema = json.load(sf)
        jsonschema.validate(instance=data, schema=schema)

    temp_path = file_path.with_suffix(".tmp")
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    temp_path.replace(file_path)
    logger.info("Atomically updated %s", file_path.name)


def load_courses_database(file_path: Path, schema_path: Path | None = None) -> CoursesDatabase:
    """Loads and validates courses.json into a Pydantic CoursesDatabase model."""
    data = load_json(file_path)
    if schema_path is not None and schema_path.exists():
        with open(schema_path, "r", encoding="utf-8") as sf:
            schema = json.load(sf)
        jsonschema.validate(instance=data, schema=schema)

    return CoursesDatabase.model_validate(data)


def save_courses_database(file_path: Path, db: CoursesDatabase, schema_path: Path | None = None) -> None:
    """Atomically serializes and persists CoursesDatabase to disk."""
    data = db.model_dump(by_alias=True)
    atomic_write_json(file_path, data, schema_path=schema_path)
