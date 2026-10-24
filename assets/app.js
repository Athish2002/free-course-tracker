const K_PROG='coursepulse_progress',K_THM='coursepulse_theme',DATA_URL='./data/courses.json';
const state={courses:[],progress:{},activeCourseId:null,filters:{search:'',status:'all',category:'all',level:'all',tag:'all',sort:'title-asc'},error:null};

function loadProgress(){
  try{state.progress=JSON.parse(localStorage.getItem(K_PROG))||{};}catch{state.progress={};}
}
function saveProgress(){
  try{localStorage.setItem(K_PROG,JSON.stringify(state.progress));}catch{}
}
function getCourseProgress(id){
  if(!state.progress[id])state.progress[id]={completedModules:[],notes:''};
  return state.progress[id];
}
function getCourseStatus(c){
  const comp=(getCourseProgress(c.id).completedModules||[]).length,tot=(c.modules||[]).length;
  if(!tot||!comp)return 'not-started';
  return comp>=tot?'completed':'in-progress';
}
function getCoursePercentage(c){
  const tot=(c.modules||[]).length;
  return tot?Math.min(100,Math.round(((getCourseProgress(c.id).completedModules||[]).length/tot)*100)):0;
}

export function initTheme(){
  const sel=document.getElementById('theme-select');
  const theme=localStorage.getItem(K_THM)||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  document.documentElement.setAttribute('data-theme',theme);
  if(sel){
    sel.value=theme;
    sel.onchange=(e)=>{
      document.documentElement.setAttribute('data-theme',e.target.value);
      localStorage.setItem(K_THM,e.target.value);
    };
  }
}

function parseUrlParams(){
  const p=new URLSearchParams(window.location.search);
  ['search','status','category','level','tag','sort'].forEach((k)=>{
    const key=k==='search'?'q':k;
    if(p.has(key))state.filters[k]=p.get(key)||state.filters[k];
  });
}
function syncUrlParams(){
  const p=new URLSearchParams();
  if(state.filters.search)p.set('q',state.filters.search);
  ['status','category','level','tag'].forEach((k)=>{if(state.filters[k]!=='all')p.set(k,state.filters[k]);});
  if(state.filters.sort!=='title-asc')p.set('sort',state.filters.sort);
  const qs=p.toString();
  window.history.replaceState({},'',qs?`${window.location.pathname}?${qs}`:window.location.pathname);
}

export async function fetchCourses(){
  state.error=null;
  const grid=document.getElementById('courses-grid');
  if(grid)grid.innerHTML=Array(6).fill('<div class="card bg-base-100 border border-base-200 p-5 gap-3 animate-pulse"><div class="h-4 bg-base-300 rounded w-1/3"></div><div class="h-6 bg-base-300 rounded w-3/4"></div><div class="h-8 bg-base-300 rounded"></div></div>').join('');
  try{
    const res=await fetch(DATA_URL);
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    state.courses=await res.json();
    renderFilterOptions();
    applyFilterInputs();
    renderAll();
  }catch(err){
    state.error=err.message||'Failed to load catalog';
    if(grid)grid.innerHTML=`<div class="col-span-full card bg-error/10 border border-error/30 p-8 text-center"><h3 class="font-bold text-base">Catalog Load Failed</h3><p class="text-xs opacity-75 my-2">${esc(state.error)}</p><button onclick="window.coursePulseApp.fetchCourses()" class="btn btn-sm btn-error mx-auto">Retry</button></div>`;
  }
}

function updateStats(){
  let inProgress=0,completed=0,totMod=0,compMod=0;
  state.courses.forEach((c)=>{
    const st=getCourseStatus(c);
    if(st==='in-progress')inProgress++;
    if(st==='completed')completed++;
    const mLen=(c.modules||[]).length;
    totMod+=mLen;
    compMod+=Math.min(mLen,(getCourseProgress(c.id).completedModules||[]).length);
  });
  const pct=totMod>0?Math.round((compMod/totMod)*100):0;
  const setT=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  setT('stat-total-courses',state.courses.length);
  setT('stat-in-progress',inProgress);
  setT('stat-completed',completed);
  setT('stat-radial-text',`${pct}%`);
  const rad=document.getElementById('stat-radial-progress');
  if(rad){rad.style.setProperty('--value',pct);rad.setAttribute('aria-valuenow',pct);}
}

