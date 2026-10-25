/** CoursePulse — Free Course Tracker (<20 KB unminified) */
const K_PROG = 'coursepulse_progress', K_THM = 'coursepulse_theme', K_STREAK = 'coursepulse_streak', DATA_URL = './data/courses.json';
const THEME_COLORS = { light: '#f8fafc', dark: '#0b0f19' };

const state = {
  courses: [], progress: {}, activeCourseId: null, activeTrigger: null,
  filters: { search: '', status: 'all', category: 'all', level: 'all', tags: new Set(), sort: 'title-asc' },
  statsCache: { total: 0, inProgress: 0, completed: 0, overallPct: 0 },
  isLoading: true, error: null, isTagsExpanded: false,
};

let confettiRafId = null;

function loadProgress() {
  try {
    const raw = localStorage.getItem(K_PROG);
    if (!raw) { state.progress = {}; return; }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      state.progress = (parsed.version && parsed.courses) ? parsed.courses : parsed;
    }
  } catch {
    state.progress = {};
  }
}

function saveProgress() {
  try {
    const payload = {
      version: 1,
      last_updated: new Date().toISOString(),
      courses: state.progress,
    };
    localStorage.setItem(K_PROG, JSON.stringify(payload));
  } catch (err) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      showToast('⚠️ Storage quota exceeded! Export progress JSON backup.');
    }
  }
}

function getStreakData() {
  let s = { currentStreak: 0, lastActivityDate: null, longestStreak: 0 };
  try { s = JSON.parse(localStorage.getItem(K_STREAK)) || s; } catch {}
  return s;
}

function recordStudyActivity() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const s = getStreakData();
  if (s.lastActivityDate === today) return s;

  if (s.lastActivityDate) {
    const last = new Date(s.lastActivityDate);
    const cur = new Date(today);
    const diffDays = Math.round((cur - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      s.currentStreak += 1;
    } else if (diffDays > 1) {
      s.currentStreak = 1;
    }
  } else {
    s.currentStreak = 1;
  }
  s.lastActivityDate = today;
  if (s.currentStreak > (s.longestStreak || 0)) s.longestStreak = s.currentStreak;
  try { localStorage.setItem(K_STREAK, JSON.stringify(s)); } catch {}
  updateStreakUI(s);
  return s;
}

function updateStreakUI(s) {
  const data = s || getStreakData();
  const countEl = document.getElementById('stat-streak-count');
  const descEl = document.getElementById('stat-streak-desc');
  if (countEl) countEl.textContent = data.currentStreak || 0;
  if (descEl) {
    if (!data.currentStreak) descEl.textContent = 'Start your streak today';
    else if (data.currentStreak === 1) descEl.textContent = '1-day streak! Active today';
    else descEl.textContent = `${data.currentStreak} days streak! Keep it up`;
  }
}
function getCourseProgress(id) {
  if (!state.progress[id]) state.progress[id] = { completedModules: [], notes: '' };
  return state.progress[id];
}
function getCourseStatus(c) {
  const comp = (getCourseProgress(c.id).completedModules || []).length, tot = (c.modules || []).length;
  if (!tot || !comp) return 'not-started';
  return comp >= tot ? 'completed' : 'in-progress';
}
function getCoursePercentage(c) {
  const tot = (c.modules || []).length;
  return tot ? Math.min(100, Math.round(((getCourseProgress(c.id).completedModules || []).length / tot) * 100)) : 0;
}

export function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem(K_THM);
  const theme = (saved === 'dark' || saved === 'light') ? saved : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(theme, false);
  if (btn) {
    btn.onclick = () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(cur === 'dark' ? 'light' : 'dark', true);
    };
  }
}

export function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark', true);
}

function applyTheme(t, anim = true) {
  if (anim) {
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 300);
  }
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(K_THM, t);
  const m = document.querySelector('meta[name="theme-color"]');
  if (m && THEME_COLORS[t]) m.setAttribute('content', THEME_COLORS[t]);
  const txt = document.getElementById('theme-toggle-text');
  if (txt) txt.textContent = t === 'dark' ? 'Light' : 'Dark';
}

function parseUrlParams() {
  const p = new URLSearchParams(window.location.search);
  if (p.has('q')) state.filters.search = p.get('q') || '';
  if (p.has('status')) state.filters.status = p.get('status') || 'all';
  if (p.has('category')) state.filters.category = p.get('category') || 'all';
  if (p.has('level')) state.filters.level = p.get('level') || 'all';
  if (p.has('sort')) state.filters.sort = p.get('sort') || 'title-asc';
  state.filters.tags = p.has('tags') ? new Set(p.get('tags').split(',').filter(Boolean)) : new Set();
}

