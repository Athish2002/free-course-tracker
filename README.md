# CoursePulse ⚡

> **Autonomous, paywall-free open course directory & learning progress tracker.**  
> Built as a zero-build static site for GitHub Pages. No framework, no npm, no bundler, no backend.

---

## Features

- **Zero-Build Architecture**: 100% vanilla ES modules, semantic HTML5, CSS overrides, and pinned Tailwind CSS + DaisyUI via CDN.
- **Subpath & Offline-Ready**: Uses strictly relative paths (`./assets/`, `./data/`) so it works out-of-the-box on GitHub Pages subpaths (`https://<user>.github.io/<repo>/`).
- **Data-Driven (`data/courses.json`)**: Anyone can add or update courses via GitHub pull requests without touching frontend code.
- **Client-Side Progress & Notes**: Module completions and personal notes persist in `localStorage` keyed by course ID.
- **Export & Import JSON**: Back up or transfer your learning progress across devices with one click.
- **Live Statistics**: Real-time course tracking with DaisyUI metrics (Total Courses, In Progress, Completed, Overall Completion Radial Progress).
- **Deep Filtering & Search**: Instant debounced search, status filters (Not started / In progress / Completed), categories, difficulty levels, tags, and multi-field sorting.
- **URL Query Param Sync**: Filters, search terms, and sort orders sync dynamically with the URL (`?q=python&status=in-progress`).
- **Course Detail Modal & Checklist**: Interactive module checklists with automated completion calculation, notes scratchpad, and celebratory confetti upon 100% completion.
- **Theme Switcher**: 8+ themes (`light`, `dark`, `cupcake`, `emerald`, `synthwave`, `nord`, `dracula`, `forest`) with automatic `prefers-color-scheme` detection and pre-paint flash prevention.

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

## How to Customize or Change Themes

CoursePulse uses DaisyUI's `data-theme` attribute on the root `<html>` tag.

### Changing Available Themes
Open `index.html` and look for the `<select id="theme-select">`:

```html
<select id="theme-select" class="select select-sm select-bordered">
  <option value="light">☀️ Light</option>
  <option value="dark">🌙 Dark</option>
  <option value="cupcake">🧁 Cupcake</option>
  <option value="emerald">🌲 Emerald</option>
  <option value="synthwave">🌆 Synthwave</option>
  <option value="nord">❄️ Nord</option>
  <option value="dracula">🧛 Dracula</option>
  <option value="forest">🌿 Forest</option>
</select>
```

DaisyUI includes over 30 built-in themes (e.g. `corporate`, `luxury`, `coffee`, `retro`, `cyberpunk`). To add a theme, simply add an `<option value="theme-name">` to the select menu.

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
