"""
Anti-Paywall & Freemium Lock Detector for CoursePulse.
Scans page text and DOM elements for subscription traps, 7-day trials, and locked modules.
"""

from __future__ import annotations

import re
from typing import Any
from src.constants import (
    PAYWALL_TRAP_PATTERNS,
    LOCKED_MODULE_SELECTORS,
    AFFIRMATIVE_OPEN_ACCESS_PATTERNS,
)


class PaywallDetector:
    """Evaluates rendered page text and DOM selectors for paywall invariants."""

    def __init__(self) -> None:
        self.trap_regexes = [re.compile(p, re.IGNORECASE) for p in PAYWALL_TRAP_PATTERNS]
        self.open_regexes = [re.compile(p, re.IGNORECASE) for p in AFFIRMATIVE_OPEN_ACCESS_PATTERNS]

    def evaluate_content(
        self,
        page_text: str,
        dom_html: str = "",
        matched_lock_selectors_count: int = 0
    ) -> dict[str, Any]:
        """
        Analyzes page text and DOM for subscription paywalls and free-trial traps.
        """
        text_lower = page_text.lower() if page_text else ""
        dom_lower = dom_html.lower() if dom_html else ""

        # 1. Detect subscription traps & credit card demands
        detected_traps: list[str] = []
        for regex in self.trap_regexes:
            match = regex.search(text_lower)
            if match:
                detected_traps.append(match.group(0))

        # 2. Detect locked modules in DOM
        locked_detected = matched_lock_selectors_count > 0
        if not locked_detected and dom_lower:
            for sel in LOCKED_MODULE_SELECTORS:
                if sel.startswith("."):
                    cls_name = sel[1:]
                    if cls_name in dom_lower:
                        locked_detected = True
                        break
                elif "locked" in sel and "locked" in dom_lower:
                    locked_detected = True
                    break
                else:
                    clean_sel = sel.replace(".", "").replace("[", "").replace("]", "").replace("'", "")
                    if clean_sel in dom_lower:
                        locked_detected = True
                        break

        # 3. Detect affirmative open access signals
        detected_open_signals: list[str] = []
        for regex in self.open_regexes:
            match = regex.search(text_lower)
            if match:
                detected_open_signals.append(match.group(0))

        # Decision invariant
        has_traps = len(detected_traps) > 0
        is_paywall_free = not has_traps and not locked_detected
        completeness_pct = 100 if is_paywall_free else (60 if has_traps else 80)

        verdict = "VERIFIED_100PCT_FREE"
        if has_traps:
            verdict = "REJECTED_TRIAL_TRAP"
        elif locked_detected:
            verdict = "FREEMIUM_LOCKED"

        return {
            "is_paywall_free": is_paywall_free,
            "trial_trap_detected": has_traps,
            "locked_modules_detected": locked_detected,
            "detected_traps": detected_traps,
            "detected_open_signals": detected_open_signals,
            "syllabus_completeness_pct": completeness_pct,
            "verdict": verdict,
        }


def detect_paywall(page_text: str, dom_html: str = "") -> dict[str, Any]:
    """Convenience helper executing PaywallDetector."""
    return PaywallDetector().evaluate_content(page_text=page_text, dom_html=dom_html)
