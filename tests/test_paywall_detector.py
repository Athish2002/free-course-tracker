"""
Unit tests for Paywall and Freemium Detection Engine in CoursePulse.
"""

from src.paywall_detector import detect_paywall, PaywallDetector


def test_detect_clean_open_access_page():
    clean_text = (
        "Welcome to CS50x. This course is completely open access. "
        "All course materials are freely available. You can view all video lectures, "
        "download problem sets, and submit for automated grading at no cost."
    )
    result = detect_paywall(page_text=clean_text)
    assert result["is_paywall_free"] is True
    assert result["trial_trap_detected"] is False
    assert result["locked_modules_detected"] is False
    assert result["syllabus_completeness_pct"] == 100
    assert result["verdict"] == "VERIFIED_100PCT_FREE"
    assert len(result["detected_open_signals"]) > 0


def test_detect_trial_trap():
    trap_text = (
        "Start your learning journey today! Start your 7-day free trial now. "
        "A valid credit card is required to begin. Subscription will renew automatically "
        "at $49/month unless cancelled."
    )
    result = detect_paywall(page_text=trap_text)
    assert result["is_paywall_free"] is False
    assert result["trial_trap_detected"] is True
    assert result["verdict"] == "REJECTED_TRIAL_TRAP"
    assert "7-day free trial" in [t.lower() for t in result["detected_traps"]] or any("trial" in t.lower() for t in result["detected_traps"])


def test_detect_credit_card_demand():
    card_text = "Please enter your card number, expiration date, and security code to enroll."
    result = detect_paywall(page_text=card_text)
    assert result["is_paywall_free"] is False
    assert result["trial_trap_detected"] is True


def test_detect_locked_modules_in_dom():
    clean_text = "Complete Python Masterclass."
    dom_with_locks = """
    <div class="syllabus-outline">
        <div class="module-unlocked">Module 1: Introduction</div>
        <div class="module-locked" aria-label="locked content">Module 2: Advanced OOP (Pro Only)</div>
    </div>
    """
    result = detect_paywall(page_text=clean_text, dom_html=dom_with_locks)
    assert result["is_paywall_free"] is False
    assert result["locked_modules_detected"] is True
    assert result["verdict"] == "FREEMIUM_LOCKED"


def test_custom_detector_instance():
    detector = PaywallDetector()
    res = detector.evaluate_content(
        page_text="Affordable plans from $39/month. Cancel anytime.",
        matched_lock_selectors_count=0,
    )
    assert res["is_paywall_free"] is False
    assert res["trial_trap_detected"] is True
