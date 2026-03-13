// ─── TASKS ────────────────────────────────────────────────────────────────────
import { SMART_TASKS, ASMR_TASKS } from './data.js';
import { state, save } from './state.js';

// ─── DAY TASKS ────────────────────────────────────────────────────────────────
export function renderDayTasks(day) {
  const tasks = state.dayTasks[day] || [];
  const countEl = document.getElementById('day-task-count');
  if (countEl) countEl.textContent = tasks.length;

  const listEl = document.getElementById('day-task-list');
  if (!listEl) return;

  listEl.innerHTML = tasks.length
    ? tasks.map((t, i) => `
      <div class="task-item ${t.done ? 'done' : ''}">
        <input type="checkbox" ${t.done ? 'checked' : ''} data-day-task="${day}" data-task-idx="${i}">
        <span>${t.label}</span>
        <button class="task-del" data-del-day="${day}" data-del-idx="${i}">x</button>
      </div>`).join('')
    : `<div style="font-size:.6rem;color:var(--dim);padding:4px 0">No tasks assigned yet.</div>`;
}

export function toggleDayTask(day, i) {
  state.dayTasks[day][i].done = !state.dayTasks[day][i].done;
  const t = state.dayTasks[day][i];
  if (t.type === 'smart') state.smartDone[t.refId] = t.done;
  if (t.type === 'asmr') state.asmrDone[t.refId] = t.done;
  save();
  renderDayTasks(day);
  renderSmart();
  renderAsmr();
}

export function deleteDayTask(day, i) {
  state.dayTasks[day].splice(i, 1);
  save();
  renderDayTasks(day);
}

// ─── SIDEBAR / TASKS TAB ─────────────────────────────────────────────────────
export function renderSmart() {
  const remaining = SMART_TASKS.filter(t => !state.smartDone[t.id]).length;
  const badge = document.getElementById('smart-badge');
  if (badge) badge.textContent = remaining;

  const list = document.getElementById('smart-list');
  if (!list) return;
  list.innerHTML = SMART_TASKS.map(t => `
    <div class="smart-item ${state.smartDone[t.id] ? 'done' : ''}" data-smart-id="${t.id}">
      <div style="flex:1">
        <div>${t.name}</div>
        <div class="smart-item-cat">${t.cat}</div>
      </div>
      <button class="assign-btn" data-quick-assign="smart" data-quick-id="${t.id}">+ Day</button>
    </div>`).join('');
}

export function renderAsmr() {
  const allTasks = [...ASMR_TASKS, ...state.userTasks];
  const remaining = allTasks.filter(t => !state.asmrDone[t.id]).length;
  const badge = document.getElementById('asmr-badge');
  if (badge) badge.textContent = remaining;

  const list = document.getElementById('asmr-list');
  if (!list) return;
  list.innerHTML = allTasks.map(t => `
    <div class="smart-item ${state.asmrDone[t.id] ? 'done' : ''}" data-asmr-id="${t.id}">
      <div style="flex:1">
        <div>${t.name}</div>
        <div class="smart-item-cat">${t.cat}</div>
      </div>
      <button class="assign-btn" data-quick-assign="asmr" data-quick-id="${t.id}">+ Day</button>
    </div>`).join('');
}

export function toggleSmart(id) {
  state.smartDone[id] = !state.smartDone[id];
  save();
  renderSmart();
}

export function toggleAsmr(id) {
  state.asmrDone[id] = !state.asmrDone[id];
  save();
  renderAsmr();
}

export function quickAssign(type, id) {
  if (!state.selectedDay) {
    alert('Open a day first, then use + Day');
    return;
  }
  const pool = type === 'smart' ? SMART_TASKS : [...ASMR_TASKS, ...state.userTasks];
  const t = pool.find(x => x.id === id);
  if (!t) return;
  if (!state.dayTasks[state.selectedDay]) state.dayTasks[state.selectedDay] = [];
  if (state.dayTasks[state.selectedDay].some(x => x.refId === id)) return;
  state.dayTasks[state.selectedDay].push({
    label: t.name, type, refId: id,
    done: type === 'smart' ? !!state.smartDone[id] : !!state.asmrDone[id],
  });
  save();
  renderDayTasks(state.selectedDay);
}

// ─── TASKS TAB RENDER ─────────────────────────────────────────────────────────
export function renderTasksTab() {
  const container = document.getElementById('tasks-content');
  if (!container) return;

  container.innerHTML = `
    <div class="tab-header">
      <h2>Tasks</h2>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-title">PRIORITY TASKS <span class="badge" id="smart-badge-tab">${SMART_TASKS.filter(t => !state.smartDone[t.id]).length}</span></div>
      <div id="smart-list-tab"></div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-title">BACKLOG TASKS <span class="badge-orange" id="asmr-badge-tab">${[...ASMR_TASKS, ...state.userTasks].filter(t => !state.asmrDone[t.id]).length}</span></div>
      <div style="font-size:.58rem;color:var(--dim);margin-bottom:8px;">No time pressure -- assign or check off when done.</div>
      <div id="asmr-list-tab"></div>
      <button class="add-btn" id="new-task-btn-tab">+ NEW TASK</button>
    </div>
  `;

  // Render into tab-specific containers
  const smartListTab = document.getElementById('smart-list-tab');
  smartListTab.innerHTML = SMART_TASKS.map(t => `
    <div class="smart-item ${state.smartDone[t.id] ? 'done' : ''}" data-smart-id="${t.id}">
      <div style="flex:1">
        <div>${t.name}</div>
        <div class="smart-item-cat">${t.cat}</div>
      </div>
      <button class="assign-btn" data-quick-assign="smart" data-quick-id="${t.id}">+ Day</button>
    </div>`).join('');

  const allTasks = [...ASMR_TASKS, ...state.userTasks];
  const asmrListTab = document.getElementById('asmr-list-tab');
  asmrListTab.innerHTML = allTasks.map(t => `
    <div class="smart-item ${state.asmrDone[t.id] ? 'done' : ''}" data-asmr-id="${t.id}">
      <div style="flex:1">
        <div>${t.name}</div>
        <div class="smart-item-cat">${t.cat}</div>
      </div>
      <button class="assign-btn" data-quick-assign="asmr" data-quick-id="${t.id}">+ Day</button>
    </div>`).join('');
}
