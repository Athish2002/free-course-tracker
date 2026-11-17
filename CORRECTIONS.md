# Corrections

Things this project published that were wrong or unsupported, and what changed. Newest first.

## 2026-11-17: verification claims, the diploma, and unsourced "free" labels

The live site and README (30 courses at the time) said things that no check supported. Found and fixed in a review of the whole repository; course pages were read on 2026-11-17 by an AI agent (Claude Opus 5.5), not yet re-read by a person.

**Removed: the "Verified Course Diploma".** The course dialog offered a downloadable 1200×750 PNG titled "Certificate of Curriculum Completion", with "Curriculum Provided by" the university's name, a gold "verification medallion", "OFFICIAL CURRICULUM", "ALL MODULES VERIFIED" and a `CP-VERIFY-` code. The README described it as having "cryptographic verification hashes and seals". It was drawn from checkboxes the user ticks themselves, and the code was a 32-bit string hash of the course id, title and number of ticked boxes: anyone could reproduce it, and it verified nothing. A document like that can be mistaken for a credential issued by the university, so the feature was removed.

**Removed: drawn imitations of university logos.** `assets/app.js` held hand-drawn SVGs labelled an "Authentic University & Educational Institution Vector Logo Bank" (Harvard, MIT, Stanford, CMU and others). They were not the institutions' marks, and showing them next to each course could suggest an affiliation. Providers are now shown by their initial.

**Corrected: "30 Verified Free" and "100% paywall-free".** No check had established that any course was free. Each course now carries an access note from its own page, with the sentence quoted (`access` in `data/courses.json`). Of the 30 published courses, the pages said:

- Coursera's *Machine Learning Specialization* and *Deep Learning Specialization*: "Enroll for free" and "Financial aid available", without saying what is free. Now labelled "Check cost terms".
- *Introduction to Linux (LFS101x)* on edX: free registration and an audit option; a certificate is offered separately, price not shown.
- MIT OpenCourseWare, Stanford Engineering Everywhere, Google's ML Crash Course and the Missing Semester: public, but the page does not mention cost. Now labelled "Public; no cost stated".
- CMU 15-213: the website of CMU's current on-campus class, not a public course.
- All five freeCodeCamp courses: freeCodeCamp marks these sections as no longer updated and recommends its current curriculum.

**Corrected: module lists called "official".** The "Study Assist" prompt described the module list as "the official module breakdown" and the course as "the official curriculum". The lists were written for this site. A spot check of 8 courses against their pages found close matches for CS50x, CS50AI and Kaggle, and wrong or incomplete lists for fast.ai (7 entries against 8 Part 1 lessons: "From-scratch model" and "Random forests" are missing, and "The Training Loop: Learning Rate Finder, AdamW & Mixed Precision" matches no Part 1 lesson) and Full Stack Open (Parts 0-9 listed; the page has parts beyond 9). The app and README now say the checklists are written for this site.

**Corrected: hours.** *Intro to Machine Learning* (Kaggle) was listed at 15 hours; Kaggle's page says "3 hours to go". Now 3. Other hours are labelled as rough estimates.

**Corrected: the link check.** `scripts/check-catalog-health.py` counted HTTP 403 as healthy and reported "Healthy" and "Verified live" for pages it had only requested. It now counts only a successful answer that stays on the same site, flags small untitled pages (a sign of a parked domain), and says that it does not check cost or content.

**Corrected: other README claims.** "Autonomous" (nothing updates the course list automatically); an MIT licence badge (there is no licence file); "10.5:1 WCAG AAA" contrast (the computed ratio is 17.1:1); "88 topic tags" (117); app.js "~12 KB" (47 KB). `data/schema.json` described a different data format ("Verified Anti-Paywall Open Course Registry" with screenshot proofs) that nothing used; it now describes the real file. `data/candidates.json`, unused, said a domain was "verified via institutional trust registry"; no such registry exists, and the file was deleted.

**Not published, corrected before publishing.** 16 courses were added locally on 2026-11-14 and never committed. Of those:

- *CS 61B* (UC Berkeley) linked to `cs61b.org`, which has lapsed and now redirects to a page saying the domain "might be for sale". The old link check reported it as healthy. Removed.
- *CS 229, CS 224N, CS 231N, CS 110* (Stanford), *CS 61A, CS 61C* (Berkeley), *15-445* (CMU) and the *Oxford Deep NLP 2017* repository are class websites, not public courses. CS 231N's page says lecture videos are "accessible to enrolled Stanford students"; CS 224N's says current videos cannot be made "viewable by non-enrolled students" and points to a free 2024 YouTube playlist. Labelled "University class site". CS 110's page is the Winter 2022 class.
- *CSE 373* (University of Washington) did not load from here (connection timed out twice). Labelled "Not checked".

### Not yet corrected

- Module checklists for the 37 courses outside the spot check have not been compared with their pages.
- Hours other than Kaggle's are unchecked estimates.
- The access notes were read by an AI agent and have not been re-read by a person.