function syncUrlParams() {
  const p = new URLSearchParams();
  if (state.filters.search) p.set('q', state.filters.search);
  ['status', 'category', 'level'].forEach((k) => { if (state.filters[k] !== 'all') p.set(k, state.filters[k]); });
  if (state.filters.sort !== 'title-asc') p.set('sort', state.filters.sort);
  if (state.filters.tags.size > 0) p.set('tags', Array.from(state.filters.tags).join(','));
  const qs = p.toString();
  window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
}

export async function fetchCourses() {
  state.isLoading = true; state.error = null;
  renderLoadingSkeleton();
  try {
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.courses = await res.json();
    state.isLoading = false;
    renderFilterOptions();
    applyFilterInputs();
    renderAllWithTransition();
  } catch (err) {
    state.isLoading = false; state.error = err.message || 'Failed to fetch catalog';
    renderErrorState();
  }
}

function animateNumber(el, start, end, dur = 300) {
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || start === end) {
    el.textContent = end; return;
  }
  const range = end - start, t0 = performance.now();
  function step(now) {
    const prog = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(start + range * (1 - Math.pow(1 - prog, 3)));
    if (prog < 1) requestAnimationFrame(step); else el.textContent = end;
  }
  requestAnimationFrame(step);
}

function updateStats() {
  let inProgress = 0, completed = 0, totMod = 0, compMod = 0;
  state.courses.forEach((c) => {
    const st = getCourseStatus(c);
    if (st === 'in-progress') inProgress++;
    if (st === 'completed') completed++;
    const mLen = (c.modules || []).length;
    totMod += mLen;
    compMod += Math.min(mLen, (getCourseProgress(c.id).completedModules || []).length);
  });
  const pct = totMod > 0 ? Math.round((compMod / totMod) * 100) : 0;
  const $ = (id) => document.getElementById(id);

  animateNumber($('stat-total-courses'), state.statsCache.total, state.courses.length);
  animateNumber($('stat-in-progress'), state.statsCache.inProgress, inProgress);
  animateNumber($('stat-completed'), state.statsCache.completed, completed);
  animateNumber($('stat-radial-text'), state.statsCache.overallPct, pct);

  const rad = $('stat-radial-progress');
  if (rad) {
    rad.style.setProperty('--value', pct);
    rad.setAttribute('aria-valuenow', pct);
    if ($('stat-radial-text')) $('stat-radial-text').textContent = `${pct}%`;
  }
  state.statsCache = { total: state.courses.length, inProgress, completed, overallPct: pct };
  updateStreakUI();
}

function getFilteredCourses() {
  const q = state.filters.search.toLowerCase().trim();
  let list = state.courses.filter((c) => {
    if (q) {
      const match = (c.title + ' ' + c.provider + ' ' + c.description + ' ' + (c.tags || []).join(' ')).toLowerCase().includes(q);
      if (!match) return false;
    }
    if (state.filters.status !== 'all' && getCourseStatus(c) !== state.filters.status) return false;
    if (state.filters.category !== 'all' && c.category !== state.filters.category) return false;
    if (state.filters.level !== 'all' && c.level !== state.filters.level) return false;
    if (state.filters.tags.size > 0) {
      const cTags = new Set(c.tags || []);
      for (const t of state.filters.tags) if (!cTags.has(t)) return false;
    }
    return true;
  });

  list.sort((a, b) => {
    switch (state.filters.sort) {
      case 'title-desc': return b.title.localeCompare(a.title);
      case 'progress-desc': return getCoursePercentage(b) - getCoursePercentage(a);
      case 'progress-asc': return getCoursePercentage(a) - getCoursePercentage(b);
      case 'duration-desc': return (b.duration_hours || 0) - (a.duration_hours || 0);
      case 'duration-asc': return (a.duration_hours || 0) - (b.duration_hours || 0);
      default: return a.title.localeCompare(b.title);
    }
  });
  return list;
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderFilterOptions() {
  const cats = Array.from(new Set(state.courses.map((c) => c.category).filter(Boolean))).sort();
  const cEl = document.getElementById('filter-category');
  if (cEl) cEl.innerHTML = '<option value="all">All Categories</option>' + cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');

  // Frequency-ranked tags
  const tagCounts = {};
  state.courses.forEach((c) => (c.tags || []).forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a] || a.localeCompare(b));
  
  // Show top 12 tags by default, plus any actively filtered tag
  const visibleTags = state.isTagsExpanded ? sortedTags : sortedTags.slice(0, 12);
  state.filters.tags.forEach((t) => { if (!visibleTags.includes(t)) visibleTags.push(t); });

  const toggleBtn = document.getElementById('btn-toggle-all-tags');
  if (toggleBtn) {
    toggleBtn.textContent = state.isTagsExpanded ? 'Show fewer' : `Show all topics (${sortedTags.length})`;
  }

  const tagsContainer = document.getElementById('tags-chips-container');
  if (tagsContainer) {
    tagsContainer.innerHTML = visibleTags.map((tag) => {
      const act = state.filters.tags.has(tag);
      return `<button type="button" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs transition cursor-pointer select-none ${act ? 'bg-primary text-primary-content font-bold shadow-xs' : 'bg-base-200 text-base-content font-semibold border border-base-300/60 hover:bg-base-300'}" onclick="window.coursePulseApp.toggleFilterTag('${esc(tag)}')">${esc(tag)}</button>`;
    }).join('');
  }
  renderActiveFilterChips();
}

