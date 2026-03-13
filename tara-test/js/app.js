// ─── APP INIT ─────────────────────────────────────────────────────────────────
import { ALL_DAYS } from './data.js';
import { state, load, save, exportData, clearAllData, setSaveHook, getCurrentWeek } from './state.js';
import { getBlocks } from './blocks.js';
import {
  renderAll, renderGrid, renderDetail, renderDayPreview, renderStats, renderTabs,
  renderDayStrip, setTaskRenderers, toggleReset, clearReset,
  renderWeeklyReset, renderResetTab, updateTimeIndicator,
} from './render.js';
import {
  renderSmart, renderAsmr, toggleSmart, toggleAsmr,
  quickAssign, toggleDayTask, deleteDayTask, renderTasksTab,
  renderDayNotes,
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
import { initSync, syncNow, debouncedSync } from './sync.js';
import { initDrag } from './drag.js';

// Wire up task renderers to avoid circular dependency
setTaskRenderers(renderSmart, renderAsmr);

// Wire up sync: every save() triggers a debounced push to Firebase
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
  renderAdjacentPreviews();
  initDragForCurrentDay();
}

function renderAdjacentPreviews() {
  const idx = ALL_DAYS.indexOf(state.selectedDay);
  const prevPanel = document.getElementById('swipe-prev');
  const nextPanel = document.getElementById('swipe-next');

  if (idx > 0) {
    // Normal prev day within same week
    if (prevPanel) prevPanel.innerHTML = renderDayPreview(ALL_DAYS[idx - 1]);
  } else {
    // MON -> show SUN of other week
    if (prevPanel) prevPanel.innerHTML = renderDayPreview('SUN', otherWeek(), -1);
  }

  if (idx < ALL_DAYS.length - 1) {
    // Normal next day within same week
    if (nextPanel) nextPanel.innerHTML = renderDayPreview(ALL_DAYS[idx + 1]);
  } else {
    // SUN -> show MON of other week
    if (nextPanel) nextPanel.innerHTML = renderDayPreview('MON', otherWeek(), 1);
  }
}

