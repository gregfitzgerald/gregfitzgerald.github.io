// ─── APP INIT ─────────────────────────────────────────────────────────────────
import { ALL_DAYS } from './data.js';
import { state, load, save, exportData, clearAllData, setSaveHook, getCurrentWeek } from './state.js';
import { getBlocks, sameBlock } from './blocks.js';
import { toMin } from './time.js';
import {
  renderAll, renderGrid, renderDetail, renderStats, renderTabs,
  renderDayStrip, setTaskRenderers, toggleReset, clearReset,
  renderWeeklyReset, renderResetTab,
} from './render.js';
import {
  renderSmart, renderAsmr, toggleSmart, toggleAsmr,
  quickAssign, toggleDayTask, deleteDayTask, deleteUserTask, renderTasksTab,
  renderDayNotes,
} from './tasks.js';
import {
  openEditModal, closeEditModal, saveEditBlock, confirmDeleteBlock,
  openAddModal, closeAddModal, saveAddBlock,
  openTaskAssign, closeTaskModal, renderTaskOptions, assignTask,
  openNewTaskModal, closeNewTaskModal, saveNewTask,
} from './modals.js';
import {
  toggleCascade, selectAllCascade, applyCascade, closeCascade, openCascade,
} from './cascade.js';
import { initSync, syncNow, debouncedSync } from './sync.js';
import { initCalendar, timeStr } from './fullcalendar-bridge.js';

setTaskRenderers(renderSmart, renderAsmr);
setSaveHook(debouncedSync);

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function otherWeek() { return state.view === 'w1' ? 'w2' : 'w1'; }

function selectDay(day, switchWeek) {
  if (switchWeek) {
    state.view = otherWeek();
    renderTabs();
  }
  state.selectedDay = day;
  renderGrid();
  renderDayStrip();
  renderDetail(day);
}

function resetDay() {
  if (!state.selectedDay) return;
  if (!confirm(`Reset ${state.selectedDay} to default schedule? All edits for this day will be removed.`)) return;
  state.edits[state.selectedDay] = [];
  state.dayTasks[state.selectedDay] = [];
  save();
  renderGrid();
  renderDetail(state.selectedDay);
  renderStats();
}

function setView(v) {
  state.view = v;
  renderAll();
  renderDayStrip();
}

// ─── FULLCALENDAR EVENT HANDLERS ─────────────────────────────────────────────

function handleEventClick(info) {
  if (info.jsEvent.target.closest('.tblock-check') || info.jsEvent.target.closest('.tblock-edit-btn')) return;
  const idx = info.event.extendedProps.blockIdx;
  openEditModal(idx);
}

function handleEventDrop(info) {
  const p = info.event.extendedProps;
  const blocks = getBlocks(state.selectedDay);
  const orig = blocks[p.blockIdx];
  if (!orig) { info.revert(); return; }

  const newS = timeStr(info.event.start);
  const newE = timeStr(info.event.end);
  const updated = { s: newS, e: newE, c: orig.c, l: orig.l, n: orig.n, _id: orig._id };

  if (orig._added) {
    const ae = state.edits[state.selectedDay].find(e => e.action === 'add' && sameBlock(e.block, orig));
    if (ae) ae.block = updated;
  } else {
    const re = orig._id
      ? state.edits[state.selectedDay].find(e => e.action === 'replace' && e.orig._id === orig._id)
      : null;
    if (re) re.block = updated;
    else state.edits[state.selectedDay].push({
      action: 'replace',
      orig: { s: orig.s, e: orig.e, l: orig.l, _id: orig._id },
      block: updated,
    });
  }

  save();
  renderDetail(state.selectedDay);
  renderGrid();
  renderStats();
}

function handleEventResize(info) {
  const p = info.event.extendedProps;
  const blocks = getBlocks(state.selectedDay);
  const orig = blocks[p.blockIdx];
  if (!orig) { info.revert(); return; }

  const oldEndMin = toMin(orig.e);
  const newS = timeStr(info.event.start);
  const newE = timeStr(info.event.end);
  const updated = { s: newS, e: newE, c: orig.c, l: orig.l, n: orig.n, _id: orig._id };

  if (orig._added) {
    const ae = state.edits[state.selectedDay].find(e => e.action === 'add' && sameBlock(e.block, orig));
    if (ae) ae.block = updated;
  } else {
    const re = orig._id
      ? state.edits[state.selectedDay].find(e => e.action === 'replace' && e.orig._id === orig._id)
      : null;
    if (re) re.block = updated;
    else state.edits[state.selectedDay].push({
      action: 'replace',
      orig: { s: orig.s, e: orig.e, l: orig.l, _id: orig._id },
      block: updated,
    });
  }

  save();
  renderDetail(state.selectedDay);
  renderGrid();
  renderStats();

  const deltaMin = toMin(newE) - oldEndMin;
  if (deltaMin !== 0) {
    setTimeout(() => openCascade(state.selectedDay, oldEndMin, deltaMin, renderDetail, renderGrid, renderStats), 50);
  }
}