export function toggleTagsExpand() {
  state.isTagsExpanded = !state.isTagsExpanded;
  renderFilterOptions();
}

function renderActiveFilterChips() {
  const cont = document.getElementById('active-filters-chips');
  const clearBtn = document.getElementById('btn-clear-active-filters');
  if (!cont) return;

  const chips = [];
  if (state.filters.search) chips.push({ l: `Search: "${state.filters.search}"`, c: () => { state.filters.search = ''; } });
  if (state.filters.status !== 'all') chips.push({ l: `Status: ${state.filters.status}`, c: () => { state.filters.status = 'all'; } });
  if (state.filters.category !== 'all') chips.push({ l: `Category: ${state.filters.category}`, c: () => { state.filters.category = 'all'; } });
  if (state.filters.level !== 'all') chips.push({ l: `Level: ${state.filters.level}`, c: () => { state.filters.level = 'all'; } });
  state.filters.tags.forEach((t) => chips.push({ l: `Tag: ${t}`, c: () => { state.filters.tags.delete(t); } }));

  if (!chips.length) {
    cont.innerHTML = ''; clearBtn?.classList.add('hidden'); return;
  }
  clearBtn?.classList.remove('hidden');
  cont.innerHTML = chips.map((c, i) => `
    <span class="badge badge-sm gap-1 pl-2 pr-1 py-2 bg-base-200 border border-base-300 text-xs">
      ${esc(c.l)}
      <button type="button" class="btn btn-ghost btn-circle btn-xs hover:bg-base-300 text-[10px]" onclick="window.coursePulseApp.removeActiveFilter(${i})" aria-label="Remove filter">✕</button>
    </span>`).join('');
  window._activeFilterRemovers = chips.map((c) => c.c);
}

function applyFilterInputs() {
  const setV = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  setV('search-input', state.filters.search);
  setV('filter-status', state.filters.status);
  setV('filter-category', state.filters.category);
  setV('filter-level', state.filters.level);
  setV('sort-select', state.filters.sort);
}

function renderLoadingSkeleton() {
  const g = document.getElementById('courses-grid');
  if (g) g.innerHTML = Array(6).fill('<div class="card bg-base-100 border border-base-200 p-5 gap-3.5 animate-pulse"><div class="flex justify-between"><div class="h-4 skeleton-shimmer rounded w-24"></div><div class="h-4 skeleton-shimmer rounded w-16"></div></div><div class="h-6 skeleton-shimmer rounded w-3/4"></div><div class="h-10 skeleton-shimmer rounded"></div><div class="h-2 skeleton-shimmer rounded mt-1"></div></div>').join('');
}

function renderErrorState() {
  const g = document.getElementById('courses-grid');
  if (g) g.innerHTML = `<div class="col-span-full card bg-error/10 border border-error/30 p-8 text-center"><h3 class="font-bold text-lg">Failed to Load Courses</h3><p class="text-xs opacity-80 my-2">${esc(state.error)}</p><button onclick="window.coursePulseApp.fetchCourses()" class="btn btn-sm btn-error mx-auto">Retry</button></div>`;
}

function renderEmptyState() {
  const g = document.getElementById('courses-grid');
  if (g) g.innerHTML = '<div class="col-span-full card bg-base-100 border border-base-200 p-12 text-center"><h3 class="font-bold text-lg">No Matching Courses Found</h3><p class="text-xs opacity-70 my-2">Try adjusting your filters or search terms.</p><button onclick="window.coursePulseApp.resetFilters()" class="btn btn-sm btn-primary mx-auto">Reset All Filters</button></div>';
}

