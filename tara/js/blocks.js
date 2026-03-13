// ─── BLOCK RESOLUTION ─────────────────────────────────────────────────────────
import { BASE } from './data.js';
import { state } from './state.js';
import { toMin } from './time.js';

let _dynamicId = 0;

// Returns the final list of blocks for a day, applying edits on top of base
export function getBlocks(day, weekOverride) {
  const week = weekOverride || state.view;
  const base = (BASE[week][day] || []).map(b => ({ ...b, _base: true }));
  const dayEdits = state.edits[day] || [];

  let result = [...base];

  for (const edit of dayEdits) {
    if (edit.action === 'delete') {
      result = result.filter(b => !sameBlock(b, edit.orig));
    } else if (edit.action === 'replace') {
      const idx = result.findIndex(b => sameBlock(b, edit.orig));
      if (idx > -1) result[idx] = { ...edit.block, _edited: true, _id: edit.block._id || result[idx]._id };
      else result.push({ ...edit.block, _edited: true, _id: edit.block._id || `dyn_${_dynamicId++}` });
    } else if (edit.action === 'add') {
      result.push({ ...edit.block, _added: true, _id: edit.block._id || `dyn_${_dynamicId++}` });
    }
  }

  // Deduplicate: if multiple blocks share the same _id, keep only the last one
  // (later edits win). This prevents stale/duplicate replace edits from creating ghosts.
  const seen = new Map();
  for (let i = result.length - 1; i >= 0; i--) {
    const id = result[i]._id;
    if (id && seen.has(id)) {
      result.splice(i, 1);
    } else if (id) {
      seen.set(id, true);
    }
  }

  return result.sort((a, b) => toMin(a.s) - toMin(b.s));
}

// Bug fix #3: Check _id first for stable identity, fall back to s/e/l triple
export function sameBlock(a, b) {
  if (a._id && b._id) return a._id === b._id;
  return a.s === b.s && a.e === b.e && a.l === b.l;
}