function initDragForCurrentDay() {
  // Re-init drag after timeline is rendered
  setTimeout(() => initDrag(renderDetail, renderGrid, renderStats), 50);
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

// ─── PEEK-SWIPE NAVIGATION ───────────────────────────────────────────────────
// Swipe the detail panel to peek at adjacent days, with real-time finger tracking.
{
  const container = document.getElementById('swipe-container');
  if (container) {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    let locked = false; // true once we decide horizontal vs vertical
    let isHorizontal = false;
    const THRESHOLD = 0.25; // 25% of panel width to commit

    container.addEventListener('touchstart', (e) => {
      // Don't interfere with drag-to-reorder
      if (document.body.classList.contains('dragging')) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
      locked = false;
      isHorizontal = false;
      container.classList.remove('snapping');
      container.classList.add('swiping');
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!tracking) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      // Lock direction after 10px of movement
      if (!locked && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        locked = true;
        isHorizontal = Math.abs(dx) > Math.abs(dy);
        if (!isHorizontal) {
          // Vertical scroll -- stop tracking
          tracking = false;
          container.classList.remove('swiping');
          container.style.transform = '';
          return;
        }
      }

      if (!isHorizontal) return;

      // Prevent vertical scroll while swiping horizontally
      e.preventDefault();

      const panelWidth = container.parentElement.offsetWidth;
      // Offset as percentage of total container (300% wide, showing center third)
      // Default position: translateX(-33.333%)
      // dx positive = swiping right (prev day), dx negative = swiping left (next day)
      const pct = (dx / panelWidth) * 33.333;

      // Always allow swiping -- cross-week wrapping at boundaries
      container.style.transform = `translateX(${-33.333 + pct}%)`;
    }, { passive: false });

    container.addEventListener('touchend', (e) => {
      if (!tracking || !isHorizontal) {
        tracking = false;
        container.classList.remove('swiping');
        return;
      }
      tracking = false;
      container.classList.remove('swiping');

      const dx = e.changedTouches[0].clientX - startX;
      const panelWidth = container.parentElement.offsetWidth;
      const ratio = Math.abs(dx) / panelWidth;
      const idx = ALL_DAYS.indexOf(state.selectedDay);

      if (ratio > THRESHOLD) {
        // Commit: animate to the target panel
        container.classList.add('snapping');
        if (dx > 0) {
          // Swipe right = go to previous day (or wrap to other week's SUN)
          container.style.transform = 'translateX(0%)';
          container.addEventListener('transitionend', () => {
            container.classList.remove('snapping');
            container.style.transform = '';
            if (idx > 0) {
              selectDay(ALL_DAYS[idx - 1]);
            } else {
              selectDay('SUN', true); // wrap to other week
            }
          }, { once: true });
        } else if (dx < 0) {
          // Swipe left = go to next day (or wrap to other week's MON)
          container.style.transform = 'translateX(-66.666%)';
          container.addEventListener('transitionend', () => {
            container.classList.remove('snapping');
            container.style.transform = '';
            if (idx < ALL_DAYS.length - 1) {
              selectDay(ALL_DAYS[idx + 1]);
            } else {
              selectDay('MON', true); // wrap to other week
            }
          }, { once: true });
        }
      } else {
        // Cancel: snap back to center
        container.classList.add('snapping');
        container.style.transform = '';
        container.addEventListener('transitionend', () => {
          container.classList.remove('snapping');
        }, { once: true });
      }
    }, { passive: true });
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
  // Validate it's a Monday
  const d = new Date(dateStr + 'T00:00:00');
  if (d.getDay() !== 1) {
    // Find the Monday of that week
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

  // Week view tabs
  const viewTab = target.closest('[data-view]');
  if (viewTab) { setView(viewTab.dataset.view); return; }

  // Day card click
  const dayCard = target.closest('[data-day]');
  if (dayCard && !target.closest('.bottom-nav')) {
    selectDay(dayCard.dataset.day);
    return;
  }

  // Edit button on block
  const editBtn = target.closest('.tblock-edit-btn[data-edit-idx]');
  if (editBtn) { openEditModal(parseInt(editBtn.dataset.editIdx)); return; }

  // Block click -> edit modal (but not if clicking checkbox or edit button)
  const blockEl = target.closest('[data-block-idx]');
  if (blockEl && !target.closest('.tblock-check') && !target.closest('.tblock-edit-btn')) {
    openEditModal(parseInt(blockEl.dataset.blockIdx));
    return;
  }


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

  // Add note (Papi/Adam)
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

  // Delete note
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

  // Manual sync
  if (target.closest('#sync-now-btn')) {
    syncNow();
    return;
  }

  // Force refresh: clear all caches and reload
  if (target.closest('#force-refresh-btn')) {
    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => {
        if (navigator.serviceWorker) {
          navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(r => r.unregister());
            window.location.reload(true);
          });
        } else {
          window.location.reload(true);
        }
      });
    } else {
      window.location.reload(true);
    }
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

  // Block completion checkbox
  if (target.classList.contains('tblock-check') && target.dataset.doneKey) {
    const key = target.dataset.doneKey;
    if (!state.blockDone[key]) state.blockDone[key] = { done: false, note: '' };
    state.blockDone[key].done = target.checked;
    save();
    if (state.selectedDay) renderDetail(state.selectedDay);
    return;
  }

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

  // Cycle start date
  if (target.id === 'cycle-start-input') {
    if (target.value) setCycleStart(target.value);
    return;
  }
});


// ─── INIT ─────────────────────────────────────────────────────────────────────
// Bug fix #1: localStorage nuke IIFE removed entirely -- data persists across refreshes
load();

// Auto-detect week from cycle start date
const autoWeek = getCurrentWeek();
if (autoWeek) state.view = autoWeek;

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

// ─── TIME INDICATOR UPDATE (every 60s) ──────────────────────────────────
setInterval(updateTimeIndicator, 60000);
