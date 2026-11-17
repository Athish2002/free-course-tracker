# CoursePulse

A hand-picked list of 45 open computer science, web and AI courses, with a progress tracker that runs in your browser. No account; your progress stays in your browser's local storage.

Live site: https://athish2002.github.io/free-course-tracker/

## What "free" means here

Each course carries an access note taken from its own page, with the sentence quoted and the date it was read (`access` in `data/courses.json`). A course is labelled **Free** only when a sentence on the provider's page says so. The notes were read by an AI agent on 2026-11-17 and have not yet been re-read by a person. Terms change: check the course page before you rely on one.

| Access label | Courses |
| :--- | :---: |
| Free (page says so) | 20 |
| Free; certificate costs | 2 |
| Public; no cost stated | 11 |
| University class site | 9 |
| Check cost terms | 2 |
| Not checked | 1 |

- **University class site**: a university's website for its own enrolled students. Some materials are public, but it is not run as a public course, and some pages say videos are for enrolled students only.
- **Check cost terms**: the page offers free enrolment but does not say which parts are free and which are paid.

What is *not* checked:

- **Module checklists** were written for this site. They are not copied from the courses and may not match a course's own structure. A spot check of 8 courses on 2026-11-17 found close matches for CS50x, CS50AI and Kaggle, and wrong or incomplete lists for fast.ai and Full Stack Open.
- **Hours** are rough estimates written for this site, except where the access note quotes the provider's own figure.
- **Links** are checked weekly by `scripts/check-catalog-health.py`. That check says whether a page answered and stayed on the same site. It does not check cost or content.

## Courses

### Computer Science (15)

