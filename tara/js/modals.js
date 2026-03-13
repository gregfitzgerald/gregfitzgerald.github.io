// ─── MODALS ───────────────────────────────────────────────────────────────────
import { SMART_TASKS, ASMR_TASKS, CATEGORIES } from './data.js';
import { state, save } from './state.js';
import { getBlocks, sameBlock } from './blocks.js';
import { toMin } from './time.js';
import { openCascade } from './cascade.js';
import { renderDetail, renderGrid, renderStats, renderAll } from './render.js';
import { renderDayTasks, renderSmart, renderAsmr } from './tasks.js';

// ─── EDIT BLOCK MODAL ─────────────────────────────────────────────────────────
export function openEditModal(idx) {
  state.editIdx = idx;
  const b = getBlocks(state.selectedDay)[idx];
  document.getElementById('em-start').value = b.s;
  document.getElementById('em-end').value = b.e;
  document.getElementById('em-cat').value = b.c;
  document.getElementById('em-label').value = b.l;
  document.getElementById('em-note').value = b.n || '';
  document.getElementById('edit-modal').classList.add('show');
}

export function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('show');
  state.editIdx = null;
}

export function saveEditBlock() {
  if (state.editIdx === null) return;
  const orig = getBlocks(state.selectedDay)[state.editIdx];
  const oldEndMin = toMin(orig.e);

  const updated = {
    s: document.getElementById('em-start').value,
    e: document.getElementById('em-end').value,
    c: document.getElementById('em-cat').value,
    l: document.getElementById('em-label').value,
    n: document.getElementById('em-note').value || undefined,
    _id: orig._id,
  };

  if (orig._added) {
    const ae = state.edits[state.selectedDay].find(e => e.action === 'add' && sameBlock(e.block, orig));
    if (ae) ae.block = updated;
  } else {
    // Find existing replace edit by orig._id to prevent duplicates
    const re = orig._id
      ? state.edits[state.selectedDay].find(e => e.action === 'replace' && e.orig._id === orig._id)
      : state.edits[state.selectedDay].find(e => e.action === 'replace' && sameBlock(e.block, orig));
    if (re) re.block = updated;
    else state.edits[state.selectedDay].push({
      action: 'replace',
      orig: { s: orig.s, e: orig.e, l: orig.l, _id: orig._id },
      block: updated,
    });
  }

  save();
  closeEditModal();
  renderDetail(state.selectedDay);
  renderGrid();
  renderStats();

  // Bug fix #2: Use oldEndMin (original end time) so adjacent blocks are cascade candidates
  const deltaMin = toMin(updated.e) - oldEndMin;
  if (deltaMin !== 0) {
    setTimeout(() => openCascade(state.selectedDay, oldEndMin, deltaMin, renderDetail, renderGrid, renderStats), 50);
  }
}

export function confirmDeleteBlock() {
  if (state.editIdx === null) return;
  const orig = getBlocks(state.selectedDay)[state.editIdx];
  if (orig._added) {
    state.edits[state.selectedDay] = state.edits[state.selectedDay].filter(
      e => !(e.action === 'add' && sameBlock(e.block, orig))
    );
  } else {
    state.edits[state.selectedDay].push({
      action: 'delete',
      orig: { s: orig.s, e: orig.e, l: orig.l, _id: orig._id },
    });
  }
  save();
  closeEditModal();
  renderDetail(state.selectedDay);
  renderGrid();
  renderStats();
}

// ─── ADD BLOCK MODAL ──────────────────────────────────────────────────────────
export function openAddModal() {
  document.getElementById('add-modal').classList.add('show');
}

export function closeAddModal() {
  document.getElementById('add-modal').classList.remove('show');
}

export function saveAddBlock() {
  const block = {
    s: document.getElementById('am-start').value,
    e: document.getElementById('am-end').value,
    c: document.getElementById('am-cat').value,
    l: document.getElementById('am-label').value || document.getElementById('am-cat').value,
    n: document.getElementById('am-note').value || undefined,
    _id: `user_${Date.now()}`,
  };
  state.edits[state.selectedDay].push({ action: 'add', block });
  save();
  closeAddModal();
  renderDetail(state.selectedDay);
  renderGrid();
  renderStats();
}

// ─── TASK ASSIGN MODAL ────────────────────────────────────────────────────────
export function openTaskAssign() {
  document.getElementById('tm-day').textContent = state.selectedDay;
  renderTaskOptions();
  document.getElementById('task-modal').classList.add('show');
}

export function closeTaskModal() {
  document.getElementById('task-modal').classList.remove('show');
}

export function renderTaskOptions() {
  const src = document.getElementById('tm-source').value;
  const sel = document.getElementById('tm-task');
  const cust = document.getElementById('tm-custom');
  if (src === 'custom') {
    sel.style.display = 'none';
    cust.style.display = 'block';
    return;
  }
  sel.style.display = 'block';
  cust.style.display = 'none';
  const pool = src === 'smart' ? SMART_TASKS : [...ASMR_TASKS, ...state.userTasks];
  sel.innerHTML = pool.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
}

export function assignTask() {
  const src = document.getElementById('tm-source').value;
  let label, refId, type;
  if (src === 'custom') {
    label = document.getElementById('tm-custom').value.trim();
    if (!label) return;
    type = 'custom';
    refId = null;
  } else {
    refId = document.getElementById('tm-task').value;
    const pool = src === 'smart' ? SMART_TASKS : [...ASMR_TASKS, ...state.userTasks];
    const found = pool.find(t => t.id === refId);
    if (!found) return;
    label = found.name;
    type = src;
  }
  if (!state.dayTasks[state.selectedDay]) state.dayTasks[state.selectedDay] = [];
  state.dayTasks[state.selectedDay].push({
    label, type, refId,
    done: refId ? (type === 'smart' ? !!state.smartDone[refId] : !!state.asmrDone[refId]) : false,
  });
  save();
  closeTaskModal();
  renderDayTasks(state.selectedDay);
}

// ─── NEW TASK MODAL ───────────────────────────────────────────────────────────
export function openNewTaskModal() {
  document.getElementById('nt-name').value = '';
  document.getElementById('nt-cat').value = '';
  document.getElementById('new-task-modal').classList.add('show');
  setTimeout(() => document.getElementById('nt-name').focus(), 100);
}

export function closeNewTaskModal() {
  document.getElementById('new-task-modal').classList.remove('show');
}

export function saveNewTask() {
  const name = document.getElementById('nt-name').value.trim();
  const cat = document.getElementById('nt-cat').value.trim() || 'General';
  if (!name) return;
  state.userTasks.push({ id: 'u' + Date.now(), name, cat });
  save();
  closeNewTaskModal();
  renderAsmr();
}
