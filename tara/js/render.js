// ─── RENDER FUNCTIONS ─────────────────────────────────────────────────────────
import { ALL_DAYS, WEEKLY_RESET, RESET_IDS } from './data.js';
import { state, save, getCurrentWeek } from './state.js';
import { getBlocks } from './blocks.js';
import { dur, fmtDur, fmtTime } from './time.js';
import { renderDayTasks, renderDayNotes } from './tasks.js';
import { updateCalendar, getSleepSummary, getDateForDayObj } from './fullcalendar-bridge.js';

// ─── DATE HELPER ─────────────────────────────────────────────────────────────
const DAY_OFFSETS = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
export function getDateForDay(dayName, weekDelta, viewOverride) {
  const today = new Date();
  const dow = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dow);

  const currentWeek = getCurrentWeek();
  const targetView = viewOverride || state.view;
  let viewDelta = 0;
  if (currentWeek) {
    if (currentWeek !== targetView) viewDelta = 1;
  } else {
    if (targetView === 'w2') viewDelta = 1;
  }

  sunday.setDate(sunday.getDate() + (viewDelta + (weekDelta || 0)) * 7);
  const target = new Date(sunday);
  target.setDate(sunday.getDate() + DAY_OFFSETS[dayName]);
  return `${target.getMonth() + 1}/${target.getDate()}`;
}

// ─── RENDER ALL ───────────────────────────────────────────────────────────────
export function renderAll() {
  renderTabs();
  renderGrid();
  renderStats();
  renderSmart();
  renderAsmr();
  if (state.selectedDay) renderDetail(state.selectedDay);
}

let _renderSmart, _renderAsmr;
export function setTaskRenderers(smart, asmr) {
  _renderSmart = smart;
  _renderAsmr = asmr;
}
function renderSmart() { if (_renderSmart) _renderSmart(); }
function renderAsmr() { if (_renderAsmr) _renderAsmr(); }

// ─── TABS ─────────────────────────────────────────────────────────────────────
export function renderTabs() {
  document.getElementById('tabs').innerHTML = [
    { id: 'w1', label: 'WEEK 1', note: '38.5h' },
    { id: 'w2', label: 'WEEK 2', note: '31.5h + OFF FRI' },
  ].map(v => `
    <div class="tab ${state.view === v.id ? 'active' : ''}" data-view="${v.id}">
      <div>${v.label}</div>
      <div style="opacity:.5;font-size:.55rem;margin-top:2px">${v.note}</div>
    </div>`).join('');
}

