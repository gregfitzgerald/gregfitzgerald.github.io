// ─── STATE ────────────────────────────────────────────────────────────────────
import { ALL_DAYS } from './data.js';

export const state = {
  view: 'w1',
  selectedDay: null,
  editIdx: null,
  cascadeData: null,
  edits: {},
  smartDone: {},
  asmrDone: {},
  dayTasks: {},
  resetDone: {},
  userTasks: [],
  activeTab: 'schedule',
};

// Initialize edits and dayTasks for all days
ALL_DAYS.forEach(d => {
  state.edits[d] = [];
  state.dayTasks[d] = [];
});

// ─── PERSISTENCE ─────────────────────────────────────────────────────────────
export function save() {
  try {
    localStorage.setItem('t4_edits', JSON.stringify(state.edits));
    localStorage.setItem('t4_smartDone', JSON.stringify(state.smartDone));
    localStorage.setItem('t4_asmrDone', JSON.stringify(state.asmrDone));
    localStorage.setItem('t4_dayTasks', JSON.stringify(state.dayTasks));
    localStorage.setItem('t4_resetDone', JSON.stringify(state.resetDone));
    localStorage.setItem('t4_userTasks', JSON.stringify(state.userTasks));
  } catch (e) { /* quota exceeded or private browsing */ }
}

export function load() {
  try {
    const e = localStorage.getItem('t4_edits');
    if (e) state.edits = JSON.parse(e);
    const sd = localStorage.getItem('t4_smartDone');
    if (sd) state.smartDone = JSON.parse(sd);
    const ad = localStorage.getItem('t4_asmrDone');
    if (ad) state.asmrDone = JSON.parse(ad);
    const dt = localStorage.getItem('t4_dayTasks');
    if (dt) state.dayTasks = JSON.parse(dt);
    const rd = localStorage.getItem('t4_resetDone');
    if (rd) state.resetDone = JSON.parse(rd);
    const ut = localStorage.getItem('t4_userTasks');
    if (ut) state.userTasks = JSON.parse(ut);
    // Ensure all days exist
    ALL_DAYS.forEach(d => {
      if (!state.edits[d]) state.edits[d] = [];
      if (!state.dayTasks[d]) state.dayTasks[d] = [];
    });
  } catch (e) { /* corrupted data, use defaults */ }
}

export function exportData() {
  const data = {
    edits: state.edits,
    smartDone: state.smartDone,
    asmrDone: state.asmrDone,
    dayTasks: state.dayTasks,
    resetDone: state.resetDone,
    userTasks: state.userTasks,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tara_schedule_data.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function clearAllData(renderAll) {
  if (!confirm('Clear ALL saved data and start fresh? This cannot be undone.')) return;
  ['t4_edits', 't4_smartDone', 't4_asmrDone', 't4_dayTasks', 't4_resetDone', 't4_userTasks']
    .forEach(k => localStorage.removeItem(k));
  ALL_DAYS.forEach(d => { state.edits[d] = []; state.dayTasks[d] = []; });
  state.smartDone = {};
  state.asmrDone = {};
  state.resetDone = {};
  state.userTasks = [];
  renderAll();
}