function renderCoursesList() {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;
  const courses = getFilteredCourses();
  const countAnnounce = document.getElementById('results-count-announcer');
  if (countAnnounce) countAnnounce.textContent = `Showing ${courses.length} courses`;
  if (!courses.length) return renderEmptyState();

  grid.innerHTML = courses.map((c, idx) => {
    const p = getCourseProgress(c.id), tot = (c.modules || []).length, comp = (p.completedModules || []).length, pct = getCoursePercentage(c), st = getCourseStatus(c);
    const lvlClass = c.level === 'Beginner' ?
      'text-emerald-800 bg-emerald-100 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/70 dark:border-emerald-700' :
      (c.level === 'Intermediate' ?
        'text-amber-900 bg-amber-100 border-amber-300 dark:text-amber-300 dark:bg-amber-950/70 dark:border-amber-700' :
        'text-rose-900 bg-rose-100 border-rose-300 dark:text-rose-300 dark:bg-rose-950/70 dark:border-rose-700');
    const stBadge = st === 'completed' ?
      '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700"><svg class="w-2.5 h-2.5 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="2 6 4.5 8.5 10 3"/></svg> Done</span>' :
      (st === 'in-progress' ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700">In Progress</span>' : '');
    const tags = (c.tags || []).slice(0, 2).map((t) => `<button type="button" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-base-200/90 text-base-content hover:bg-primary hover:text-primary-content transition cursor-pointer border border-base-300/60" onclick="window.coursePulseApp.toggleFilterTag('${esc(t)}')">${esc(t)}</button>`).join('');
    const delay = Math.min(idx * 25, 180);

    return `
      <article class="course-card card-animate-in card bg-base-100 border border-base-200 shadow-sm hover:shadow-md hover:border-base-300 transition flex flex-col justify-between" style="animation-delay:${delay}ms;" data-course-id="${esc(c.id)}">
        <div class="card-body p-4 sm:p-5 flex flex-col gap-3">
          
          <!-- Top Row: Provider & Level (Clean Optical Hierarchy, No Overlap) -->
          <div class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-base-200 text-base-content border border-base-300/80 leading-tight" title="${esc(c.provider)}">
              ${esc(c.provider)}
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border shrink-0 ${lvlClass}">
              ${esc(c.level)}
            </span>
          </div>

          <!-- Title -->
          <h2 class="card-title text-base sm:text-lg font-bold text-base-content leading-snug cursor-pointer hover:text-primary transition line-clamp-2 text-balance" onclick="window.coursePulseApp.openCourseModal('${esc(c.id)}', this)">
            ${esc(c.title)}
          </h2>

          <!-- Description -->
          <p class="text-xs sm:text-[13px] text-base-content/85 line-clamp-2 leading-relaxed text-pretty font-normal">
            ${esc(c.description)}
          </p>

          <!-- Duration & Category Tags -->
          <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-base-200 text-base-content border border-base-300/80">
              <svg class="w-3.5 h-3.5 text-base-content/60 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${c.duration_hours}h
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-base-200 text-base-content border border-base-300/80">
              ${esc(c.category)}
            </span>
            ${tags}
          </div>

          <!-- Progress Telemetry & Status -->
          <div class="flex flex-col gap-1.5 pt-1.5">
            <div class="flex items-center justify-between text-xs">
              <div class="card-modules-label font-bold text-base-content flex items-center gap-1.5">
                <span>${comp} of ${tot} modules</span>
                ${stBadge}
              </div>
              <span class="card-pct-label font-mono font-extrabold text-xs ${pct === 100 ? 'text-success' : 'text-primary'} tabular-nums">${pct}%</span>
            </div>
            <progress class="card-progress-bar progress ${pct === 100 ? 'progress-success' : 'progress-primary'} w-full h-2 rounded-full" value="${pct}" max="100"></progress>
          </div>
        </div>

        <!-- Action Row -->
        <div class="card-actions px-4 sm:px-5 pb-4 pt-2.5 border-t border-base-200/70 mt-auto flex items-center justify-between gap-2">
          <button onclick="window.coursePulseApp.openCourseModal('${esc(c.id)}', this)" class="btn btn-sm btn-primary flex-1 text-xs font-bold h-9 min-h-[36px] shadow-sm active:scale-[0.98] transition">
            Track Modules
          </button>
          <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-ghost border border-base-300 h-9 min-h-[36px] px-2.5 hover:bg-base-200 transition" title="Open course website" aria-label="Open course in new tab">
            <svg class="w-4 h-4 text-base-content/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </article>`;
  }).join('');
}

export function renderAllWithTransition() {
  if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.startViewTransition(() => { updateStats(); renderActiveFilterChips(); renderCoursesList(); });
  } else {
    updateStats(); renderActiveFilterChips(); renderCoursesList();
  }
}

export function openCourseModal(id, trigger = null) {
  const c = state.courses.find((x) => x.id === id);
  if (!c) return;
  state.activeCourseId = id; state.activeTrigger = trigger || document.activeElement;
  const p = getCourseProgress(id);
  const setT = (elId, v) => { const el = document.getElementById(elId); if (el) el.textContent = v; };

  setT('modal-course-title', c.title);
  setT('modal-course-provider', c.provider);
  setT('modal-course-duration', `${c.duration_hours} hours`);
  setT('modal-course-category', c.category);
  setT('modal-course-level', c.level);
  setT('modal-course-desc', c.description);

  const link = document.getElementById('modal-external-link'), notes = document.getElementById('modal-course-notes');
  if (link) link.href = c.url;
  if (notes) notes.value = p.notes || '';
  document.getElementById('notes-saved-indicator')?.classList.add('opacity-0');

  renderModalModules(c);
  updateModalProgress(c);

  const modal = document.getElementById('course_modal');
  if (modal) {
    modal.classList.remove('modal-closing');
    modal.showModal();
    setupModalFocusTrap(modal);
  }
}

