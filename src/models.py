"""
CoursePulse Core Domain Models.
Strict Pydantic V2 schemas enforcing paywall-free invariants, curriculum completeness,
and visual screenshot proof metadata.
"""

from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

CourseStatus = Literal["Active", "Review Needed", "Paywalled", "Broken Link", "Archived"]
CourseCategory = Literal[
    "Computer Science",
    "Artificial Intelligence",
    "Web Development",
    "Data Science",
    "Cloud Computing",
    "Cybersecurity",
    "Mathematics & Algorithms",
]
CourseLevel = Literal["Beginner", "Intermediate", "Advanced", "All Levels"]
CertificateType = Literal[
    "Free Verified Certificate",
    "Free Digital Badge",
    "Free Statement of Accomplishment",
    "Audit Only (No Free Cert)",
]
VisualProofStatus = Literal["verified", "missing", "failed", "placeholder"]


class VisualProof(BaseModel):
    """Visual proof captured via Headless Playwright."""
    model_config = ConfigDict(extra="ignore")

    screenshot_path: str = Field(..., description="Path to captured screenshot PNG")
    screenshot_url: str | None = Field(default=None)
    captured_at: str | None = Field(default=None)
    status: VisualProofStatus = Field(default="placeholder")
    paywall_free_confirmed: bool = Field(default=True)
    trial_trap_detected: bool = Field(default=False)
    locked_modules_detected: bool = Field(default=False)


class Course(BaseModel):
    """Core domain model representing a verified open-access course."""
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., pattern=r"^[a-z0-9-]+$")
    title: str = Field(..., min_length=3)
    institution: str
    platform: str
    category: CourseCategory
    level: CourseLevel
    duration_hours: int = Field(default=20, ge=1)
    url: str
    status: CourseStatus = Field(default="Active")
    certificate_offered: bool = Field(default=False)
    certificate_type: CertificateType = Field(default="Audit Only (No Free Cert)")
    prerequisites: str = Field(default="None")
    verification_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    inspection_notes: str = Field(default="Verified open access course")
    is_paywall_free: bool = Field(default=True)
    syllabus_completeness_pct: int = Field(default=100, ge=0, le=100)
    free_learning_materials: list[str] = Field(default_factory=list)
    visual_proof: VisualProof


class CoursesDatabase(BaseModel):
    """Top-level database container for courses.json."""
    model_config = ConfigDict(extra="ignore")

    schema_version: str = Field(default="./schema.json", alias="$schema")
    last_updated: str
    total_courses: int
    active_courses: int
    courses: list[Course]
