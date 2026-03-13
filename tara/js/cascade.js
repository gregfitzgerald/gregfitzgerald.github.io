// ─── CASCADE ──────────────────────────────────────────────────────────────────
import { state, save } from './state.js';
import { getBlocks, sameBlock } from './blocks.js';
import { toMin, toTime, fmtTime } from './time.js';

export function openCascade(day, afterMin, deltaMin, renderDetail, renderGrid, renderStats) {
  // Bug fix #2: afterMin is now the ORIGINAL end time, so adjacent blocks are included
  const candidates = getBlocks(day).filter(b => toMin(b.s) >= afterMin && b.c !== 'sleep');
  if (!candidates.length) return;

  state.cascadeData = {
    day, deltaMin, candidates,
    selected: new Set(candidates.map((_, i) => i)),
    renderDetail, renderGrid, renderStats,
  };

  const sign = deltaMin > 0 ? '+' : '';
  document.getElementById('cascade-delta').textContent = `${sign}${deltaMin} min`;
  renderCascadeList();
  document.getElementById('cascade-modal').classList.add('show');
}

export function renderCascadeList() {
  const { candidates, selected, deltaMin } = state.cascadeData;
  document.getElementById('cascade-list').innerHTML = candidates.map((b, i) => {
    const ns = toTime(toMin(b.s) + deltaMin);
    const ne = toTime(toMin(b.e) + deltaMin);
    return `
    <div class="cascade-item ${selected.has(i) ? 'selected' : ''}" data-cascade-idx="${i}">
      <input type="checkbox" ${selected.has(i) ? 'checked' : ''}>
      <div style="flex:1">
        <div style="font-size:.68rem">${b.l}</div>
        <div style="font-size:.58rem;color:var(--dim)">${fmtTime(b.s)}--${fmtTime(b.e)} -> <span style="color:var(--text)">${fmtTime(ns)}--${fmtTime(ne)}</span></div>
      </div>
      <div class="mini-block ${b.c}" style="width:8px;min-width:8px;height:18px;border-radius:2px;margin:0"></div>
    </div>`;
  }).join('');
}

export function toggleCascade(i) {
  if (state.cascadeData.selected.has(i)) state.cascadeData.selected.delete(i);
  else state.cascadeData.selected.add(i);
  renderCascadeList();
}

export function selectAllCascade() {
  state.cascadeData.selected = new Set(state.cascadeData.candidates.map((_, i) => i));
  renderCascadeList();
}

export function applyCascade() {
  const { day, deltaMin, candidates, selected, renderDetail, renderGrid, renderStats } = state.cascadeData;
  selected.forEach(i => {
    const orig = candidates[i];
    const shifted = {
      s: toTime(toMin(orig.s) + deltaMin),
      e: toTime(toMin(orig.e) + deltaMin),
      c: orig.c, l: orig.l, n: orig.n,
      _id: orig._id,
    };
    if (orig._added) {
      const ae = state.edits[day].find(e => e.action === 'add' && sameBlock(e.block, orig));
      if (ae) ae.block = shifted;
    } else if (orig._edited) {
      const re = state.edits[day].find(e => e.action === 'replace' && sameBlock(e.block, orig));
      if (re) re.block = shifted;
      else state.edits[day].push({ action: 'replace', orig: { s: orig.s, e: orig.e, l: orig.l, _id: orig._id }, block: shifted });
    } else {
      state.edits[day].push({ action: 'replace', orig: { s: orig.s, e: orig.e, l: orig.l, _id: orig._id }, block: shifted });
    }
  });
  save();
  closeCascade();
  renderDetail(day);
  renderGrid();
  renderStats();
}

export function closeCascade() {
  document.getElementById('cascade-modal').classList.remove('show');
  state.cascadeData = null;
}
