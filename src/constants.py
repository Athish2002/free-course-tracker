"""
CoursePulse System Constants, Paywall Signatures & Detection Patterns.
"""

from __future__ import annotations

import re

# Standard browser user-agent mimicking modern macOS Chromium
BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "DNT": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
}

STALENESS_THRESHOLD_DAYS: int = 30

# Traps that immediately fail the zero-paywall assertion
PAYWALL_TRAP_PATTERNS = [
    r"start\s+(?:your\s+)?(?:\d+[\s-]day\s+)?free\s+trial",
    r"credit\s+card\s+required",
    r"card\s+number,?\s+expiration",
    r"enter\s+(?:your\s+)?(?:credit\s+)?card",
    r"cancel\s+anytime\s+before\s+trial",
    r"cancel\s+anytime",
    r"\$\d+(?:\.\d{2})?\s*/\s*(?:month|year|mo|yr)",
    r"subscribe\s+to\s+unlock",
    r"purchase\s+to\s+view\s+remaining",
    r"upgrade\s+to\s+(?:pro|premium)\s+to\s+access",
    r"viewing\s+in\s+preview\s+mode",
    r"membership\s+required",
    r"paywall",
    r"subscription\s+billing",
    r"billed\s+(?:annually|monthly)",
    r"unlock\s+all\s+(?:modules|chapters|lectures)",
    r"enter\s+(?:your\s+)?payment\s+details",
]

# DOM selectors indicating locked content
LOCKED_MODULE_SELECTORS = [
    ".lock-icon",
    ".locked-module",
    ".module-locked",
    "[data-locked='true']",
    "[aria-disabled='true']",
    "[aria-label*='locked']",
    ".fa-lock",
    ".lucide-lock",
    ".premium-only",
]

# Patterns confirming genuine 100% open access
AFFIRMATIVE_OPEN_ACCESS_PATTERNS = [
    r"open\s+curriculum",
    r"no\s+credit\s+card\s+required",
    r"100%\s+free\s+open\s+source",
    r"start\s+learning\s+now",
    r"enroll\s+for\s+free",
    r"open\s+educational\s+resource",
    r"free\s+course",
    r"full\s+lecture\s+videos",
    r"free\s+certificate",
    r"free\s+verified\s+certificate",
    r"free\s+digital\s+badge",
    r"completely\s+open\s+access",
    r"freely\s+available",
]

# Whitelist of trusted university, foundation, and open course domains
TRUSTED_COURSE_DOMAINS = [
    "harvard.edu",
    "mit.edu",
    "stanford.edu",
    "helsinki.fi",
    "elementsofai.com",
    "freecodecamp.org",
    "theodinproject.com",
    "kaggle.com",
    "deeplearning.ai",
    "cloudskillsboost.google",
    "learn.microsoft.com",
    "netacad.com",
    "learn.mongodb.com",
    "open.edu",
    "cmu.edu",
    "berkeley.edu",
    "princeton.edu",
    "ox.ac.uk",
    "cam.ac.uk",
]