export function closeCourseModal() {
  const modal = document.getElementById('course_modal');
  if (!modal?.open) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    modal.close(); state.activeTrigger?.focus(); return;
  }
  modal.classList.add('modal-closing');
  setTimeout(() => {
    modal.close(); modal.classList.remove('modal-closing');
    state.activeTrigger?.focus();
  }, 150);
}

function setupModalFocusTrap(modal) {
  modal.onkeydown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeCourseModal(); return; }
    if (e.key === 'Tab') {
      const f = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { f[f.length - 1].focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { f[0].focus(); e.preventDefault(); }
    }
  };
}

function renderModalModules(c) {
  const list = document.getElementById('modal-modules-list');
  if (!list) return;
  const set = new Set(getCourseProgress(c.id).completedModules || []);

  list.innerHTML = (c.modules || []).map((m) => {
    const chk = set.has(m.id);
    return `
      <label class="flex items-start gap-3 p-2.5 rounded-lg border border-base-200 hover:bg-base-200/50 cursor-pointer text-xs select-none transition">
        <input type="checkbox" data-module-id="${esc(m.id)}" class="checkbox checkbox-primary checkbox-sm mt-0.5" ${chk ? 'checked' : ''} onchange="window.coursePulseApp.toggleModule('${esc(c.id)}', '${esc(m.id)}', this.checked)">
        <span class="flex-1 font-medium ${chk ? 'line-through opacity-60' : ''}">${esc(m.title)}</span>
      </label>`;
  }).join('');
}

function updateModalProgress(c) {
  const tot = (c.modules || []).length, comp = (getCourseProgress(c.id).completedModules || []).length;
  const pct = tot ? Math.round((comp / tot) * 100) : 0;
  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setT('modal-progress-pct', `${pct}%`);
  setT('modal-progress-label', `${comp} of ${tot} modules completed`);
  const bar = document.getElementById('modal-progress-bar');
  if (bar) bar.value = pct;

  const card = document.querySelector(`.course-card[data-course-id="${c.id}"]`);
  if (card) {
    const cL = card.querySelector('.card-modules-label'), cP = card.querySelector('.card-pct-label'), cB = card.querySelector('.card-progress-bar');
    const st = getCourseStatus(c);
    const stBadge = st === 'completed' ?
      '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700"><svg class="w-2.5 h-2.5 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="2 6 4.5 8.5 10 3"/></svg> Done</span>' :
      (st === 'in-progress' ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700">In Progress</span>' : '');
    if (cL) cL.innerHTML = `<span>${comp} of ${tot} modules</span> ${stBadge}`;
    if (cP) {
      cP.textContent = `${pct}%`;
      cP.className = `card-pct-label font-mono font-extrabold text-xs ${pct === 100 ? 'text-success' : 'text-primary'} tabular-nums`;
    }
    if (cB) {
      cB.value = pct;
      cB.className = `card-progress-bar progress ${pct === 100 ? 'progress-success' : 'progress-primary'} w-full h-2 rounded-full`;
    }
  }
}

export function toggleModule(cId, mId, chk) {
  const c = state.courses.find((x) => x.id === cId);
  if (!c) return;
  const p = getCourseProgress(cId), set = new Set(p.completedModules || []), was100 = set.size === (c.modules || []).length;
  if (chk) {
    set.add(mId);
    recordStudyActivity();
  } else {
    set.delete(mId);
  }
  p.completedModules = Array.from(set);
  saveProgress();

  const inp = document.querySelector(`input[data-module-id="${mId}"]`);
  if (inp) {
    inp.checked = chk;
    const sp = inp.closest('label')?.querySelector('span');
    if (sp) sp.className = `flex-1 font-medium ${chk ? 'line-through opacity-60' : ''}`;
  }
  updateModalProgress(c);
  updateStats();
  if (!was100 && p.completedModules.length === (c.modules || []).length) triggerCelebration(c.title);
}

export function markAllModules(done) {
  if (!state.activeCourseId) return;
  const c = state.courses.find((x) => x.id === state.activeCourseId);
  if (!c) return;
  if (!done && !confirm('Are you sure you want to reset all progress for this course?')) return;

  const p = getCourseProgress(c.id), was100 = (p.completedModules || []).length === (c.modules || []).length;
  p.completedModules = done ? (c.modules || []).map((m) => m.id) : [];
  if (done) recordStudyActivity();
  saveProgress();
  renderModalModules(c);
  updateModalProgress(c);
  renderAllWithTransition();
  if (done && !was100) triggerCelebration(c.title);
}

export function saveCourseNotes(txt) {
  if (!state.activeCourseId) return;
  getCourseProgress(state.activeCourseId).notes = txt;
  if (txt && txt.trim()) recordStudyActivity();
  saveProgress();
  const ind = document.getElementById('notes-saved-indicator');
  if (ind) {
    ind.classList.remove('opacity-0');
    setTimeout(() => ind.classList.add('opacity-0'), 1500);
  }
}

function triggerCelebration(title) {
  showToast(`🎉 Course Completed! Congratulations on finishing "${title}"!`);
  launchConfetti();
}

function showToast(msg) {
  const cont = document.getElementById('toast-container');
  if (!cont) return;
  const t = document.createElement('div');
  t.className = 'toast-item alert alert-success shadow-xl text-xs font-semibold flex items-center justify-between gap-3';
  t.innerHTML = `<span>${esc(msg)}</span><div class="toast-dismiss-bar"></div>`;
  cont.appendChild(t);
  setTimeout(() => {
    t.classList.add('opacity-0', 'scale-95');
    setTimeout(() => t.remove(), 250);
  }, 4000);
}

function launchConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cvs = document.getElementById('confetti-canvas');
  if (!cvs) return;
  if (confettiRafId) {
    cancelAnimationFrame(confettiRafId);
    confettiRafId = null;
  }
  const ctx = cvs.getContext('2d');
  cvs.width = window.innerWidth; cvs.height = window.innerHeight;
  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
  const pieces = Array.from({ length: 60 }, () => ({
    x: cvs.width / 2, y: cvs.height / 2, vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 0.75) * 14,
    sz: Math.random() * 6 + 4, color: colors[Math.floor(Math.random() * colors.length)], a: 1, rot: Math.random() * 360, dR: (Math.random() - 0.5) * 6,
  }));
  function loop() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    let act = 0;
    pieces.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.a -= 0.012; p.rot += p.dR;
      if (p.a > 0) {
        act++; ctx.save(); ctx.globalAlpha = Math.max(0, p.a); ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180); ctx.fillStyle = p.color; ctx.fillRect(-p.sz / 2, -p.sz / 2, p.sz, p.sz); ctx.restore();
      }
    });
    if (act > 0) {
      confettiRafId = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      confettiRafId = null;
    }
  }
  confettiRafId = requestAnimationFrame(loop);
}

