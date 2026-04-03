// ─── RENDER FUNCTIONS ─────────────────────────────────────────────────────────
import { ALL_DAYS, WEEKLY_RESET, RESET_IDS } from './data.js';
import { state, save, getCurrentWeek } from './state.js';
import { getBlocks } from './blocks.js';
import { toMin, toTime, dur, fmtDur, fmtTime } from './time.js';

// Timeline constants
const PX_PER_HOUR = 60;
const PX_PER_MIN = PX_PER_HOUR / 60;
const MIN_BLOCK_PX = 36;

function getTimeRange(blocks) {
  const wake = blocks.filter(b => b.c !== 'sleep');
  if (!wake.length) return { startMin: 0, endMin: 1440 };
  const starts = wake.map(b => toMin(b.s));
  const ends = wake.map(b => toMin(b.e));
  return {
    startMin: Math.floor(Math.min(...starts) / 60) * 60,
    endMin: Math.ceil(Math.max(...ends) / 60) * 60,
  };
}
import { renderDayTasks, renderDayNotes } from './tasks.js';

// ─── DATE HELPER ─────────────────────────────────────────────────────────────
// Returns the actual calendar date for a given day name.
// weekDelta: additional offset on top of the view-based week (for swipe previews)
// viewOverride: use a specific view instead of state.view (for preview panels)
const DAY_OFFSETS = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
function getDateForDay(dayName, weekDelta, viewOverride) {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Get Sunday of current week
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dow);

  // Determine week offset based on which view we're showing vs current real week
  const currentWeek = getCurrentWeek();
  const targetView = viewOverride || state.view;
  let viewDelta = 0;
  if (currentWeek) {
    // Cycle configured: offset when viewing the non-current week
    if (currentWeek !== targetView) viewDelta = 1;
  } else {
    // No cycle configured: treat w1 as this week, w2 as next week
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

// ─── DAY PREVIEW (for swipe peek panels) ─────────────────────────────────────
export function renderDayPreview(day, weekOverride, weekDelta) {
  if (!day) return '';
  const week = weekOverride || state.view;
  const blocks = getBlocks(day, week);
  const isOff = week === 'w2' && day === 'FRI';
  const creMin = blocks.filter(b => b.c === 'creative').reduce((s, b) => s + dur(b), 0);
  const exMin = blocks.filter(b => b.c === 'exercise').reduce((s, b) => s + dur(b), 0);
  const socMin = blocks.filter(b => b.c === 'social').reduce((s, b) => s + dur(b), 0);

  const dateStr = getDateForDay(day, weekDelta || 0, week);
  const weekLabel = weekOverride && weekOverride !== state.view ? ` (${week === 'w1' ? 'Wk1' : 'Wk2'})` : '';

  // Separate sleep/wake
  const sleepBlocks = blocks.filter(b => b.c === 'sleep');
  const wakeBlocks = blocks.filter(b => b.c !== 'sleep');
  const range = getTimeRange(blocks);
  const gridHeight = (range.endMin - range.startMin) * PX_PER_MIN;

  let sleepHtml = '';
  if (sleepBlocks.length) {
    sleepHtml = `<div class="sleep-summary">${sleepBlocks.map(b =>
      `${fmtTime(b.s)}\u2013${fmtTime(b.e)} ${b.l}`).join(' \u00b7 ')}</div>`;
  }

  let hourLines = '';
  for (let m = range.startMin; m <= range.endMin; m += 60) {
    const top = (m - range.startMin) * PX_PER_MIN;
    hourLines += `<div class="hour-line" style="top:${top}px"><span class="hour-label">${fmtTime(toTime(m))}</span></div>`;
  }

  const blocksHtml = wakeBlocks.map(b => {
    const blockStart = toMin(b.s);
    const blockDur = dur(b);
    const top = (blockStart - range.startMin) * PX_PER_MIN;
    const height = Math.max(blockDur * PX_PER_MIN, MIN_BLOCK_PX);
    const hideNote = height < 50;
    return `<div class="tblock ${b.c}" style="top:${top}px;height:${height}px">
        <div class="tblock-content">
          <div class="tblock-title">${b.l}${blockDur >= 60 ? ` <span style="opacity:.5;font-size:.58rem">${fmtDur(blockDur)}</span>` : ''}</div>
          ${b.n && !hideNote ? `<div class="tblock-note">${b.n}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="detail-top">
      <div>
        <div class="detail-title">${day} ${dateStr}${weekLabel}${isOff ? ' -- OFF' : ''}</div>
        <div class="detail-meta">Creative: ${fmtDur(creMin)} | Exercise: ${fmtDur(exMin)} | Social: ${fmtDur(socMin)}</div>
      </div>
    </div>
    ${sleepHtml}
    <div class="timeline-grid" style="height:${gridHeight}px">
      ${hourLines}
      <div class="timeline-blocks">${blocksHtml}</div>
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
  const creMin = blocks.filter(b => b.c === 'creative').reduce((s, b) => s + dur(b), 0);
  const exMin = blocks.filter(b => b.c === 'exercise').reduce((s, b) => s + dur(b), 0);
  const socMin = blocks.filter(b => b.c === 'social').reduce((s, b) => s + dur(b), 0);
  document.getElementById('d-meta').textContent = `Creative: ${fmtDur(creMin)} | Exercise: ${fmtDur(exMin)} | Social: ${fmtDur(socMin)}`;

  const bannerEl = document.querySelector('.recovery-banner');
  if (bannerEl) bannerEl.remove();
  if (day === 'THU') {
    document.getElementById('timeline').insertAdjacentHTML('beforebegin',
      '<div class="recovery-banner">Recovery evening -- no chores or admin</div>');
  }

  // Separate sleep and wake blocks, preserving original index
  const sleepBlocks = [];
  const wakeBlocks = [];
  blocks.forEach((b, i) => {
    if (b.c === 'sleep') sleepBlocks.push({ block: b, idx: i });
    else wakeBlocks.push({ block: b, idx: i });
  });

  const range = getTimeRange(blocks);
  const gridHeight = (range.endMin - range.startMin) * PX_PER_MIN;

  // Sleep summary bar
  let sleepHtml = '';
  if (sleepBlocks.length) {
    sleepHtml = `<div class="sleep-summary">${sleepBlocks.map(s =>
      `${fmtTime(s.block.s)}\u2013${fmtTime(s.block.e)} ${s.block.l}`
    ).join(' \u00b7 ')}</div>`;
  }

  // Hour gridlines
  let hourLines = '';
  for (let m = range.startMin; m <= range.endMin; m += 60) {
    const top = (m - range.startMin) * PX_PER_MIN;
    hourLines += `<div class="hour-line" style="top:${top}px"><span class="hour-label">${fmtTime(toTime(m))}</span></div>`;
  }

  // Absolutely positioned wake blocks
  const blocksHtml = wakeBlocks.map(({ block: b, idx: i }) => {
    const blockStart = toMin(b.s);
    const blockDur = dur(b);
    const top = (blockStart - range.startMin) * PX_PER_MIN;
    const height = Math.max(blockDur * PX_PER_MIN, MIN_BLOCK_PX);
    const hideNote = height < 50;
    const doneKey = `${state.view}_${day}_${b._id}`;
    const doneEntry = state.blockDone[doneKey];
    const isDone = doneEntry && doneEntry.done;
    const doneNote = doneEntry && doneEntry.note;
    return `<div class="tblock ${b.c} ${isDone ? 'block-done' : ''}" style="top:${top}px;height:${height}px" data-block-idx="${i}">
        <div class="tblock-content">
          <div class="tblock-title">${b.l}${blockDur >= 60 ? ` <span style="opacity:.5;font-size:.58rem">${fmtDur(blockDur)}</span>` : ''}${b._edited ? '<span style="opacity:.4;font-size:.55rem"> edited</span>' : b._added ? '<span style="opacity:.4;font-size:.55rem"> +</span>' : ''}</div>
          ${b.n && !hideNote ? `<div class="tblock-note">${b.n}</div>` : ''}
          ${doneNote && !hideNote ? `<div class="tblock-done-note">${doneNote}</div>` : ''}
        </div>
        <div class="tblock-actions">
          <span class="tblock-edit-btn" data-edit-idx="${i}">edit</span>
          <input type="checkbox" class="tblock-check" data-done-key="${doneKey}" ${isDone ? 'checked' : ''}>
        </div>
      </div>`;
  }).join('');

  document.getElementById('timeline').innerHTML =
    sleepHtml +
    `<div class="timeline-grid" style="height:${gridHeight}px">
      ${hourLines}
      <div class="timeline-blocks">${blocksHtml}</div>
    </div>`;

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
  // ALL_DAYS is [SUN, MON, TUE, WED, THU, FRI, SAT] -- direct mapping from getDay()
  const todayDay = ALL_DAYS[now.getDay()];
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
  timeline.querySelectorAll('.tblock.past-block-dim').forEach(b => b.classList.remove('past-block-dim'));

  if (!isViewingToday()) return;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const blocks = getBlocks(state.selectedDay);
  const grid = timeline.querySelector('.timeline-grid');
  if (!grid) return;

  const range = getTimeRange(blocks);

  // Dim past blocks
  grid.querySelectorAll('.tblock[data-block-idx]').forEach(el => {
    const idx = parseInt(el.dataset.blockIdx);
    const b = blocks[idx];
    if (b && b.c !== 'sleep' && toMin(b.e) <= nowMin) el.classList.add('past-block-dim');
  });

  // Now line -- pure math positioning
  if (nowMin >= range.startMin && nowMin <= range.endMin) {
    const top = (nowMin - range.startMin) * PX_PER_MIN;
    const line = document.createElement('div');
    line.className = 'now-line';
    line.style.top = `${top}px`;
    grid.appendChild(line);
  }
}
