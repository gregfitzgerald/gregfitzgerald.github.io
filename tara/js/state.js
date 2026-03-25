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
  blockDone: {},
  dayNotes: {},
  activeTab: 'schedule',
  syncStatus: 'connected',
  cycleStart: "2026-03-09", // ISO date string of a known Week 1 Monday
};

// Initialize edits and dayTasks for all days
ALL_DAYS.forEach(d => {
  state.edits[d] = [];
  state.dayTasks[d] = [];
});

// Sync callback -- set by app.js after sync module loads
let _onSave = null;
export function setSaveHook(fn) { _onSave = fn; }

// ─── PERSISTENCE ─────────────────────────────────────────────────────────────
export function save() {
  try {
    localStorage.setItem('t4_edits', JSON.stringify(state.edits));
    localStorage.setItem('t4_smartDone', JSON.stringify(state.smartDone));
    localStorage.setItem('t4_asmrDone', JSON.stringify(state.asmrDone));
    localStorage.setItem('t4_dayTasks', JSON.stringify(state.dayTasks));
    localStorage.setItem('t4_resetDone', JSON.stringify(state.resetDone));
    localStorage.setItem('t4_userTasks', JSON.stringify(state.userTasks));
    localStorage.setItem('t4_blockDone', JSON.stringify(state.blockDone));
    localStorage.setItem('t4_dayNotes', JSON.stringify(state.dayNotes));
    if (state.cycleStart) localStorage.setItem('t4_cycleStart', state.cycleStart);
    localStorage.setItem('t4_lastModified', String(Date.now()));
  } catch (e) { /* quota exceeded or private browsing */ }
  if (_onSave) _onSave();
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
    const bd = localStorage.getItem('t4_blockDone');
    if (bd) state.blockDone = JSON.parse(bd);
    const dn = localStorage.getItem('t4_dayNotes');
    if (dn) state.dayNotes = JSON.parse(dn);
    const cs = localStorage.getItem('t4_cycleStart');
    if (cs) state.cycleStart = cs;
    // Ensure all days exist
    ALL_DAYS.forEach(d => {
      if (!state.edits[d]) state.edits[d] = [];
      if (!state.dayTasks[d]) state.dayTasks[d] = [];
    });
    // Migrate old categories
    ALL_DAYS.forEach(d => {
      (state.edits[d] || []).forEach(e => {
        const remap = {admin:'errands', administrative:'errands', gaming:'social', free:'other', intimacy:'social'};
        if (e.block && remap[e.block.c]) e.block.c = remap[e.block.c];
        if (e.orig && remap[e.orig.c]) e.orig.c = remap[e.orig.c];
      });
    });
    // Clean up duplicate edits: for replace edits targeting the same _id, keep only the last one
    ALL_DAYS.forEach(d => {
      const edits = state.edits[d];
      if (!edits || !edits.length) return;
      const lastById = new Map();
      for (let i = 0; i < edits.length; i++) {
        const e = edits[i];
        if (e.action === 'replace' && e.orig && e.orig._id) {
          lastById.set(e.orig._id, i);
        }
      }
      if (lastById.size) {
        const dupeIndices = new Set();
        for (let i = 0; i < edits.length; i++) {
          const e = edits[i];
          if (e.action === 'replace' && e.orig && e.orig._id && lastById.get(e.orig._id) !== i) {
            dupeIndices.add(i);
          }
        }
        if (dupeIndices.size) {
          state.edits[d] = edits.filter((_, i) => !dupeIndices.has(i));
        }
      }
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
    blockDone: state.blockDone,
    dayNotes: state.dayNotes,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tara_schedule_data.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

// Compute current week (w1 or w2) based on cycle start date
export function getCurrentWeek() {
  if (!state.cycleStart) return null; // no cycle configured
  const start = new Date(state.cycleStart + 'T00:00:00');
  const now = new Date();
  // Get Monday of current week
  const dow = now.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const thisMonday = new Date(now);
  thisMonday.setHours(0, 0, 0, 0);
  thisMonday.setDate(now.getDate() + mondayOffset);
  const diffMs = thisMonday - start;
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks % 2 === 0 ? 'w1' : 'w2';
}

export function clearAllData(renderAll) {
  if (!confirm('Clear ALL saved data and start fresh? This cannot be undone.')) return;
  ['t4_edits', 't4_smartDone', 't4_asmrDone', 't4_dayTasks', 't4_resetDone', 't4_userTasks', 't4_blockDone', 't4_dayNotes']
    .forEach(k => localStorage.removeItem(k));
  ALL_DAYS.forEach(d => { state.edits[d] = []; state.dayTasks[d] = []; });
  state.smartDone = {};
  state.asmrDone = {};
  state.resetDone = {};
  state.userTasks = [];
  state.blockDone = {};
  state.dayNotes = {};
  renderAll();
}