// ─── GRID ─────────────────────────────────────────────────────────────────────
export function renderGrid() {
  document.getElementById('week-grid').innerHTML = ALL_DAYS.map(day => {
    const blocks = getBlocks(day);
    const isOff = state.view === 'w2' && day === 'FRI';
    const show = blocks.filter(b => b.c !== 'sleep');
    return `
    <div class="day-card ${state.selectedDay === day ? 'active' : ''} ${isOff ? 'off-day' : ''}" data-day="${day}">
      <div class="day-head">
        <span class="day-name">${day}</span>
        <span class="day-info">${isOff ? 'OFF' : day === 'THU' ? '10.5h' : (day === 'SAT' || day === 'SUN') ? '' : '7h'}</span>
      </div>
      <div>
        ${show.slice(0, 5).map(b => `<div class="mini-block ${b.c}">${b.l}</div>`).join('')}
        ${show.length > 5 ? `<div style="font-size:.5rem;color:var(--dim);padding:2px 0">+${show.length - 5} more</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ─── DAY SELECTOR STRIP (mobile) ──────────────────────────────────────────────
export function renderDayStrip() {
  const strip = document.getElementById('day-strip');
  if (!strip) return;
  strip.innerHTML = ALL_DAYS.map(day => {
    const isOff = state.view === 'w2' && day === 'FRI';
    const dateStr = getDateForDay(day);
    return `<button class="day-strip-btn ${state.selectedDay === day ? 'active' : ''} ${isOff ? 'off' : ''}" data-day="${day}">${day}<span class="day-strip-date">${dateStr}</span></button>`;
  }).join('');
}

// ─── STATS ────────────────────────────────────────────────────────────────────
export function renderStats() {
  const cats = { exercise: 0, creative: 0, errands: 0, social: 0, mealprep: 0 };
  ALL_DAYS.forEach(d => getBlocks(d).forEach(b => {
    if (cats[b.c] !== undefined) cats[b.c] += dur(b);
  }));
  document.getElementById('stats').innerHTML = Object.entries(cats).map(([c, m]) => `
    <div class="stat">
      <div class="stat-label">${c}</div>
      <div class="stat-val" style="color:var(--${c})">${fmtDur(m)}</div>
    </div>`).join('');
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
export function renderDetail(day) {
  const panel = document.getElementById('detail');
  panel.classList.add('show');
  panel.classList.remove('collapsed');

  const dateStr = getDateForDay(day);
  const suffix = state.view === 'w2' && day === 'FRI' ? ' -- OFF' : '';
  document.getElementById('d-title').textContent = `${day} ${dateStr}${suffix}`;

  const blocks = getBlocks(day);
  const creMin = blocks.filter(b => b.c === 'creative').reduce((s, b) => s + dur(b), 0);
  const exMin = blocks.filter(b => b.c === 'exercise').reduce((s, b) => s + dur(b), 0);
  const socMin = blocks.filter(b => b.c === 'social').reduce((s, b) => s + dur(b), 0);
  document.getElementById('d-meta').textContent = `Creative: ${fmtDur(creMin)} | Exercise: ${fmtDur(exMin)} | Social: ${fmtDur(socMin)}`;

  // Recovery banner
  const bannerContainer = document.getElementById('recovery-banner-container');
  if (bannerContainer) {
    bannerContainer.innerHTML = day === 'THU'
      ? '<div class="recovery-banner">Recovery evening -- no chores or admin</div>'
      : '';
  }

  // Sleep summary
  const sleepEl = document.getElementById('sleep-summary');
  if (sleepEl) {
    const summary = getSleepSummary(day);
    sleepEl.textContent = summary;
    sleepEl.style.display = summary ? '' : 'none';
  }

  // Update FullCalendar
  updateCalendar(day);

  // Day notes, tasks, weekly reset
  renderDayNotes(day);
  renderDayTasks(day);

  const rc = document.getElementById('weekly-reset-container');
  if (day === 'SUN') {
    rc.style.display = 'block';
    renderWeeklyReset();
  } else {
    rc.style.display = 'none';
  }
}

// ─── WEEKLY RESET ─────────────────────────────────────────────────────────────
export function renderWeeklyReset() {
  const total = RESET_IDS.length;
  const done = RESET_IDS.filter(id => state.resetDone[id]).length;
  const pct = total ? Math.round(done / total * 100) : 0;

  const container = document.getElementById('weekly-reset-container') || document.getElementById('reset-content');
  if (!container) return;

  container.innerHTML = `
    <div class="section-title">WEEKLY RESET <span class="badge" style="background:var(--exercise)">${done}/${total}</span></div>
    <div class="reset-progress"><div class="reset-bar" style="width:${pct}%"></div></div>
    ${WEEKLY_RESET.map(s => `
      <div class="reset-section">
        <div class="reset-section-title">${s.section}</div>
        ${s.items.map((item, i) => {
          const id = `${s.section}-${i}`;
          return `<div class="reset-item ${state.resetDone[id] ? 'done' : ''}">
            <input type="checkbox" ${state.resetDone[id] ? 'checked' : ''} data-reset-id="${id}">
            <span>${item}</span>
          </div>`;
        }).join('')}
      </div>`).join('')}
    <button class="btn-sm danger" style="margin-top:8px" id="clear-reset-btn">Reset All</button>
  `;
}

// ─── RESET TAB (always accessible) ───────────────────────────────────────────
export function renderResetTab() {
  const container = document.getElementById('reset-content');
  if (!container) return;
  renderWeeklyResetInto(container);
}

function renderWeeklyResetInto(container) {
  const total = RESET_IDS.length;
  const done = RESET_IDS.filter(id => state.resetDone[id]).length;
  const pct = total ? Math.round(done / total * 100) : 0;

  container.innerHTML = `
    <div class="tab-header">
      <h2>Weekly Reset</h2>
      <div class="reset-summary">${done}/${total} complete</div>
    </div>
    <div class="reset-progress"><div class="reset-bar" style="width:${pct}%"></div></div>
    ${WEEKLY_RESET.map(s => `
      <div class="reset-section">
        <div class="reset-section-title">${s.section}</div>
        ${s.items.map((item, i) => {
          const id = `${s.section}-${i}`;
          return `<div class="reset-item ${state.resetDone[id] ? 'done' : ''}">
            <input type="checkbox" ${state.resetDone[id] ? 'checked' : ''} data-reset-id="${id}">
            <span>${item}</span>
          </div>`;
        }).join('')}
      </div>`).join('')}
    <button class="btn-sm danger" style="margin-top:12px" id="clear-reset-btn">Reset All</button>
  `;
}

export function toggleReset(id) {
  state.resetDone[id] = !state.resetDone[id];
  save();
  renderWeeklyReset();
  renderResetTab();
}

export function clearReset() {
  if (!confirm('Reset all weekly reset items?')) return;
  state.resetDone = {};
  save();
  renderWeeklyReset();
  renderResetTab();
}
