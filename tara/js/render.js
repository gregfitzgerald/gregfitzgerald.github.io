// ─── RENDER FUNCTIONS ─────────────────────────────────────────────────────────
import { ALL_DAYS, WEEKLY_RESET, RESET_IDS } from './data.js';
import { state, save, getCurrentWeek } from './state.js';
import { getBlocks } from './blocks.js';
import { toMin, dur, fmtDur, fmtTime } from './time.js';
import { renderDayTasks, renderDayNotes } from './tasks.js';

// ─── DATE HELPER ─────────────────────────────────────────────────────────────
// Returns the actual calendar date for a given day name.
// weekDelta: 0 = current week, +1 = next week, -1 = previous week
const DAY_OFFSETS = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6 };
function getDateForDay(dayName, weekDelta) {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + (weekDelta || 0) * 7);
  const target = new Date(monday);
  target.setDate(monday.getDate() + DAY_OFFSETS[dayName]);
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

// Lazy imports to avoid circular deps -- tasks.js imports from render indirectly
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
  const cats = { exercise: 0, creative: 0, administrative: 0, free: 0, gaming: 0 };
  ALL_DAYS.forEach(d => getBlocks(d).forEach(b => {
    if (cats[b.c] !== undefined) cats[b.c] += dur(b);
  }));
  document.getElementById('stats').innerHTML = Object.entries(cats).map(([c, m]) => `
    <div class="stat">
      <div class="stat-label">${c}</div>
      <div class="stat-val" style="color:var(--${c})">${fmtDur(m)}</div>
    </div>`).join('');
}

// ─── DAY PREVIEW (for swipe peek panels) ─────────────────────────────────────
export function renderDayPreview(day, weekOverride, weekDelta) {
  if (!day) return '';
  const week = weekOverride || state.view;
  const blocks = getBlocks(day, week);
  const isOff = week === 'w2' && day === 'FRI';
  const freeMin = blocks.filter(b => b.c === 'free').reduce((s, b) => s + dur(b), 0);
  const creMin = blocks.filter(b => b.c === 'creative').reduce((s, b) => s + dur(b), 0);
  const exMin = blocks.filter(b => b.c === 'exercise').reduce((s, b) => s + dur(b), 0);

  const dateStr = getDateForDay(day, weekDelta || 0);
  const weekLabel = weekOverride && weekOverride !== state.view ? ` (${week === 'w1' ? 'Wk1' : 'Wk2'})` : '';
  return `
    <div class="detail-top">
      <div>
        <div class="detail-title">${day} ${dateStr}${weekLabel}${isOff ? ' -- OFF' : ''}</div>
        <div class="detail-meta">Free: ${fmtDur(freeMin)} | Creative: ${fmtDur(creMin)} | Exercise: ${fmtDur(exMin)}</div>
      </div>
    </div>
    <div>${blocks.map((b, i) => `
      <div class="trow">
        <div class="ttime">${fmtTime(b.s)}<br><span style="opacity:.3">${fmtTime(b.e)}</span></div>
        <div class="tblock ${b.c}">
          <div>
            <div class="tblock-title">${b.l}${dur(b) >= 60 ? ` <span style="opacity:.5;font-size:.58rem">${fmtDur(dur(b))}</span>` : ''}</div>
            ${b.n ? `<div class="tblock-note">${b.n}</div>` : ''}
          </div>
        </div>
      </div>`).join('')}
    </div>`;
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
  const freeMin = blocks.filter(b => b.c === 'free').reduce((s, b) => s + dur(b), 0);
  const creMin = blocks.filter(b => b.c === 'creative').reduce((s, b) => s + dur(b), 0);
  const exMin = blocks.filter(b => b.c === 'exercise').reduce((s, b) => s + dur(b), 0);
  document.getElementById('d-meta').textContent = `Free: ${fmtDur(freeMin)} | Creative: ${fmtDur(creMin)} | Exercise: ${fmtDur(exMin)}`;

  const bannerEl = document.querySelector('.recovery-banner');
  if (bannerEl) bannerEl.remove();
  if (day === 'THU') {
    document.getElementById('timeline').insertAdjacentHTML('beforebegin',
      '<div class="recovery-banner">Recovery evening -- no chores or admin</div>');
  }

  document.getElementById('timeline').innerHTML = blocks.map((b, i) => {
    const doneKey = `${state.view}_${day}_${b._id}`;
    const doneEntry = state.blockDone[doneKey];
    const isDone = doneEntry && doneEntry.done;
    const doneNote = doneEntry && doneEntry.note;
    return `
    <div class="trow">
      <div class="ttime">${fmtTime(b.s)}<br><span style="opacity:.3">${fmtTime(b.e)}</span></div>
      <div class="tblock ${b.c} ${isDone ? 'block-done' : ''}" data-block-idx="${i}">
        <div class="tblock-content">
          <div class="tblock-title">${b.l}${dur(b) >= 60 ? ` <span style="opacity:.5;font-size:.58rem">${fmtDur(dur(b))}</span>` : ''}${b._edited ? '<span style="opacity:.4;font-size:.55rem"> edited</span>' : b._added ? '<span style="opacity:.4;font-size:.55rem"> +</span>' : ''}</div>
          ${b.n ? `<div class="tblock-note">${b.n}</div>` : ''}
          ${doneNote ? `<div class="tblock-done-note">${doneNote}</div>` : ''}
        </div>
        <div class="tblock-actions">
          <span class="tblock-edit-btn" data-edit-idx="${i}" title="Edit">&#9998;</span>
          <input type="checkbox" class="tblock-check" data-done-key="${doneKey}" ${isDone ? 'checked' : ''}>
        </div>
      </div>
    </div>`;
  }).join('');

  updateTimeIndicator();

  renderDayNotes(day);
  renderDayTasks(day);

  const rc = document.getElementById('weekly-reset-container');
  if (day === 'SUN') {
    rc.style.display = 'block';
    renderWeeklyReset();
  } else {
    rc.style.display = 'none';
  }

  // No auto-scroll -- let the user control their scroll position
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

// ─── TIME INDICATOR ("You Are Here") ────────────────────────────────────────
function isViewingToday() {
  const now = new Date();
  const todayIdx = [6, 0, 1, 2, 3, 4, 5][now.getDay()];
  const todayDay = ALL_DAYS[todayIdx];
  if (state.selectedDay !== todayDay) return false;
  const currentWeek = getCurrentWeek();
  return !currentWeek || state.view === currentWeek;
}

export function updateTimeIndicator() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  // Remove existing indicators
  const oldLine = timeline.querySelector('.now-line');
  if (oldLine) oldLine.remove();
  timeline.querySelectorAll('.trow.past-block').forEach(r => r.classList.remove('past-block'));

  if (!isViewingToday()) return;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const rows = timeline.querySelectorAll('.trow');
  const blocks = getBlocks(state.selectedDay);

  rows.forEach((row, i) => {
    const b = blocks[i];
    if (!b) return;
    const endMin = toMin(b.e);
    if (endMin <= nowMin) row.classList.add('past-block');
  });

  // Find block spanning current time and place now-line
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const startMin = toMin(b.s);
    const endMin = toMin(b.e);
    if (nowMin >= startMin && nowMin < endMin) {
      const row = rows[i];
      if (!row) break;
      const block = row.querySelector('.tblock');
      if (!block) break;
      const pct = (nowMin - startMin) / (endMin - startMin);
      const line = document.createElement('div');
      line.className = 'now-line';
      line.style.top = `${row.offsetTop + block.offsetTop + pct * block.offsetHeight}px`;
      timeline.appendChild(line);
      break;
    }
  }
}
