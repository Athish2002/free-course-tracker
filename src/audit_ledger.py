"""
Cryptographic Append-Only Audit Ledger & Log Compaction Engine.
"""

from __future__ import annotations

import gzip
import hashlib
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger("coursepulse.audit_ledger")
DEFAULT_LEDGER_PATH = Path(__file__).resolve().parent.parent / "data" / "audit_log.jsonl"


def record_audit_entry(
    course_id: str,
    action: str,
    status: str,
    notes: str,
    is_paywall_free: bool,
    ledger_path: Path | None = None
) -> None:
    """Appends an immutable SHA-256 attested audit record to audit_log.jsonl."""
    target_path = Path(ledger_path) if ledger_path else DEFAULT_LEDGER_PATH
    target_path.parent.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(timezone.utc).isoformat()
    record = {
        "timestamp": timestamp,
        "course_id": course_id,
        "action": action,
        "status": status,
        "is_paywall_free": is_paywall_free,
        "notes": notes,
    }
    raw_str = json.dumps(record, sort_keys=True)
    record["attestation_sha256"] = hashlib.sha256(raw_str.encode("utf-8")).hexdigest()

    with open(target_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")


def compact_audit_log(
    ledger_path: Path | None = None,
    archive_path: Path | None = None,
    max_records: int = 500,
    keep_records: int = 200
) -> int:
    """Compacts older audit log records into a gzip archive if max_records is exceeded."""
    target_path = Path(ledger_path) if ledger_path else DEFAULT_LEDGER_PATH
    if not target_path.exists():
        return 0

    with open(target_path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    if len(lines) <= max_records:
        return 0

    archive_target = Path(archive_path) if archive_path else target_path.parent / "audit_log_archive.jsonl.gz"
    older_lines = lines[:-keep_records]
    recent_lines = lines[-keep_records:]

    with gzip.open(archive_target, "at", encoding="utf-8") as gz:
        for line in older_lines:
            gz.write(line + "\n")

    with open(target_path, "w", encoding="utf-8") as f:
        for line in recent_lines:
            f.write(line + "\n")

    archived_count = len(older_lines)
    logger.info("Compacted %d audit records into %s", archived_count, archive_target.name)
    return archived_count
