// ─── APP INIT ─────────────────────────────────────────────────────────────────
import { ALL_DAYS } from './data.js';
import { state, load, save, exportData, clearAllData, setSaveHook } from './state.js';
import { getBlocks } from './blocks.js';
import {
  renderAll, renderGrid, renderDetail, renderStats, renderTabs,
  renderDayStrip, setTaskRenderers, toggleReset, clearReset,
  renderWeeklyReset, renderResetTab,
} from './render.js';
import {
  renderSmart, renderAsmr, toggleSmart, toggleAsmr,
  quickAssign, toggleDayTask, deleteDayTask, renderTasksTab,
} from './tasks.js';
import {
  openEditModal, closeEditModal, saveEditBlock, confirmDeleteBlock,
  openAddModal, closeAddModal, saveAddBlock,
  openTaskAssign, closeTaskModal, renderTaskOptions, assignTask,
  openNewTaskModal, closeNewTaskModal, saveNewTask,
} from './modals.js';
import {
  toggleCascade, selectAllCascade, applyCascade, closeCascade,
} from './cascade.js';
import { initSync, connectSync, disconnectSync, syncNow, debouncedSync } from './sync.js';
import { initDrag } from './drag.js';

// Wire up task renderers to avoid circular dependency
setTaskRenderers(renderSmart, renderAsmr);

// Wire up sync: every save() triggers a debounced push to Firebase
setSaveHook(debouncedSync);

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function selectDay(day, direction) {
  const oldDay = state.selectedDay;
  state.selectedDay = day;
  renderGrid();
  renderDayStrip();

  // Animate slide if direction is specified (arrow navigation)
  if (direction && oldDay) {
    animateSlide(direction, () => {
      renderDetail(day);
      updateDayNavButtons();
      initDragForCurrentDay();
    });
  } else {
    renderDetail(day);
    updateDayNavButtons();
    initDragForCurrentDay();
  }
}

function initDragForCurrentDay() {
  // Re-init drag after timeline is rendered
  setTimeout(() => initDrag(renderDetail, renderGrid, renderStats), 50);
}