export function exportNotesAsMarkdown() {
  if (!state.activeCourseId) return;
  const c = state.courses.find((x) => x.id === state.activeCourseId);
  if (!c) return;
  const p = getCourseProgress(c.id);
  const completedSet = new Set(p.completedModules || []);
  const pct = getCoursePercentage(c);
  const now = new Date().toISOString();

  let md = `---\ntitle: "${c.title.replace(/"/g, '\\"')}"\nprovider: "${c.provider.replace(/"/g, '\\"')}"\ncategory: "${c.category}"\nlevel: "${c.level}"\nduration_hours: ${c.duration_hours}\nurl: "${c.url}"\nprogress_percentage: ${pct}\nexported_at: "${now}"\n---\n\n`;
  md += `# ${c.title}\n\n`;
  md += `> **Provider**: ${c.provider}  \n`;
  md += `> **Category**: ${c.category} | **Level**: ${c.level} | **Duration**: ${c.duration_hours} hours  \n`;
  md += `> **Official Syllabus**: [${c.url}](${c.url})  \n`;
  md += `> **Completion Status**: ${pct}% (${completedSet.size} of ${(c.modules || []).length} modules)\n\n`;
  md += `---\n\n## Personal Study Notes\n\n`;
  md += `${(p.notes || '').trim() || '_No personal notes written yet._'}\n\n`;
  md += `---\n\n## Curriculum Modules Checklist\n\n`;

  (c.modules || []).forEach((m, idx) => {
    const isDone = completedSet.has(m.id);
    md += `- [${isDone ? 'x' : ' '}] Module ${idx + 1}: ${m.title}\n`;
  });

  md += `\n---\n*Generated by CoursePulse (https://athish2002.github.io/free-course-tracker/) on ${new Date().toLocaleDateString()}.*\n`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${c.id}-study-notes.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('📝 Notes exported as Markdown!');
}

