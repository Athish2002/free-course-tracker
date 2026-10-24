"""
Domain Authenticity & Anti-Scam Screening Gate for CoursePulse.
"""

from __future__ import annotations

import logging
from typing import Any
from urllib.parse import urlparse

from src.constants import TRUSTED_COURSE_DOMAINS

logger = logging.getLogger("coursepulse.authenticity")


def audit_course_authenticity(
    course_or_url: dict[str, Any] | str,
    title: str | None = None,
) -> dict[str, Any]:
    """
    Evaluates course provider authenticity, domain legitimacy, and security invariants.
    Accepts either a course dict or a URL string.
    Returns structured audit result with boolean verdict, confidence score, and explanation.
    """
    if isinstance(course_or_url, dict):
        url = course_or_url.get("url", "").strip()
        if not title:
            title = course_or_url.get("title", "")
    else:
        url = str(course_or_url).strip()

    if not url:
        return {
            "is_authentic": False,
            "score": 0,
            "verdict": "REJECTED_UNTRUSTED",
            "reason": "Missing or empty course URL",
            "domain": "",
            "is_trusted_domain": False,
        }

    parsed = urlparse(url)
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()

    if scheme not in ("https", "http"):
        return {
            "is_authentic": False,
            "score": 0,
            "verdict": "REJECTED_UNTRUSTED",
            "reason": f"Insecure or unsupported scheme: {scheme}",
            "domain": netloc,
            "is_trusted_domain": False,
        }

    # Normalize netloc (remove www.)
    domain = netloc[4:] if netloc.startswith("www.") else netloc

    # Check against trusted academic and non-profit domains
    is_trusted_domain = any(domain == td or domain.endswith(f".{td}") for td in TRUSTED_COURSE_DOMAINS)
    is_edu_domain = domain.endswith(".edu") or domain.endswith(".ac.uk") or domain.endswith(".edu.au")

    score = 50
    if is_trusted_domain:
        score += 45
    elif is_edu_domain:
        score += 40

    if scheme == "https":
        score += 5

    is_authentic = score >= 75
    verdict = "GENUINE_OPEN_COURSE" if score >= 80 else ("SUSPICIOUS_UNTRUSTED" if score < 60 else "NEUTRAL_REVIEW")
    reason = (
        f"Domain '{domain}' verified via institutional trust registry (score: {score})"
        if is_authentic
        else f"Domain '{domain}' not in trusted academic/open registry (score: {score})"
    )

    return {
        "is_authentic": is_authentic,
        "score": min(score, 100),
        "verdict": verdict,
        "reason": reason,
        "domain": domain,
        "is_trusted_domain": is_trusted_domain or is_edu_domain,
    }