function closeDetail() {
  state.selectedDay = null;
  renderGrid();
  renderDayStrip();
  document.getElementById('detail').classList.remove('show');
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

// ─── SWIPE PAGE-TURN ANIMATION ───────────────────────────────────────────────
function animateSlide(direction, onMidpoint) {
  const slide = document.getElementById('detail-slide');
  if (!slide) { onMidpoint(); return; }

  // Slide current content out
  const outClass = direction === 'left' ? 'slide-out-left' : 'slide-out-right';
  const inClass = direction === 'left' ? 'slide-in-left' : 'slide-in-right';

  slide.classList.add(outClass);

  const onOutDone = () => {
    slide.removeEventListener('transitionend', onOutDone);
    slide.classList.remove(outClass);

    // Render new content
    onMidpoint();

    // Position new content off-screen on the incoming side
    slide.classList.add(inClass);

    // Force reflow so the browser registers the starting position
    slide.offsetHeight;

    // Slide in
    slide.classList.remove(inClass);
    slide.classList.add('slide-enter');

    const onInDone = () => {
      slide.removeEventListener('transitionend', onInDone);
      slide.classList.remove('slide-enter');
    };
    slide.addEventListener('transitionend', onInDone, { once: true });
  };
  slide.addEventListener('transitionend', onOutDone, { once: true });
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
  if (tab === 'settings') updateSyncButtons();
  if (tab === 'schedule') {
    renderAll();
    renderDayStrip();
  }
}

// ─── SYNC UI HELPERS ─────────────────────────────────────────────────────────
function updateSyncButtons() {
  const connected = !!state.syncHash;
  const connectBtn = document.getElementById('sync-connect-btn');
  const disconnectBtn = document.getElementById('sync-disconnect-btn');
  const syncNowBtn = document.getElementById('sync-now-btn');
  const input = document.getElementById('sync-passphrase');

  if (connectBtn) connectBtn.style.display = connected ? 'none' : 'flex';
  if (disconnectBtn) disconnectBtn.style.display = connected ? 'flex' : 'none';
  if (syncNowBtn) syncNowBtn.style.display = connected ? 'flex' : 'none';
  if (input) input.disabled = connected;
  if (input && connected) input.value = '********';
}

// ─── DAY NAVIGATION (arrow buttons) ──────────────────────────────────────────
function goToPrevDay() {
  if (!state.selectedDay) return;
  const idx = ALL_DAYS.indexOf(state.selectedDay);
  if (idx > 0) selectDay(ALL_DAYS[idx - 1], 'right');
}

function goToNextDay() {
  if (!state.selectedDay) return;
  const idx = ALL_DAYS.indexOf(state.selectedDay);
  if (idx < ALL_DAYS.length - 1) selectDay(ALL_DAYS[idx + 1], 'left');
}

function updateDayNavButtons() {
  const idx = ALL_DAYS.indexOf(state.selectedDay);
  const prev = document.getElementById('prev-day-btn');
  const next = document.getElementById('next-day-btn');
  if (prev) prev.disabled = idx <= 0;
  if (next) next.disabled = idx >= ALL_DAYS.length - 1;
}

// ─── EVENT DELEGATION ─────────────────────────────────────────────────────────
document.addEventListener('click', (e) => {
  const target = e.target;

  // Week view tabs
  const viewTab = target.closest('[data-view]');
  if (viewTab) { setView(viewTab.dataset.view); return; }

  // Day card click
  const dayCard = target.closest('[data-day]');
  if (dayCard && !target.closest('.bottom-nav')) {
    selectDay(dayCard.dataset.day);
    return;
  }

  // Block click -> edit modal
  const blockEl = target.closest('[data-block-idx]');
  if (blockEl) { openEditModal(parseInt(blockEl.dataset.blockIdx)); return; }

  // Day nav arrows
  if (target.closest('#prev-day-btn')) { goToPrevDay(); return; }
  if (target.closest('#next-day-btn')) { goToNextDay(); return; }

  // Close detail
  if (target.closest('#close-detail-btn')) { closeDetail(); return; }

  // Reset day
  if (target.closest('#reset-day-btn')) { resetDay(); return; }

  // Add block
  if (target.closest('#add-block-btn')) { openAddModal(); return; }

  // Assign task to day
  if (target.closest('#assign-task-btn')) { openTaskAssign(); return; }

  // Edit modal buttons
  if (target.closest('#em-save')) { saveEditBlock(); return; }
  if (target.closest('#em-cancel')) { closeEditModal(); return; }
  if (target.closest('#em-delete')) { confirmDeleteBlock(); return; }

  // Add modal buttons
  if (target.closest('#am-save')) { saveAddBlock(); return; }
  if (target.closest('#am-cancel')) { closeAddModal(); return; }

  // Cascade modal buttons
  if (target.closest('#cascade-skip')) { closeCascade(); return; }
  if (target.closest('#cascade-all')) { selectAllCascade(); return; }
  if (target.closest('#cascade-apply')) { applyCascade(); return; }

  // Cascade item toggle
  const cascadeItem = target.closest('[data-cascade-idx]');
  if (cascadeItem) {
    toggleCascade(parseInt(cascadeItem.dataset.cascadeIdx));
    return;
  }

  // Task modal buttons
  if (target.closest('#tm-save')) { assignTask(); return; }
  if (target.closest('#tm-cancel')) { closeTaskModal(); return; }

  // New task modal buttons
  if (target.closest('#nt-save')) { saveNewTask(); return; }
  if (target.closest('#nt-cancel')) { closeNewTaskModal(); return; }
  if (target.closest('#new-task-btn') || target.closest('#new-task-btn-tab')) { openNewTaskModal(); return; }

  // Smart task toggle
  const smartItem = target.closest('[data-smart-id]');
  if (smartItem && !target.closest('.assign-btn')) {
    toggleSmart(smartItem.dataset.smartId);
    return;
  }

  // Asmr task toggle
  const asmrItem = target.closest('[data-asmr-id]');
  if (asmrItem && !target.closest('.assign-btn')) {
    toggleAsmr(asmrItem.dataset.asmrId);
    return;
  }

  // Quick assign button
  const assignBtn = target.closest('[data-quick-assign]');
  if (assignBtn) {
    quickAssign(assignBtn.dataset.quickAssign, assignBtn.dataset.quickId);
    return;
  }

  // Day task delete
  const delBtn = target.closest('[data-del-day]');
  if (delBtn) {
    deleteDayTask(delBtn.dataset.delDay, parseInt(delBtn.dataset.delIdx));
    return;
  }

  // Export / clear data (both mobile settings tab and desktop sidebar)
  if (target.closest('#export-btn') || target.closest('#export-btn-desktop')) { exportData(); return; }
  if (target.closest('#clear-btn') || target.closest('#clear-btn-desktop')) { clearAllData(renderAll); return; }

  // Clear reset
  if (target.closest('#clear-reset-btn')) { clearReset(); return; }

  // Sync buttons
  if (target.closest('#sync-connect-btn')) {
    const input = document.getElementById('sync-passphrase');
    if (input && input.value.trim()) {
      connectSync(input.value.trim()).then(() => updateSyncButtons());
    }
    return;
  }
  if (target.closest('#sync-disconnect-btn')) {
    disconnectSync();
    const input = document.getElementById('sync-passphrase');
    if (input) { input.value = ''; input.disabled = false; }
    updateSyncButtons();
    return;
  }
  if (target.closest('#sync-now-btn')) {
    syncNow();
    return;
  }

  // Bottom nav
  const navBtn = target.closest('[data-tab]');
  if (navBtn && target.closest('.bottom-nav')) { switchTab(navBtn.dataset.tab); return; }

  // Overlay click-to-close
  if (target.classList.contains('overlay') && target.classList.contains('show')) {
    target.classList.remove('show');
    state.editIdx = null;
    return;
  }
});

// Change events (checkboxes, selects)
document.addEventListener('change', (e) => {
  const target = e.target;

  // Day task checkbox
  if (target.dataset.dayTask) {
    toggleDayTask(target.dataset.dayTask, parseInt(target.dataset.taskIdx));
    return;
  }

  // Reset checkbox
  if (target.dataset.resetId) {
    toggleReset(target.dataset.resetId);
    return;
  }

  // Task source select
  if (target.id === 'tm-source') {
    renderTaskOptions();
    return;
  }
});

// Swipe navigation removed -- conflicts with Chrome's back gesture on mobile.
// Day navigation uses arrow buttons instead.

// ─── INIT ─────────────────────────────────────────────────────────────────────
// Bug fix #1: localStorage nuke IIFE removed entirely -- data persists across refreshes
load();
renderAll();
renderDayStrip();

// Auto-select today's day
const todayIdx = new Date().getDay();
const todayMap = [6, 0, 1, 2, 3, 4, 5]; // JS Sunday=0 -> our SUN=6
const todayDay = ALL_DAYS[todayMap[todayIdx]];
selectDay(todayDay);

// Initialize sync (restores saved passphrase, pulls remote data)
initSync(renderAll);

// ─── SERVICE WORKER ───────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