export function exportCourseCalendar() {
  if (!state.activeCourseId) return;
  const c = state.courses.find((x) => x.id === state.activeCourseId);
  if (!c) return;
  const modules = c.modules || [];
  if (!modules.length) return;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);

  const pad = (n) => String(n).padStart(2, '0');
  const formatIcalDate = (d) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const nowStamp = formatIcalDate(new Date());

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CoursePulse//Study Plan Generator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Study Plan - ${c.title.replace(/[,;]/g, '')}`,
  ];

  modules.forEach((m, idx) => {
    const evtStart = new Date(startDate);
    evtStart.setDate(evtStart.getDate() + idx * 2);
    evtStart.setHours(18, 0, 0, 0);

    const evtEnd = new Date(evtStart);
    evtEnd.setHours(19, 30, 0, 0);

    const uid = `cp-${c.id}-${m.id}-${Date.now()}@coursepulse`;
    const summary = `Study: ${c.title} (Module ${idx + 1})`;
    const description = `Module: ${m.title}\\nCourse: ${c.title}\\nProvider: ${c.provider}\\nURL: ${c.url}`;

    ics.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${formatIcalDate(evtStart)}`,
      `DTEND:${formatIcalDate(evtEnd)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `URL:${c.url}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');

  const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `coursepulse-${c.id}-study-schedule.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('📅 Study schedule (.ics) downloaded! Ready for Calendar.');
}

function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

export function openCertificateModal() {
  if (!state.activeCourseId) return;
  const c = state.courses.find((x) => x.id === state.activeCourseId);
  if (!c) return;
  drawCertificateCanvas(c);
  const modal = document.getElementById('certificate_modal');
  if (modal) {
    modal.showModal();
    setupModalFocusTrap(modal);
  }
}

export function closeCertificateModal() {
  const modal = document.getElementById('certificate_modal');
  if (modal?.open) modal.close();
}

function drawCertificateCanvas(c) {
  const cvs = document.getElementById('certificate-canvas');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const W = 1200, H = 750;
  cvs.width = W; cvs.height = H;

  const p = getCourseProgress(c.id);
  const pct = getCoursePercentage(c);
  const hash = `CP-VERIFY-${generateHash(c.id + '-' + c.title + '-' + (p.completedModules || []).length)}`;
  const codeEl = document.getElementById('cert-verification-code');
  if (codeEl) codeEl.textContent = `Hash: ${hash}`;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(24, 24, W - 48, H - 48);

  // Outer Navy Border
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#0f172a';
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Gold Inner Rim
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#d97706';
  ctx.strokeRect(44, 44, W - 88, H - 88);

  // Brand Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2563eb';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText('C O U R S E P U L S E', W / 2, 110);

  // Certificate Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px "Inter", serif, sans-serif';
  ctx.fillText('CERTIFICATE OF CURRICULUM COMPLETION', W / 2, 175);

  // Divider line
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(350, 205); ctx.lineTo(W - 350, 205);
  ctx.stroke();

  // Subtitle
  ctx.fillStyle = '#475569';
  ctx.font = '500 18px "Inter", sans-serif';
  ctx.fillText('THIS RECOGNIZES THAT AN INDEPENDENT SCHOLAR HAS COMPLETED THE SYLLABUS FOR', W / 2, 255);

  // Course Title
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 34px "Inter", sans-serif';
  let title = c.title;
  if (ctx.measureText(title).width > 950) {
    ctx.font = 'bold 28px "Inter", sans-serif';
  }
  ctx.fillText(title, W / 2, 320);

  // Provider
  ctx.fillStyle = '#2563eb';
  ctx.font = '600 22px "Inter", sans-serif';
  ctx.fillText(`Curriculum Provided by ${c.provider}`, W / 2, 375);

  ctx.fillStyle = '#64748b';
  ctx.font = '16px "Inter", sans-serif';
  ctx.fillText(`Category: ${c.category}   •   Level: ${c.level}   •   Duration: ${c.duration_hours} Estimated Hours`, W / 2, 420);

  // Progress status
  ctx.fillStyle = pct === 100 ? '#15803d' : '#2563eb';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText(pct === 100 ? 'STATUS: 100% COMPLETED (ALL MODULES VERIFIED)' : `STATUS: ${pct}% MODULES MASTERED`, W / 2, 465);

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Date on Left
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = '600 16px "Inter", sans-serif';
  ctx.fillText(dateStr, 120, 580);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px "Inter", sans-serif';
  ctx.fillText('DATE OF ISSUE', 120, 600);
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText(hash, 120, 620);

  // Gold Seal on Center-Left
  ctx.save();
  ctx.translate(520, 585);
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px "Inter", sans-serif';
  ctx.fillText('✓', 0, 7);
  ctx.restore();

  // Signature on Right
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'italic bold 22px "Inter", Georgia, serif';
  ctx.fillText('CoursePulse Open Engine', W - 120, 575);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W - 360, 585); ctx.lineTo(W - 120, 585);
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px "Inter", sans-serif';
  ctx.fillText('OPEN-SOURCE EDUCATION REGISTRY', W - 120, 605);
}

export function downloadCertificate() {
  const cvs = document.getElementById('certificate-canvas');
  if (!cvs || !state.activeCourseId) return;
  const c = state.courses.find((x) => x.id === state.activeCourseId);
  const url = cvs.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `coursepulse-${c ? c.id : 'course'}-diploma.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast('🎓 Diploma downloaded successfully (PNG)!');
}

export function exportProgress() {
  const payload = { version: '1.0', exported_at: new Date().toISOString(), progress: state.progress };
  const a = document.createElement('a');
  a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  a.download = `coursepulse-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  showToast('Progress exported successfully.');
}

export function importProgress(file) {
  if (!file) return;
  const r = new FileReader();
  r.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const inc = data.progress || data;
      if (!inc || typeof inc !== 'object' || Array.isArray(inc)) throw new Error('Invalid format');
      state.progress = { ...state.progress, ...inc };
      saveProgress(); renderAllWithTransition(); showToast('Progress imported successfully!');
    } catch (err) { showToast(`Import failed: ${err.message}`); }
  };
  r.readAsText(file);
}

