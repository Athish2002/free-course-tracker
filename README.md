# CoursePulse ⚡

> **Autonomous, paywall-free open course directory & learning progress tracker.**  
> Built as a zero-build static site for GitHub Pages. No framework, no npm, no bundler, no backend.

[![Live App](https://img.shields.io/badge/Live%20App-CoursePulse%20on%20GitHub%20Pages-2563eb?style=for-the-badge&logo=github)](https://athish2002.github.io/free-course-tracker/)
[![Courses](https://img.shields.io/badge/Curated%20Courses-30%20Verified%20Free-10b981?style=for-the-badge)](https://athish2002.github.io/free-course-tracker/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## Features

- **Zero-Build Architecture**: 100% vanilla ES modules, semantic HTML5, CSS overrides, and pinned Tailwind CSS + DaisyUI via CDN.
- **Subpath & Offline-Ready**: Uses strictly relative paths (`./assets/`, `./data/`) so it works out-of-the-box on GitHub Pages subpaths (`https://<user>.github.io/<repo>/`).
- **Data-Driven (`data/courses.json`)**: Anyone can add or update courses via GitHub pull requests without touching frontend code.
- **Client-Side Progress & Notes**: Module completions and personal notes persist in `localStorage` keyed by course ID.
- **Export & Import JSON**: Back up or transfer your learning progress across devices with one click.
- **Live Statistics**: Real-time course tracking with DaisyUI metrics (Total Courses, In Progress, Completed, Overall Completion Radial Progress).
- **Deep Filtering & Search**: Instant debounced search, status filters (Not started / In progress / Completed), categories, difficulty levels, 88 topic tags, and multi-field sorting.
- **URL Query Param Sync**: Filters, search terms, and sort orders sync dynamically with the URL (`?q=python&status=in-progress`).
- **Course Detail Modal & Checklist**: Interactive module checklists with automated completion calculation, notes scratchpad, and celebratory confetti upon 100% completion.
- **Study Streak Telemetry**: Daily learning activity tracking (`coursepulse_streak`) encouraging continuous study habits with day counters and motivational indicators.
- **iCalendar (.ics) Study Plan Generator**: Generates spaced-repetition schedules exportable directly into Google Calendar, Apple Calendar, or Outlook.
- **Markdown Notes Exporter**: One-click download of personal study notes with structured YAML frontmatter and checklist status for Obsidian, Notion, or local knowledge bases.
- **High-Resolution Completion Diploma**: Instant client-side generation of executive 1200×750 PNG certificates of achievement with cryptographic verification hashes and seals.
- **Dedicated Light Crisp & Dark Obsidian Modes**: Executive high-contrast design system (10.5:1 WCAG AAA text contrast) with tactile Sun/Moon toggle and **`[D]`** keyboard shortcut.
- **Automated Catalog CI/CD Guardrails**: PR schema validator (`validate-catalog.yml`) ensuring course URLs, modules, and invariant integrity.

---

## Curated Course Directory (30 Free Courses)

Below is the complete index of 30 verified, 100% paywall-free courses curated in CoursePulse. You can track your progress interactively on the [Live Web App](https://athish2002.github.io/free-course-tracker/) without signing in.

### Computer Science (10 Courses)

| Course Title | Provider | Level | Est. Duration | Official Syllabus |
| :--- | :--- | :---: | :---: | :---: |
| **CS50x: Introduction to Computer Science** | Harvard University | `Beginner` | 120h | [Open Syllabus](https://cs50.harvard.edu/x/) |
| **CS50P: Introduction to Programming with Python** | Harvard University | `Beginner` | 80h | [Open Syllabus](https://cs50.harvard.edu/python/) |
| **JavaScript Algorithms and Data Structures** | freeCodeCamp | `Beginner` | 300h | [Open Syllabus](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8) |
| **Relational Databases Certification** | freeCodeCamp | `Intermediate` | 200h | [Open Syllabus](https://www.freecodecamp.org/learn/relational-database) |
| **6.0001: Intro to CS & Programming in Python** | MIT OpenCourseWare | `Beginner` | 75h | [Open Syllabus](https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/) |
| **6.006: Introduction to Algorithms** | MIT OpenCourseWare | `Advanced` | 110h | [Open Syllabus](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/) |
| **6.004: Computation Structures** | MIT OpenCourseWare | `Advanced` | 95h | [Open Syllabus](https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/) |
| **The Missing Semester of Your CS Education** | MIT CSAIL | `Beginner` | 30h | [Open Syllabus](https://missing.csail.mit.edu/) |
| **CS106A: Programming Methodology** | Stanford Engineering Everywhere | `Beginner` | 65h | [Open Syllabus](https://see.stanford.edu/Course/CS106A) |
| **15-213: Introduction to Computer Systems** | Carnegie Mellon University | `Advanced` | 130h | [Open Syllabus](https://www.cs.cmu.edu/~213/) |

### Web Development (9 Courses)

| Course Title | Provider | Level | Est. Duration | Official Syllabus |
| :--- | :--- | :---: | :---: | :---: |
| **CS50W: Web Programming with Python and JavaScript** | Harvard University | `Intermediate` | 90h | [Open Syllabus](https://cs50.harvard.edu/web/) |
| **Responsive Web Design Certification** | freeCodeCamp | `Beginner` | 300h | [Open Syllabus](https://www.freecodecamp.org/learn/responsive-web-design) |
| **Front End Development Libraries** | freeCodeCamp | `Intermediate` | 150h | [Open Syllabus](https://www.freecodecamp.org/learn/front-end-development-libraries) |
| **Back End Development and APIs** | freeCodeCamp | `Intermediate` | 180h | [Open Syllabus](https://www.freecodecamp.org/learn/back-end-development-and-apis) |
| **Computer Programming: Intro to JS & Animation** | Khan Academy | `Beginner` | 35h | [Open Syllabus](https://www.khanacademy.org/computing/computer-programming/programming) |
| **Intro to HTML/CSS: Making Webpages** | Khan Academy | `Beginner` | 25h | [Open Syllabus](https://www.khanacademy.org/computing/computer-programming/html-css) |
| **Foundations Course** | The Odin Project | `Beginner` | 100h | [Open Syllabus](https://www.theodinproject.com/paths/foundations/courses/foundations) |
| **Full Stack JavaScript Path** | The Odin Project | `Intermediate` | 250h | [Open Syllabus](https://www.theodinproject.com/paths/full-stack-javascript) |
| **Full Stack Open 2024** | University of Helsinki | `Advanced` | 150h | [Open Syllabus](https://fullstackopen.com/en/) |

### Artificial Intelligence (8 Courses)

| Course Title | Provider | Level | Est. Duration | Official Syllabus |
| :--- | :--- | :---: | :---: | :---: |
| **CS50AI: Introduction to Artificial Intelligence with Python** | Harvard University | `Intermediate` | 85h | [Open Syllabus](https://cs50.harvard.edu/ai/) |
| **Machine Learning Specialization** | DeepLearning.AI / Stanford | `Intermediate` | 95h | [Open Syllabus](https://www.coursera.org/specializations/machine-learning-introduction) |
| **Deep Learning Specialization** | DeepLearning.AI | `Advanced` | 120h | [Open Syllabus](https://www.coursera.org/specializations/deep-learning) |
| **Machine Learning Crash Course** | Google Developers | `Intermediate` | 30h | [Open Syllabus](https://developers.google.com/machine-learning/crash-course) |
| **Practical Deep Learning for Coders** | Fast.ai | `Intermediate` | 70h | [Open Syllabus](https://course.fast.ai/) |
| **Intro to Machine Learning** | Kaggle | `Beginner` | 15h | [Open Syllabus](https://www.kaggle.com/learn/intro-to-machine-learning) |
| **Elements of AI: Introduction to AI** | University of Helsinki & Reaktor | `Beginner` | 30h | [Open Syllabus](https://www.elementsofai.com/) |
| **Building AI: Python Algorithms for AI** | University of Helsinki & Reaktor | `Intermediate` | 50h | [Open Syllabus](https://buildingai.elementsofai.com/) |

### Systems & Security (2 Courses)

| Course Title | Provider | Level | Est. Duration | Official Syllabus |
| :--- | :--- | :---: | :---: | :---: |
| **Introduction to Linux (LFS101x)** | The Linux Foundation | `Beginner` | 60h | [Open Syllabus](https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux) |
| **Introduction to Cybersecurity** | Cisco Networking Academy | `Beginner` | 20h | [Open Syllabus](https://www.netacad.com/courses/introduction-to-cybersecurity) |

### Mathematics (1 Course)

| Course Title | Provider | Level | Est. Duration | Official Syllabus |
| :--- | :--- | :---: | :---: | :---: |
| **18.06: Linear Algebra (Gilbert Strang)** | MIT OpenCourseWare | `Intermediate` | 60h | [Open Syllabus](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/) |

---

## File Structure

```
/
├── index.html                  # Main application canvas
├── 404.html                    # Subpath-ready 404 error page
├── assets/
│   ├── app.js                  # Vanilla JS ES Module (~12 KB unminified)
│   └── styles.css              # Custom overrides & animations
├── data/
│   └── courses.json            # Course database (contribute via PR!)
├── .github/
│   └── workflows/
│       └── pages.yml           # Official GitHub Pages deployment workflow
└── README.md                   # Documentation & setup guide
```

---

## Local Development & Preview

Because CoursePulse is a pure static web app that fetches `./data/courses.json`, serve it with any lightweight local HTTP server (browsers restrict `fetch()` on `file://` protocols):

```bash
# 1. Clone your repository
git clone https://github.com/<your-username>/free-course-tracker.git
cd free-course-tracker

# 2. Start a local Python HTTP server
python -m http.server 8000

# 3. Open in your browser
# Visit http://localhost:8000
```

Alternatively, use Node.js `npx serve` or VS Code's Live Server extension.

---

## How to Add a Course (Pull Request Guide)

To add a new free course to CoursePulse, simply append an entry to `data/courses.json`. No build step or code modifications are required.

### JSON Schema & Copy-Paste Template

```json
{
  "id": "institution-course-slug",
  "title": "Course Title: Subtitle",
  "provider": "University or Platform Name",
  "url": "https://official-course-url.org/",
  "category": "Computer Science",
  "level": "Beginner",
  "duration_hours": 40,
  "tags": ["Python", "Algorithms", "Free Certificate"],
  "description": "A clear, 2-3 sentence overview of the syllabus and prerequisites.",
  "modules": [
    { "id": "slug-m1", "title": "Module 1: Introduction & Fundamentals" },
    { "id": "slug-m2", "title": "Module 2: Core Concepts & Practice" },
    { "id": "slug-m3", "title": "Module 3: Advanced Applications" },
    { "id": "slug-m4", "title": "Module 4: Final Capstone Project" }
  ]
}
```

### Validation Rules
- **`id`**: Lowercase alphanumeric string with hyphens (e.g. `harvard-cs50x`, `mit-ocw-6-006`).
- **`level`**: Must be either `"Beginner"`, `"Intermediate"`, or `"Advanced"`.
- **`duration_hours`**: Positive integer representing estimated total study hours.
- **`url`**: Must link to the official, 100% paywall-free course syllabus.
- **`modules`**: Array of objects with unique `id` and human-readable `title`.

---

## Visual Theming (Light Crisp & Dark Companion)

CoursePulse features an executive, high-contrast visual design system with dedicated **Light Crisp** and **Dark Obsidian** modes:
- **Light Crisp (`light`)**: Clean `#f8fafc` canvas, pure `#ffffff` cards, deep Slate 900 `#0f172a` ink with **10.5:1 WCAG AAA contrast**, and royal blue `#2563eb` action buttons.
- **Dark Obsidian (`dark`)**: Deep Slate 950 `#0b0f19` canvas, elevated Slate 900 `#111827` cards, quiet Slate 800 `#1e293b` borders, and pure `#f8fafc` typography.

### Toggling Themes
- Click the **Theme Toggle Button** in the header.
- Or press **`D`** on your keyboard from anywhere on the page (when not typing in search or notes).
- Your preference is instantly saved in `localStorage` and restored on future visits without layout flash. Default theme respects your operating system's `prefers-color-scheme`.

---

## GitHub Pages Deployment Setup

Deploying CoursePulse to GitHub Pages takes under 1 minute using GitHub Actions:

1. Push your repository to GitHub (`main` branch).
2. On GitHub, navigate to your repository's **Settings** tab.
3. Under the **Code and automation** section in the left sidebar, click **Pages**.
4. Under **Build and deployment** > **Source**, select **GitHub Actions** from the dropdown.
5. The included workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) will trigger automatically on every push to `main` and deploy the entire static site.
6. Your live tracker will be accessible at: `https://<your-username>.github.io/<repository-name>/`

---

## License & Fair Use

CoursePulse is released under the MIT License. All courses, logos, video lectures, and syllabus materials belong to their respective universities, foundations, and educational providers.
