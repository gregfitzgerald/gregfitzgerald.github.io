// ─── FIREBASE SYNC ────────────────────────────────────────────────────────────
import { ALL_DAYS } from './data.js';
import { state, save } from './state.js';

const DB_URL = 'https://tara-schedule-default-rtdb.firebaseio.com';
const SYNC_KEY = 't4_syncHash';
const DEBOUNCE_MS = 1500;

let _debounceTimer = null;
let _renderAll = null;

export function initSync(renderAll) {
  _renderAll = renderAll;
  // Restore saved passphrase hash
  const saved = localStorage.getItem(SYNC_KEY);
  if (saved) {
    state.syncHash = saved;
    state.syncStatus = 'connected';
    // Pull remote data on load
    pullFromFirebase();
  }
}

// ─── PASSPHRASE HASHING ──────────────────────────────────────────────────────
async function hashPassphrase(passphrase) {
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── CONNECT / DISCONNECT ────────────────────────────────────────────────────
export async function connectSync(passphrase) {
  if (!passphrase || !passphrase.trim()) return;
  const hash = await hashPassphrase(passphrase);
  state.syncHash = hash;
  state.syncStatus = 'syncing';
  localStorage.setItem(SYNC_KEY, hash);
  updateSyncUI();

  // Pull first, then push local if remote is empty
  await pullFromFirebase();
  await pushToFirebase();
  state.syncStatus = 'connected';
  updateSyncUI();
}

export function disconnectSync() {
  state.syncHash = null;
  state.syncStatus = 'disconnected';
  localStorage.removeItem(SYNC_KEY);
  updateSyncUI();
}

// ─── PUSH (local -> Firebase) ────────────────────────────────────────────────
async function pushToFirebase() {
  if (!state.syncHash) return;
  const payload = {
    edits: state.edits,
    smartDone: state.smartDone,
    asmrDone: state.asmrDone,
    dayTasks: state.dayTasks,
    resetDone: state.resetDone,
    userTasks: state.userTasks,
    lastModified: Date.now(),
  };
  try {
    await fetch(`${DB_URL}/users/${state.syncHash}.json`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  } catch (e) {
    state.syncStatus = 'error';
    updateSyncUI();
  }
}

// ─── PULL (Firebase -> local) ────────────────────────────────────────────────
async function pullFromFirebase() {
  if (!state.syncHash) return;
  try {
    const res = await fetch(`${DB_URL}/users/${state.syncHash}.json`);
    const data = await res.json();
    if (!data) return; // no remote data yet

    // Last-write-wins: if remote is newer, apply it
    const localTime = parseInt(localStorage.getItem('t4_lastModified') || '0');
    if (data.lastModified && data.lastModified > localTime) {
      if (data.edits) state.edits = data.edits;
      if (data.smartDone) state.smartDone = data.smartDone;
      if (data.asmrDone) state.asmrDone = data.asmrDone;
      if (data.dayTasks) state.dayTasks = data.dayTasks;
      if (data.resetDone) state.resetDone = data.resetDone;
      if (data.userTasks) state.userTasks = data.userTasks;
      // Ensure all days exist
      ALL_DAYS.forEach(d => {
        if (!state.edits[d]) state.edits[d] = [];
        if (!state.dayTasks[d]) state.dayTasks[d] = [];
      });
      save();
      if (_renderAll) _renderAll();
    }
  } catch (e) {
    state.syncStatus = 'error';
    updateSyncUI();
  }
}

// ─── DEBOUNCED SYNC (called after every save) ────────────────────────────────
export function debouncedSync() {
  if (!state.syncHash) return;
  localStorage.setItem('t4_lastModified', String(Date.now()));
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    state.syncStatus = 'syncing';
    updateSyncUI();
    pushToFirebase().then(() => {
      state.syncStatus = 'connected';
      updateSyncUI();
    });
  }, DEBOUNCE_MS);
}

// ─── MANUAL SYNC ─────────────────────────────────────────────────────────────
export async function syncNow() {
  if (!state.syncHash) return;
  state.syncStatus = 'syncing';
  updateSyncUI();
  await pullFromFirebase();
  await pushToFirebase();
  state.syncStatus = 'connected';
  updateSyncUI();
}

// ─── UI UPDATE ───────────────────────────────────────────────────────────────
function updateSyncUI() {
  const indicators = document.querySelectorAll('.sync-status');
  indicators.forEach(el => {
    const status = state.syncStatus || 'disconnected';
    el.className = `sync-status sync-${status}`;
    const labels = {
      disconnected: 'Not connected',
      connected: 'Synced',
      syncing: 'Syncing...',
      error: 'Sync error',
    };
    el.textContent = labels[status] || status;
  });
}
