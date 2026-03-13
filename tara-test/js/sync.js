// ─── FIREBASE SYNC ────────────────────────────────────────────────────────────
// Single-user auto-sync: all changes push to one Firebase path instantly.
import { ALL_DAYS } from './data.js';
import { state, save } from './state.js';

const DB_URL = 'https://tara-schedule-default-rtdb.firebaseio.com';
const DB_PATH = '/test-schedule';
const DEBOUNCE_MS = 1500;

let _debounceTimer = null;
let _renderAll = null;

export function initSync(renderAll) {
  _renderAll = renderAll;
  state.syncStatus = 'connected';
  // Pull remote data on load
  pullFromFirebase();
}

// ─── PUSH (local -> Firebase) ────────────────────────────────────────────────
async function pushToFirebase() {
  const payload = {
    edits: state.edits,
    smartDone: state.smartDone,
    asmrDone: state.asmrDone,
    dayTasks: state.dayTasks,
    resetDone: state.resetDone,
    userTasks: state.userTasks,
    cycleStart: state.cycleStart || null,
    lastModified: Date.now(),
  };
  try {
    await fetch(`${DB_URL}${DB_PATH}.json`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    state.syncStatus = 'connected';
  } catch (e) {
    state.syncStatus = 'error';
  }
  updateSyncUI();
}

// ─── PULL (Firebase -> local) ────────────────────────────────────────────────
async function pullFromFirebase() {
  try {
    const res = await fetch(`${DB_URL}${DB_PATH}.json`);
    const data = await res.json();
    if (!data) return; // no remote data yet

    // Last-write-wins: if remote is newer, apply it
    const localTime = parseInt(localStorage.getItem('t4test_lastModified') || '0');
    if (data.lastModified && data.lastModified > localTime) {
      if (data.edits) state.edits = data.edits;
      if (data.smartDone) state.smartDone = data.smartDone;
      if (data.asmrDone) state.asmrDone = data.asmrDone;
      if (data.dayTasks) state.dayTasks = data.dayTasks;
      if (data.resetDone) state.resetDone = data.resetDone;
      if (data.userTasks) state.userTasks = data.userTasks;
      if (data.cycleStart) state.cycleStart = data.cycleStart;
      // Ensure all days exist
      ALL_DAYS.forEach(d => {
        if (!state.edits[d]) state.edits[d] = [];
        if (!state.dayTasks[d]) state.dayTasks[d] = [];
      });
      save();
      if (_renderAll) _renderAll();
    }
    state.syncStatus = 'connected';
  } catch (e) {
    state.syncStatus = 'error';
  }
  updateSyncUI();
}

// ─── DEBOUNCED SYNC (called after every save) ────────────────────────────────
export function debouncedSync() {
  localStorage.setItem('t4_lastModified', String(Date.now()));
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    state.syncStatus = 'syncing';
    updateSyncUI();
    pushToFirebase();
  }, DEBOUNCE_MS);
}

// ─── MANUAL SYNC ─────────────────────────────────────────────────────────────
export async function syncNow() {
  state.syncStatus = 'syncing';
  updateSyncUI();
  await pullFromFirebase();
  await pushToFirebase();
}

// ─── UI UPDATE ───────────────────────────────────────────────────────────────
function updateSyncUI() {
  const indicators = document.querySelectorAll('.sync-status');
  indicators.forEach(el => {
    const status = state.syncStatus || 'disconnected';
    el.className = `sync-status sync-${status}`;
    const labels = {
      connected: 'Synced',
      syncing: 'Syncing...',
      error: 'Sync error',
    };
    el.textContent = labels[status] || status;
  });
}