// ─── LONG-PRESS ON CHECKBOX FOR NOTE ─────────────────────────────────────
{
  let _lpTimer = null;
  document.addEventListener('touchstart', (e) => {
    const check = e.target.closest('.tblock-check');
    if (!check) return;
    _lpTimer = setTimeout(() => {
      const key = check.dataset.doneKey;
      if (!key) return;
      const existing = state.blockDone[key] && state.blockDone[key].note || '';
      const note = prompt('Add a note:', existing);
      if (note !== null) {
        if (!state.blockDone[key]) state.blockDone[key] = { done: false, note: '' };
        state.blockDone[key].note = note;
        save();
        if (state.selectedDay) renderDetail(state.selectedDay);
      }
    }, 500);
  }, { passive: true });
  document.addEventListener('touchend', () => { clearTimeout(_lpTimer); }, { passive: true });
  document.addEventListener('touchmove', () => { clearTimeout(_lpTimer); }, { passive: true });
}

// ─── BOTTOM NAV TABS ──────────────────────────────────────────────────────────
function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.bottom-nav-btn').forEach(el => el.classList.remove('active'));

  const content = document.getElementById(`${tab}-tab`);
  if (content) content.classList.add('active');
  const btn = document.querySelector(`.bottom-nav-btn[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');

  if (tab === 'tasks') renderTasksTab();
  if (tab === 'reset') renderResetTab();
  if (tab === 'settings') initSettingsTab();
  if (tab === 'schedule') {
    renderAll();
    renderDayStrip();
  }
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function initSettingsTab() {
  const input = document.getElementById('cycle-start-input');
  const status = document.getElementById('cycle-status');
  if (!input) return;
  if (state.cycleStart) input.value = state.cycleStart;
  updateCycleStatus();
}

function updateCycleStatus() {
  const status = document.getElementById('cycle-status');
  if (!status) return;
  const week = getCurrentWeek();
  if (week) {
    status.textContent = `Currently: ${week === 'w1' ? 'Week 1' : 'Week 2'}`;
    status.style.color = 'var(--exercise)';
  } else {
    status.textContent = 'Not set -- using manual Week 1/2 tabs.';
    status.style.color = 'var(--dim)';
  }
}

function setCycleStart(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (d.getDay() !== 1) {
    const dow = d.getDay();
    const offset = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + offset);
    dateStr = d.toISOString().split('T')[0];
    const input = document.getElementById('cycle-start-input');
    if (input) input.value = dateStr;
  }
  state.cycleStart = dateStr;
  save();
  const autoWeek = getCurrentWeek();
  if (autoWeek) {
    state.view = autoWeek;
    renderAll();
    renderDayStrip();
    if (state.selectedDay) renderDetail(state.selectedDay);
  }
  updateCycleStatus();
}

// ─── EVENT DELEGATION ─────────────────────────────────────────────────────────
document.addEventListener('click', (e) => {
  const target = e.target;

  const viewTab = target.closest('[data-view]');
  if (viewTab) { setView(viewTab.dataset.view); return; }

  const dayCard = target.closest('[data-day]');
  if (dayCard && !target.closest('.bottom-nav')) {
    selectDay(dayCard.dataset.day);
    return;
  }

  // Edit button inside FC events
  const editBtn = target.closest('.tblock-edit-btn[data-edit-idx]');
  if (editBtn) { openEditModal(parseInt(editBtn.dataset.editIdx)); return; }

  if (target.closest('#reset-day-btn')) { resetDay(); return; }
  if (target.closest('#add-block-btn')) { openAddModal(); return; }
  if (target.closest('#assign-task-btn')) { openTaskAssign(); return; }

  if (target.closest('#em-save')) { saveEditBlock(); return; }
  if (target.closest('#em-cancel')) { closeEditModal(); return; }
  if (target.closest('#em-delete')) { confirmDeleteBlock(); return; }

  if (target.closest('#am-save')) { saveAddBlock(); return; }
  if (target.closest('#am-cancel')) { closeAddModal(); return; }

  if (target.closest('#cascade-skip')) { closeCascade(); return; }
  if (target.closest('#cascade-all')) { selectAllCascade(); return; }
  if (target.closest('#cascade-apply')) { applyCascade(); return; }

  const cascadeItem = target.closest('[data-cascade-idx]');
  if (cascadeItem) { toggleCascade(parseInt(cascadeItem.dataset.cascadeIdx)); return; }

  if (target.closest('#tm-save')) { assignTask(); return; }
  if (target.closest('#tm-cancel')) { closeTaskModal(); return; }

  if (target.closest('#nt-save')) { saveNewTask(); return; }
  if (target.closest('#nt-cancel')) { closeNewTaskModal(); return; }
  if (target.closest('#new-task-btn') || target.closest('#new-task-btn-tab')) { openNewTaskModal(); return; }

  const delTaskBtn = target.closest('[data-delete-task]');
  if (delTaskBtn) { deleteUserTask(delTaskBtn.dataset.deleteTask); return; }

  const smartItem = target.closest('[data-smart-id]');
  if (smartItem && !target.closest('.assign-btn')) { toggleSmart(smartItem.dataset.smartId); return; }

  const asmrItem = target.closest('[data-asmr-id]');
  if (asmrItem && !target.closest('.assign-btn')) { toggleAsmr(asmrItem.dataset.asmrId); return; }

  const assignBtn = target.closest('[data-quick-assign]');
  if (assignBtn) { quickAssign(assignBtn.dataset.quickAssign, assignBtn.dataset.quickId); return; }

  if (target.closest('#add-note-btn')) {
    const note = prompt('Note for Papi/Adam:');
    if (note && note.trim() && state.selectedDay) {
      if (!state.dayNotes[state.selectedDay]) state.dayNotes[state.selectedDay] = [];
      state.dayNotes[state.selectedDay].push({ text: note.trim(), id: 'n' + Date.now() });
      save();
      renderDayNotes(state.selectedDay);
    }
    return;
  }

  const delNoteBtn = target.closest('[data-del-note-idx]');
  if (delNoteBtn && state.selectedDay) {
    const idx = parseInt(delNoteBtn.dataset.delNoteIdx);
    if (state.dayNotes[state.selectedDay]) {
      state.dayNotes[state.selectedDay].splice(idx, 1);
      save();
      renderDayNotes(state.selectedDay);
    }
    return;
  }

  const delBtn = target.closest('[data-del-day]');
  if (delBtn) { deleteDayTask(delBtn.dataset.delDay, parseInt(delBtn.dataset.delIdx)); return; }

  if (target.closest('#export-btn') || target.closest('#export-btn-desktop')) { exportData(); return; }
  if (target.closest('#clear-btn') || target.closest('#clear-btn-desktop')) { clearAllData(renderAll); return; }
  if (target.closest('#clear-reset-btn')) { clearReset(); return; }
  if (target.closest('#sync-now-btn')) { syncNow(); return; }

  if (target.closest('#force-refresh-btn')) {
    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => {
        if (navigator.serviceWorker) {
          navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(r => r.unregister());
            window.location.href = location.pathname + '?v=' + Date.now();
          });
        } else {
          window.location.href = location.pathname + '?v=' + Date.now();
        }
      });
    } else {
      window.location.href = location.pathname + '?v=' + Date.now();
    }
    return;
  }

  const navBtn = target.closest('[data-tab]');
  if (navBtn && target.closest('.bottom-nav')) { switchTab(navBtn.dataset.tab); return; }

  if (target.classList.contains('overlay') && target.classList.contains('show')) {
    target.classList.remove('show');
    state.editIdx = null;
    return;
  }
});

document.addEventListener('change', (e) => {
  const target = e.target;

  if (target.classList.contains('tblock-check') && target.dataset.doneKey) {
    const key = target.dataset.doneKey;
    if (!state.blockDone[key]) state.blockDone[key] = { done: false, note: '' };
    state.blockDone[key].done = target.checked;
    save();
    if (state.selectedDay) renderDetail(state.selectedDay);
    return;
  }

  if (target.dataset.dayTask) {
    toggleDayTask(target.dataset.dayTask, parseInt(target.dataset.taskIdx));
    return;
  }

  if (target.dataset.resetId) {
    toggleReset(target.dataset.resetId);
    return;
  }

  if (target.id === 'tm-source') { renderTaskOptions(); return; }
  if (target.id === 'cycle-start-input') { if (target.value) setCycleStart(target.value); return; }
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
load();

const autoWeek = getCurrentWeek();
if (autoWeek) state.view = autoWeek;

// Initialize FullCalendar
const fcEl = document.getElementById('fc-calendar');
if (fcEl) {
  initCalendar(fcEl, {
    onEventClick: handleEventClick,
    onEventDrop: handleEventDrop,
    onEventResize: handleEventResize,
  });
}

renderAll();
renderDayStrip();

const todayDay = ALL_DAYS[new Date().getDay()];
selectDay(todayDay);

initSync(renderAll);

// ─── SERVICE WORKER ───────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