function debounce(fn, ms = 200) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function toggleFilterTag(tag) {
  if (state.filters.tags.has(tag)) state.filters.tags.delete(tag); else state.filters.tags.add(tag);
  renderFilterOptions(); syncUrlParams(); renderAllWithTransition();
}
export function removeActiveFilter(idx) {
  if (window._activeFilterRemovers?.[idx]) {
    window._activeFilterRemovers[idx]();
    renderFilterOptions(); applyFilterInputs(); syncUrlParams(); renderAllWithTransition();
  }
}
export function resetFilters() {
  state.filters = { search: '', status: 'all', category: 'all', level: 'all', tags: new Set(), sort: 'title-asc' };
  renderFilterOptions(); applyFilterInputs(); syncUrlParams(); renderAllWithTransition();
}

function setupListeners() {
  const on = (id, evt, fn) => { document.getElementById(id)?.addEventListener(evt, fn); };

  on('search-input', 'input', debounce((e) => {
    state.filters.search = e.target.value; syncUrlParams(); renderAllWithTransition();
  }, 200));

  document.addEventListener('keydown', (e) => {
    const sIn = document.getElementById('search-input');
    const modal = document.getElementById('course_modal');
    if (e.key === '/' && document.activeElement !== sIn && !modal?.open) {
      e.preventDefault(); sIn?.focus();
    } else if (e.key === 'Escape' && document.activeElement === sIn) {
      sIn.value = ''; state.filters.search = ''; sIn.blur(); syncUrlParams(); renderAllWithTransition();
    } else if ((e.key === 'd' || e.key === 'D') && !['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase()) && !modal?.open) {
      e.preventDefault();
      toggleTheme();
    }
  });

  window.addEventListener('scroll', () => {
    const h = document.querySelector('header');
    if (h) {
      if (window.scrollY > 10) h.classList.add('header-scrolled'); else h.classList.remove('header-scrolled');
    }
  }, { passive: true });

  ['status', 'category', 'level'].forEach((k) => {
    on(`filter-${k}`, 'change', (e) => { state.filters[k] = e.target.value; syncUrlParams(); renderAllWithTransition(); });
  });

  on('sort-select', 'change', (e) => { state.filters.sort = e.target.value; syncUrlParams(); renderAllWithTransition(); });
  on('btn-reset-filters', 'click', resetFilters);
  on('btn-clear-active-filters', 'click', resetFilters);
  on('modal-course-notes', 'input', debounce((e) => saveCourseNotes(e.target.value), 300));
  on('btn-export-progress', 'click', exportProgress);
  on('btn-import-progress', 'click', () => document.getElementById('import-file-input')?.click());

  on('import-file-input', 'change', (e) => {
    if (e.target.files?.[0]) { importProgress(e.target.files[0]); e.target.value = ''; }
  });

  window.addEventListener('popstate', () => {
    parseUrlParams(); applyFilterInputs(); renderFilterOptions(); renderAllWithTransition();
  });

  window.addEventListener('resize', () => {
    const cvs = document.getElementById('confetti-canvas');
    if (cvs) { cvs.width = window.innerWidth; cvs.height = window.innerHeight; }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme(); loadProgress(); parseUrlParams(); setupListeners(); fetchCourses();
});

window.coursePulseApp = {
  fetchCourses, openCourseModal, closeCourseModal, toggleModule, markAllModules, saveCourseNotes, exportProgress, importProgress, toggleFilterTag, removeActiveFilter, resetFilters, toggleTagsExpand, toggleTheme,
  exportNotesAsMarkdown, exportCourseCalendar, openCertificateModal, closeCertificateModal, downloadCertificate,
};