function getFilteredCourses(){
  const q=state.filters.search.toLowerCase().trim();
  let list=state.courses.filter((c)=>{
    if(q&&!(c.title+' '+c.provider+' '+c.description+' '+(c.tags||[]).join(' ')).toLowerCase().includes(q))return false;
    if(state.filters.status!=='all'&&getCourseStatus(c)!==state.filters.status)return false;
    if(state.filters.category!=='all'&&c.category!==state.filters.category)return false;
    if(state.filters.level!=='all'&&c.level!==state.filters.level)return false;
    if(state.filters.tag!=='all'&&!(c.tags||[]).includes(state.filters.tag))return false;
    return true;
  });
  list.sort((a,b)=>{
    switch(state.filters.sort){
      case 'title-desc':return b.title.localeCompare(a.title);
      case 'progress-desc':return getCoursePercentage(b)-getCoursePercentage(a);
      case 'progress-asc':return getCoursePercentage(a)-getCoursePercentage(b);
      case 'duration-desc':return (b.duration_hours||0)-(a.duration_hours||0);
      case 'duration-asc':return (a.duration_hours||0)-(b.duration_hours||0);
      default:return a.title.localeCompare(b.title);
    }
  });
  return list;
}

function esc(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderFilterOptions(){
  const cats=Array.from(new Set(state.courses.map((c)=>c.category).filter(Boolean))).sort();
  const tags=Array.from(new Set(state.courses.flatMap((c)=>c.tags||[]).filter(Boolean))).sort();
  const cEl=document.getElementById('filter-category'),tEl=document.getElementById('filter-tag');
  if(cEl)cEl.innerHTML='<option value="all">All Categories</option>'+cats.map((c)=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  if(tEl)tEl.innerHTML='<option value="all">All Tags</option>'+tags.map((t)=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');
}

function applyFilterInputs(){
  const setV=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v;};
  setV('search-input',state.filters.search);
  setV('filter-status',state.filters.status);
  setV('filter-category',state.filters.category);
  setV('filter-level',state.filters.level);
  setV('filter-tag',state.filters.tag);
  setV('sort-select',state.filters.sort);
}

function renderCoursesList(){
  const grid=document.getElementById('courses-grid');
  if(!grid)return;
  const list=getFilteredCourses();
  if(!list.length){
    grid.innerHTML='<div class="col-span-full card bg-base-100 border border-base-200 p-12 text-center"><h3 class="font-bold text-base">No Matching Courses</h3><p class="text-xs opacity-70 my-2">Try clearing filters or search keywords.</p><button onclick="window.coursePulseApp.resetFilters()" class="btn btn-sm btn-primary mx-auto">Reset Filters</button></div>';
    return;
  }
  grid.innerHTML=list.map((c)=>{
    const p=getCourseProgress(c.id),tot=(c.modules||[]).length,comp=(p.completedModules||[]).length,pct=getCoursePercentage(c),st=getCourseStatus(c);
    const lvl=c.level==='Beginner'?'badge-success badge-outline':(c.level==='Intermediate'?'badge-warning badge-outline':'badge-error badge-outline');
    const stBadge=st==='completed'?'<span class="badge badge-success text-[10px]">✓ Done</span>':(st==='in-progress'?'<span class="badge badge-primary text-[10px]">In Progress</span>':'');
    const tags=(c.tags||[]).slice(0,3).map((t)=>`<span class="badge badge-sm badge-ghost text-[10px] cursor-pointer hover:badge-primary" onclick="window.coursePulseApp.filterByTag('${esc(t)}')">${esc(t)}</span>`).join('');
    return `
      <article class="course-card card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
        <div class="card-body p-4 sm:p-5 flex flex-col gap-2.5">
          <div class="flex items-center justify-between gap-2"><span class="badge badge-outline text-[11px] font-mono truncate max-w-[140px]">${esc(c.provider)}</span><div class="flex items-center gap-1">${stBadge}<span class="badge ${lvl} text-[11px]">${esc(c.level)}</span></div></div>
          <h2 class="card-title text-sm sm:text-base font-bold cursor-pointer hover:text-primary transition leading-snug" onclick="window.coursePulseApp.openCourseModal('${esc(c.id)}')">${esc(c.title)}</h2>
          <p class="text-xs text-base-content/70 line-clamp-2 leading-relaxed">${esc(c.description)}</p>
          <div class="flex flex-wrap items-center gap-1 pt-1"><span class="badge badge-sm bg-base-200 text-[11px] font-mono">${c.duration_hours}h</span><span class="badge badge-sm bg-base-200 text-[11px]">${esc(c.category)}</span>${tags}</div>
          <div class="flex flex-col gap-1 pt-1.5"><div class="flex items-center justify-between text-xs text-base-content/70"><span>${comp} of ${tot} modules</span><span class="font-mono font-semibold text-primary">${pct}%</span></div><progress class="progress progress-primary w-full h-2" value="${pct}" max="100"></progress></div>
        </div>
        <div class="card-actions px-4 sm:px-5 pb-4 pt-0 border-t border-base-200/60 mt-auto flex items-center justify-between gap-2">
          <button onclick="window.coursePulseApp.openCourseModal('${esc(c.id)}')" class="btn btn-sm btn-primary flex-1 text-xs font-semibold">Track Modules</button>
          <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-ghost btn-square" title="Open course website"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
        </div>
      </article>`;
  }).join('');
}

export function renderAll(){
  updateStats();
  renderCoursesList();
}

export function openCourseModal(id){
  const c=state.courses.find((x)=>x.id===id);
  if(!c)return;
  state.activeCourseId=id;
  const setT=(elId,v)=>{const el=document.getElementById(elId);if(el)el.textContent=v;};
  setT('modal-course-title',c.title);
  setT('modal-course-provider',c.provider);
  setT('modal-course-duration',`${c.duration_hours}h`);
  setT('modal-course-category',c.category);
  setT('modal-course-level',c.level);
  setT('modal-course-desc',c.description);
  const link=document.getElementById('modal-external-link'),notes=document.getElementById('modal-course-notes');
  if(link)link.href=c.url;
  if(notes)notes.value=getCourseProgress(id).notes||'';
  renderModalModules(c);
  updateModalProgress(c);
  document.getElementById('course_modal')?.showModal();
}

function renderModalModules(c){
  const list=document.getElementById('modal-modules-list');
  if(!list)return;
  const set=new Set(getCourseProgress(c.id).completedModules||[]);
  list.innerHTML=(c.modules||[]).map((m)=>{
    const chk=set.has(m.id);
    return `<label class="flex items-start gap-3 p-2 rounded-lg border border-base-200 hover:bg-base-200/50 cursor-pointer text-xs select-none">
      <input type="checkbox" data-module-id="${esc(m.id)}" class="checkbox checkbox-primary checkbox-sm mt-0.5" ${chk?'checked':''} onchange="window.coursePulseApp.toggleModule('${esc(c.id)}', '${esc(m.id)}', this.checked)">
      <span class="flex-1 font-medium ${chk?'line-through opacity-60':''}">${esc(m.title)}</span>
    </label>`;
  }).join('');
}

function updateModalProgress(c){
  const tot=(c.modules||[]).length,comp=(getCourseProgress(c.id).completedModules||[]).length;
  const pct=tot?Math.round((comp/tot)*100):0;
  const setT=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  setT('modal-progress-pct',`${pct}%`);
  setT('modal-progress-label',`${comp} of ${tot} modules completed`);
  const bar=document.getElementById('modal-progress-bar');
  if(bar)bar.value=pct;
}

export function toggleModule(cId,mId,chk){
  const c=state.courses.find((x)=>x.id===cId);
  if(!c)return;
  const p=getCourseProgress(cId),set=new Set(p.completedModules||[]),was100=set.size===(c.modules||[]).length;
  if(chk)set.add(mId);else set.delete(mId);
  p.completedModules=Array.from(set);
  saveProgress();
  const inp=document.querySelector(`input[data-module-id="${mId}"]`);
  if(inp){
    inp.checked=chk;
    const sp=inp.closest('label')?.querySelector('span');
    if(sp)sp.className=`flex-1 font-medium ${chk?'line-through opacity-60':''}`;
  }
  updateModalProgress(c);
  renderAll();
  if(!was100&&p.completedModules.length===(c.modules||[]).length)triggerCelebration(c.title);
}

export function markAllModules(done){
  if(!state.activeCourseId)return;
  const c=state.courses.find((x)=>x.id===state.activeCourseId);
  if(!c)return;
  const p=getCourseProgress(c.id),was100=(p.completedModules||[]).length===(c.modules||[]).length;
  p.completedModules=done?(c.modules||[]).map((m)=>m.id):[];
  saveProgress();
  renderModalModules(c);
  updateModalProgress(c);
  renderAll();
  if(done&&!was100)triggerCelebration(c.title);
}

export function saveCourseNotes(txt){
  if(state.activeCourseId){getCourseProgress(state.activeCourseId).notes=txt;saveProgress();}
}

function triggerCelebration(title){
  showToast(`🎉 Course Completed! Congratulations on finishing "${title}"!`);
  launchConfetti();
}

function showToast(msg){
  const cont=document.getElementById('toast-container');
  if(!cont)return;
  const t=document.createElement('div');
  t.className='alert alert-success shadow-lg text-xs font-semibold';
  t.innerHTML=`<span>${esc(msg)}</span>`;
  cont.appendChild(t);
  setTimeout(()=>{t.classList.add('opacity-0');setTimeout(()=>t.remove(),300);},4000);
}

function launchConfetti(){
  const cvs=document.getElementById('confetti-canvas');
  if(!cvs)return;
  const ctx=cvs.getContext('2d');
  cvs.width=window.innerWidth;cvs.height=window.innerHeight;
  const colors=['#22c55e','#3b82f6','#f59e0b','#ec4899','#8b5cf6'];
  const pieces=Array.from({length:45},()=>({
    x:cvs.width/2,y:cvs.height/2,vx:(Math.random()-0.5)*12,vy:(Math.random()-0.75)*12,
    sz:Math.random()*6+4,color:colors[Math.floor(Math.random()*colors.length)],a:1,rot:Math.random()*360,dR:(Math.random()-0.5)*6,
  }));
  function loop(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    let act=0;
    pieces.forEach((p)=>{
      p.x+=p.vx;p.y+=p.vy;p.vy+=0.28;p.a-=0.012;p.rot+=p.dR;
      if(p.a>0){
        act++;ctx.save();ctx.globalAlpha=Math.max(0,p.a);ctx.translate(p.x,p.y);
        ctx.rotate((p.rot*Math.PI)/180);ctx.fillStyle=p.color;ctx.fillRect(-p.sz/2,-p.sz/2,p.sz,p.sz);ctx.restore();
      }
    });
    if(act>0)requestAnimationFrame(loop);else ctx.clearRect(0,0,cvs.width,cvs.height);
  }
  loop();
}

export function exportProgress(){
  const a=document.createElement('a');
  a.href='data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify({version:'1.0',exported_at:new Date().toISOString(),progress:state.progress},null,2));
  a.download=`coursepulse-progress-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);a.click();a.remove();
  showToast('Progress exported.');
}

export function importProgress(file){
  if(!file)return;
  const r=new FileReader();
  r.onload=(e)=>{
    try{
      const data=JSON.parse(e.target.result);
      const inc=data.progress||data;
      if(!inc||typeof inc!=='object')throw new Error('Invalid format');
      state.progress={...state.progress,...inc};
      saveProgress();renderAll();showToast('Progress imported!');
    }catch(err){alert(`Import error: ${err.message}`);}
  };
  r.readAsText(file);
}

function debounce(fn,ms=200){
  let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),ms);};
}
export function filterByTag(tag){
  state.filters.tag=tag;
  const sel=document.getElementById('filter-tag');
  if(sel)sel.value=tag;
  syncUrlParams();renderAll();
}
export function resetFilters(){
  state.filters={search:'',status:'all',category:'all',level:'all',tag:'all',sort:'title-asc'};
  applyFilterInputs();syncUrlParams();renderAll();
}

function setupListeners(){
  const on=(id,evt,fn)=>{document.getElementById(id)?.addEventListener(evt,fn);};
  on('search-input','input',debounce((e)=>{state.filters.search=e.target.value;syncUrlParams();renderAll();},200));
  ['status','category','level','tag'].forEach((k)=>{on(`filter-${k}`,'change',(e)=>{state.filters[k]=e.target.value;syncUrlParams();renderAll();});});
  on('sort-select','change',(e)=>{state.filters.sort=e.target.value;syncUrlParams();renderAll();});
  on('btn-reset-filters','click',resetFilters);
  on('modal-course-notes','input',debounce((e)=>saveCourseNotes(e.target.value),300));
  on('btn-export-progress','click',exportProgress);
  on('btn-import-progress','click',()=>document.getElementById('import-file-input')?.click());
  on('import-file-input','change',(e)=>{if(e.target.files?.[0]){importProgress(e.target.files[0]);e.target.value='';}});
  window.addEventListener('resize',()=>{const cvs=document.getElementById('confetti-canvas');if(cvs){cvs.width=window.innerWidth;cvs.height=window.innerHeight;}});
}

document.addEventListener('DOMContentLoaded',()=>{
  initTheme();loadProgress();parseUrlParams();setupListeners();fetchCourses();
});

window.coursePulseApp={
  fetchCourses,openCourseModal,toggleModule,markAllModules,saveCourseNotes,exportProgress,importProgress,filterByTag,resetFilters,
};
