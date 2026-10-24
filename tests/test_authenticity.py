"""
Unit tests for Domain Authenticity and Anti-Scam Screening in CoursePulse.
"""

from src.authenticity import audit_course_authenticity


def test_audit_authentic_academic_domain():
    url = "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python/"
    res = audit_course_authenticity(url, "MIT 6.0001")
    assert res["is_authentic"] is True
    assert res["is_trusted_domain"] is True
    assert res["score"] >= 80
    assert res["verdict"] == "GENUINE_OPEN_COURSE"


def test_audit_authentic_dict_input():
    course_dict = {
        "url": "https://cs50.harvard.edu/x/",
        "title": "CS50x",
    }
    res = audit_course_authenticity(course_dict)
    assert res["is_authentic"] is True
    assert "harvard.edu" in res["domain"]


def test_audit_authentic_nonprofit():
    url = "https://www.freecodecamp.org/learn/responsive-web-design/"
    res = audit_course_authenticity(url)
    assert res["is_authentic"] is True
    assert res["verdict"] == "GENUINE_OPEN_COURSE"


def test_audit_untrusted_scam_domain():
    url = "https://freepremiumcerts-getrichquick.biz/course-free"
    res = audit_course_authenticity(url)
    assert res["is_authentic"] is False
    assert res["is_trusted_domain"] is False
    assert res["score"] < 75


def test_audit_invalid_empty_url():
    res = audit_course_authenticity("")
    assert res["is_authentic"] is False
    assert res["verdict"] == "REJECTED_UNTRUSTED"


def test_audit_insecure_scheme():
    res = audit_course_authenticity("ftp://mit.edu/course")
    assert res["is_authentic"] is False
    assert "unsupported scheme" in res["reason"]
