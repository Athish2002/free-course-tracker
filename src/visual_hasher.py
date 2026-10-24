"""
Perceptual Visual Hasher & Delta-Skipping Engine for CoursePulse.
Uses 64-bit difference hashing (dhash) to prevent Git repository churn when portal UI is unchanged.
"""

from __future__ import annotations

import io
from pathlib import Path
from PIL import Image


def compute_dhash(image_bytes: bytes, hash_size: int = 8) -> int:
    """Computes a 64-bit difference hash (dhash) of an image."""
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            gray = img.convert("L").resize((hash_size + 1, hash_size), Image.Resampling.LANCZOS)
            pixels = list(gray.get_flattened_data()) if hasattr(gray, "get_flattened_data") else list(gray.getdata())

            diff = 0
            for row in range(hash_size):
                row_offset = row * (hash_size + 1)
                for col in range(hash_size):
                    diff <<= 1
                    if pixels[row_offset + col] > pixels[row_offset + col + 1]:
                        diff |= 1
            return diff
    except Exception:
        return 0


def hamming_distance(h1: int, h2: int) -> int:
    """Computes bitwise Hamming distance between two integer hashes."""
    return bin(h1 ^ h2).count("1")


def should_skip_screenshot_write(
    existing_file_path: Path,
    new_image_bytes: bytes,
    distance_threshold: int = 4
) -> bool:
    """Returns True if new screenshot is visually near-identical to the existing file."""
    if not existing_file_path.exists():
        return False
    try:
        existing_bytes = existing_file_path.read_bytes()
        h_old = compute_dhash(existing_bytes)
        h_new = compute_dhash(new_image_bytes)
        dist = hamming_distance(h_old, h_new)
        return dist <= distance_threshold
    except Exception:
        return False
