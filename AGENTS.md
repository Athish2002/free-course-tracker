# Instructions for AI agents working in this repository

CoursePulse lists open courses and lets people track their progress. People choose what to study from it and plan their time around it. A wrong entry costs a stranger time or money. The owner wants it to be useful and true, not impressive.

On 2026-11-17 a review found a fake "verified" diploma, drawn imitations of university logos, and "verified free" claims that no check supported, all produced by earlier agent work. See `CORRECTIONS.md`. Do not repeat any of it.

## Rules

1. **Never invent a fact about a course.** Cost, access, certificates, hours, module lists and URLs come from the course page, loaded in this session. If you did not load it, do not write it. Do not rely on memory.
2. **"Free" needs a quote.** `access.kind` may be `free` or `free_paid_certificate` only with the provider's own sentence in `access.quotes`, copied exactly, with its URL. Set `checked_on` to the date you read it, and `checked_by` to the person's name, or `agent:<model name>` if you read it. Never write the owner's name for a check he did not do. If the page does not state the cost, use `no_cost_stated` and say so.
3. **Name what a page is.** A university's website for its own enrolled students is `class_site`, not a free course.
4. **Module lists are this site's checklists.** Do not call them official, and do not add one you have not compared with the course page. When you fix one, keep existing module `id`s where the meaning is the same: users' progress is stored by module id.
5. **No credentials or badges.** Do not add certificates, diplomas, seals, verification codes, scores or badges. Do not draw imitations of institutions' logos.
6. **Use the words the code has earned.** The link check only says a page answered and stayed on the same site. Do not describe it as verified, confirmed or healthy.
7. **Do not add machinery** (new checks, workflows, scores, data fields) unless the owner asks. If you think one is needed, say what user-visible claim it would support and wait for a yes.
8. **Check before saying done.** Run the PR validator from `.github/workflows/validate-catalog.yml` against `data/courses.json`, load the site locally (`python -m http.server`) and open a course, and report what ran and what it printed.
9. **Git.** Do not commit or push unless asked.
10. **Record corrections.** When you find something published here that was wrong, fix it and add an entry to `CORRECTIONS.md`.

## When you report back

Say what you changed, what you ran and what it printed, what you did not check, and what you are unsure of. If you found existing content that is unsupported, say so plainly even if you were not asked to look.