| Course | Provider | Level | Rough hours | Access (from the course page) |
| :--- | :--- | :---: | :---: | :--- |
| [CS50x: Introduction to Computer Science](https://cs50.harvard.edu/x/) | Harvard University | Beginner | ~120 | **Free (page says so).** Free through Harvard's OpenCourseWare. A verified or professional certificate is offered separately through edX; this page does not state its price. |
| [CS50P: Introduction to Programming with Python](https://cs50.harvard.edu/python/) | Harvard University | Beginner | ~80 | **Free (page says so).** Free through Harvard's OpenCourseWare. Certificates are offered separately through edX; this page does not state their price. |
| [JavaScript Algorithms and Data Structures](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8) | freeCodeCamp | Beginner | ~300 | **Free (page says so).** Free. freeCodeCamp marks this section as no longer updated and recommends its current curriculum instead. |
| [Relational Databases Certification](https://www.freecodecamp.org/learn/relational-database) | freeCodeCamp | Intermediate | ~200 | **Free (page says so).** Free. freeCodeCamp marks this section as no longer updated and recommends its current curriculum instead. |
| [6.0001: Intro to CS & Programming in Python](https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/) | MIT OpenCourseWare | Beginner | ~75 | **Public; no cost stated.** MIT OpenCourseWare materials from a past MIT term, published under a Creative Commons licence. The page does not mention a cost. |
| [6.006: Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/) | MIT OpenCourseWare | Advanced | ~110 | **Public; no cost stated.** MIT OpenCourseWare materials from a past MIT term, published under a Creative Commons licence. The page does not mention a cost. |
| [6.004: Computation Structures](https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/) | MIT OpenCourseWare | Advanced | ~95 | **Public; no cost stated.** MIT OpenCourseWare materials from a past MIT term, published under a Creative Commons licence. The page does not mention a cost. |
| [The Missing Semester of Your CS Education](https://missing.csail.mit.edu/) | MIT CSAIL | Beginner | ~30 | **Public; no cost stated.** Public course site with lecture notes and videos on YouTube. The page does not mention a cost. |
| [CS106A: Programming Methodology](https://see.stanford.edu/Course/CS106A) | Stanford Engineering Everywhere | Beginner | ~65 | **Public; no cost stated.** Stanford Engineering Everywhere publishes recorded materials from a past Stanford class. The page does not mention a cost. |
| [15-213: Introduction to Computer Systems](https://www.cs.cmu.edu/~213/) | Carnegie Mellon University | Advanced | ~130 | **University class site.** Website of CMU's current on-campus class (Fall 2026), not a public online course. The page does not say what people outside CMU can use. |
| [CS 61A: Structure and Interpretation of Computer Programs](https://cs61a.org/) | UC Berkeley | Beginner | ~120 | **University class site.** Website of UC Berkeley's current on-campus class (Fall 2026), not a public online course. The page does not say what people outside Berkeley can use. |
| [Algorithms, Part I: Data Structures & Sorting](https://algs4.cs.princeton.edu/home/) | Princeton University | Intermediate | ~65 | **Public; no cost stated.** Links to the textbook's website, which links to lecture videos and the Coursera course. The page does not mention a cost. |
| [Algorithms, Part II: Graph Algorithms & String Processing](https://algs4.cs.princeton.edu/home/) | Princeton University | Advanced | ~70 | **Public; no cost stated.** Links to the textbook's website, which links to lecture videos and the Coursera course. The page does not mention a cost. |
| [15-445/645: Database Systems](https://15445.courses.cs.cmu.edu/) | Carnegie Mellon University | Advanced | ~115 | **University class site.** Website of CMU's current on-campus class (Fall 2026), not a public online course. The page does not say what people outside CMU can use. |
| [CSE 373: Data Structures and Algorithms](https://courses.cs.washington.edu/courses/cse373/) | University of Washington | Intermediate | ~80 | **Not checked.** Not checked: the page did not load from here on 2026-11-17 (connection timed out twice). |

### Web Development (9)

| Course | Provider | Level | Rough hours | Access (from the course page) |
| :--- | :--- | :---: | :---: | :--- |
| [CS50W: Web Programming with Python and JavaScript](https://cs50.harvard.edu/web/) | Harvard University | Intermediate | ~90 | **Free (page says so).** Free through Harvard's OpenCourseWare. Certificates are offered separately through edX; this page does not state their price. |
| [Responsive Web Design Certification](https://www.freecodecamp.org/learn/responsive-web-design) | freeCodeCamp | Beginner | ~300 | **Free (page says so).** Free. freeCodeCamp marks this section as no longer updated and recommends its current curriculum instead. |
| [Front End Development Libraries](https://www.freecodecamp.org/learn/front-end-development-libraries) | freeCodeCamp | Intermediate | ~150 | **Free (page says so).** Free. freeCodeCamp marks this section as no longer updated and recommends its current curriculum instead. |
| [Back End Development and APIs](https://www.freecodecamp.org/learn/back-end-development-and-apis) | freeCodeCamp | Intermediate | ~180 | **Free (page says so).** Free. freeCodeCamp marks this section as no longer updated and recommends its current curriculum instead. |
| [Computer Programming: Intro to JS & Animation](https://www.khanacademy.org/computing/computer-programming/programming) | Khan Academy | Beginner | ~35 | **Free (page says so).** Free. An account is optional and also free. |
| [Intro to HTML/CSS: Making Webpages](https://www.khanacademy.org/computing/computer-programming/html-css) | Khan Academy | Beginner | ~25 | **Free (page says so).** Free. An account is optional and also free. |
| [Foundations Course](https://www.theodinproject.com/paths/foundations/courses/foundations) | The Odin Project | Beginner | ~100 | **Free (page says so).** Free (stated on The Odin Project's Full Stack JavaScript page; this page does not mention cost). |
| [Full Stack JavaScript Path](https://www.theodinproject.com/paths/full-stack-javascript) | The Odin Project | Intermediate | ~250 | **Free (page says so).** Free. |
| [Full Stack Open 2024](https://fullstackopen.com/en/) | University of Helsinki | Advanced | ~150 | **Free (page says so).** Course material is openly licensed and public. The page does not mention a fee. |

### Artificial Intelligence (14)

| Course | Provider | Level | Rough hours | Access (from the course page) |
| :--- | :--- | :---: | :---: | :--- |
| [CS50AI: Introduction to Artificial Intelligence with Python](https://cs50.harvard.edu/ai/) | Harvard University | Intermediate | ~85 | **Free (page says so).** Free through Harvard's OpenCourseWare. Certificates are offered separately through edX; this page does not state their price. |
| [Machine Learning Specialization](https://www.coursera.org/specializations/machine-learning-introduction) | DeepLearning.AI / Stanford | Intermediate | ~95 | **Check cost terms.** Coursera shows "Enroll for free" and "Financial aid available" but the page does not say which parts are free and which are paid. Check before enrolling. |
| [Deep Learning Specialization](https://www.coursera.org/specializations/deep-learning) | DeepLearning.AI | Advanced | ~120 | **Check cost terms.** Coursera shows "Enroll for free" and "Financial aid available" but the page does not say which parts are free and which are paid. Check before enrolling. |
| [Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course) | Google Developers | Intermediate | ~30 | **Public; no cost stated.** Public course on Google for Developers. The page does not mention a cost. |
| [Practical Deep Learning for Coders](https://course.fast.ai/) | Fast.ai | Intermediate | ~70 | **Free (page says so).** Free. |
| [Intro to Machine Learning](https://www.kaggle.com/learn/intro-to-machine-learning) | Kaggle | Beginner | ~3 | **Free (page says so).** Free. Kaggle lists it as about 3 hours. |
| [Elements of AI: Introduction to AI](https://www.elementsofai.com/) | University of Helsinki & Reaktor | Beginner | ~30 | **Free (page says so).** Free. |
| [Building AI: Python Algorithms for AI](https://buildingai.elementsofai.com/) | University of Helsinki & Reaktor | Intermediate | ~50 | **Free (page says so).** Free (stated on the Elements of AI home page). |
| [CS 229: Machine Learning](https://cs229.stanford.edu/) | Stanford University | Advanced | ~100 | **University class site.** Website of Stanford's on-campus class, not a public online course. The page does not say what people outside Stanford can use. |
| [CS 224N: Natural Language Processing with Deep Learning](https://web.stanford.edu/class/cs224n/) | Stanford University | Advanced | ~95 | **University class site.** Website of Stanford's on-campus class. Current lecture videos are for enrolled students only; the page points to a free 2024 YouTube playlist instead. |
| [CS 231N: Deep Learning for Computer Vision](http://cs231n.stanford.edu/) | Stanford University | Advanced | ~90 | **University class site.** Website of Stanford's on-campus class. Lecture videos are for enrolled Stanford students. |
| [6.036: Introduction to Machine Learning](https://openlearninglibrary.mit.edu/courses/course-v1:MITx+6.036+1T2019/about) | MIT OpenCourseWare | Intermediate | ~85 | **Public; no cost stated.** MIT Open Learning Library course; enrolment is required and no certificate is offered. The page does not mention a cost. |
| [6.S191: Introduction to Deep Learning](http://introtodeeplearning.com/) | MIT OpenCourseWare | Beginner | ~45 | **Public; no cost stated.** Lectures, slides and labs are published online each week. The page does not mention a cost. |
| [Deep Learning for Natural Language Processing](https://github.com/oxford-cs-deepnlp-2017/lectures) | University of Oxford | Advanced | ~60 | **University class site.** GitHub repository of slides and video links from Oxford's 2017 class. Not an active course. |

### Mathematics (1)

| Course | Provider | Level | Rough hours | Access (from the course page) |
| :--- | :--- | :---: | :---: | :--- |
| [18.06: Linear Algebra (Gilbert Strang)](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/) | MIT OpenCourseWare | Intermediate | ~60 | **Public; no cost stated.** MIT OpenCourseWare materials from a past MIT term, published under a Creative Commons licence. The page does not mention a cost. |

### Systems & Security (6)

| Course | Provider | Level | Rough hours | Access (from the course page) |
| :--- | :--- | :---: | :---: | :--- |
| [Introduction to Linux (LFS101x)](https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux) | The Linux Foundation | Beginner | ~60 | **Free (page says so).** edX offers free registration and an audit option. A certificate is offered separately; the page does not state its price. |
| [Introduction to Cybersecurity](https://www.netacad.com/courses/introduction-to-cybersecurity) | Cisco Networking Academy | Beginner | ~20 | **Free (page says so).** Free (the page title says "Free Online Course"). |
| [CS 61C: Great Ideas in Computer Architecture (Machine Structures)](https://cs61c.org/) | UC Berkeley | Advanced | ~130 | **University class site.** Website of UC Berkeley's current on-campus class (Fall 2026). Lecture recordings go to Berkeley's own system; the page links older videos from Spring 2024. |
| [CS 110: Principles of Computer Systems](https://web.stanford.edu/class/cs110/) | Stanford University | Advanced | ~105 | **University class site.** Website of Stanford's Winter 2022 class, not a public online course and no longer current. |
| [Nand to Tetris: Building a Modern Computer (Part I - Hardware)](https://www.nand2tetris.org/) | Hebrew University / Coursera | Beginner | ~50 | **Free; certificate costs.** Free on nand2tetris.org. The Coursera version requires payment and gives a completion certificate. |
| [Nand to Tetris: Building a Modern Computer (Part II - Software)](https://www.nand2tetris.org/) | Hebrew University / Coursera | Intermediate | ~55 | **Free; certificate costs.** Free on nand2tetris.org. The Coursera version requires payment and gives a completion certificate. |

## Features

- Search, filters by status, category, level and topic, and sorting. Filters are kept in the URL.
- Per-course module checklist and notes, saved in `localStorage`. Export and import as JSON.
- Export notes as Markdown, and a study schedule as an `.ics` calendar file.
- A focus timer and a daily study streak counter, both local to your browser.
- "Study Assist" copies a prompt describing the course and your checklist, for pasting into an AI assistant of your choice. Nothing is sent anywhere by the site.
- Light and dark themes (press `D`).

Earlier versions offered a downloadable "Verified Course Diploma". It was removed on 2026-11-17: it was generated from boxes you tick yourself, so it verified nothing. See [CORRECTIONS.md](CORRECTIONS.md).

## Adding a course

Add an entry to `data/courses.json` (shape in `data/schema.json`) and open a pull request. Include the course page's own sentence about cost in `access.quotes`, copied exactly, with the page URL and the date you read it. If the page does not state the cost, say so in the note instead of guessing.

## Running locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Browsers block `fetch()` on `file://`, so a local server is needed.

## Files

```
index.html                     page
assets/app.js, styles.css      app code (no build step)
data/courses.json              the course list
data/schema.json               shape of courses.json
data/summary.json              counts derived from courses.json
scripts/check-catalog-health.py  weekly link check
.github/workflows/             Pages deploy, weekly link check, PR validation
```

## Licence

No licence file has been added to this repository yet. Course content, names and trademarks belong to their providers; this site links to them and is not affiliated with them.
