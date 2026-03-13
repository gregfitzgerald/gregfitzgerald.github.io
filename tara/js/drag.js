// ─── DRAG TO REORDER BLOCKS ───────────────────────────────────────────────────
import { state, save } from './state.js';
import { getBlocks, sameBlock } from './blocks.js';
import { toMin, toTime, dur } from './time.js';
import { openCascade } from './cascade.js';

let dragState = null;
const LONG_PRESS_MS = 400;

export function initDrag(renderDetail, renderGrid, renderStats) {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  let pressTimer = null;

  timeline.addEventListener('touchstart', (e) => {
    const row = e.target.closest('.trow');
    if (!row) return;
    const block = row.querySelector('[data-block-idx]');
    if (!block) return;

    const idx = parseInt(block.dataset.blockIdx);
    const touch = e.touches[0];

    pressTimer = setTimeout(() => {
      e.preventDefault();
      startDrag(row, idx, touch.clientY, renderDetail, renderGrid, renderStats);
    }, LONG_PRESS_MS);
  }, { passive: false });

  timeline.addEventListener('touchmove', (e) => {
    if (pressTimer) {
      // Cancel long press if finger moves too much before threshold
      const dy = Math.abs(e.touches[0].clientY - (dragState ? dragState.startY : e.touches[0].clientY));
      if (!dragState && dy > 10) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    }
    if (dragState) {
      e.preventDefault();
      moveDrag(e.touches[0].clientY);
    }
  }, { passive: false });

  timeline.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
    pressTimer = null;
    if (dragState) endDrag(renderDetail, renderGrid, renderStats);
  });

  // Mouse support for desktop
  timeline.addEventListener('mousedown', (e) => {
    const row = e.target.closest('.trow');
    if (!row) return;
    const block = row.querySelector('[data-block-idx]');
    if (!block) return;

    const idx = parseInt(block.dataset.blockIdx);
    pressTimer = setTimeout(() => {
      startDrag(row, idx, e.clientY, renderDetail, renderGrid, renderStats);
    }, LONG_PRESS_MS);
  });

  document.addEventListener('mousemove', (e) => {
    if (dragState) {
      e.preventDefault();
      moveDrag(e.clientY);
    }
  });

  document.addEventListener('mouseup', () => {
    clearTimeout(pressTimer);
    pressTimer = null;
    if (dragState) endDrag(renderDetail, renderGrid, renderStats);
  });
}

function startDrag(row, idx, startY, renderDetail, renderGrid, renderStats) {
  const blocks = getBlocks(state.selectedDay);
  const block = blocks[idx];
  if (!block || block.c === 'sleep') return;

  // Get all rows for position reference
  const timeline = document.getElementById('timeline');
  const rows = Array.from(timeline.querySelectorAll('.trow'));

  // Create ghost element
  const ghost = row.cloneNode(true);
  ghost.classList.add('drag-ghost');
  ghost.style.width = row.offsetWidth + 'px';
  ghost.style.top = row.getBoundingClientRect().top + 'px';
  document.body.appendChild(ghost);

  // Mark original
  row.classList.add('drag-origin');

  // Add drop indicators
  rows.forEach((r, i) => {
    if (i !== idx) {
      const indicator = document.createElement('div');
      indicator.className = 'drop-indicator';
      indicator.dataset.dropIdx = i;
      r.parentNode.insertBefore(indicator, r);
    }
  });
  // Add one after the last row
  const lastIndicator = document.createElement('div');
  lastIndicator.className = 'drop-indicator';
  lastIndicator.dataset.dropIdx = rows.length;
  timeline.appendChild(lastIndicator);

  dragState = {
    idx,
    block,
    blocks,
    ghost,
    startY,
    currentY: startY,
    rows,
    renderDetail,
    renderGrid,
    renderStats,
  };

  // Vibrate on supported devices
  if (navigator.vibrate) navigator.vibrate(30);
}

function moveDrag(clientY) {
  if (!dragState) return;
  dragState.currentY = clientY;
  dragState.ghost.style.top = clientY - 24 + 'px';

  // Highlight nearest drop indicator
  const indicators = document.querySelectorAll('.drop-indicator');
  let closest = null;
  let closestDist = Infinity;

  indicators.forEach(ind => {
    const rect = ind.getBoundingClientRect();
    const dist = Math.abs(rect.top - clientY);
    if (dist < closestDist) {
      closestDist = dist;
      closest = ind;
    }
  });

  indicators.forEach(ind => ind.classList.remove('active'));
  if (closest) closest.classList.add('active');
  dragState.dropTarget = closest;
}

function endDrag(renderDetail, renderGrid, renderStats) {
  if (!dragState) return;

  const { idx, block, blocks, ghost, dropTarget } = dragState;

  // Clean up DOM
  ghost.remove();
  document.querySelectorAll('.drag-origin').forEach(el => el.classList.remove('drag-origin'));
  document.querySelectorAll('.drop-indicator').forEach(el => el.remove());

  if (!dropTarget) {
    dragState = null;
    return;
  }

  const dropIdx = parseInt(dropTarget.dataset.dropIdx);
  if (dropIdx === idx || dropIdx === idx + 1) {
    // Dropped in same position, no change
    dragState = null;
    return;
  }

  // Calculate new time based on drop position
  const day = state.selectedDay;
  const blockDuration = dur(block);

  // Determine the target position in the block list
  const targetIdx = dropIdx > idx ? dropIdx - 1 : dropIdx;

  // New start time is the end time of the block before the drop position,
  // or the start of the first block if dropping at position 0
  let newStartMin;
  if (dropIdx === 0) {
    newStartMin = toMin(blocks[0].s);
  } else {
    const prevBlock = dropIdx > idx ? blocks[dropIdx - 1] : blocks[dropIdx - 1];
    if (prevBlock && !sameBlock(prevBlock, block)) {
      newStartMin = toMin(prevBlock.e);
    } else if (dropIdx >= 2) {
      newStartMin = toMin(blocks[dropIdx - 2].e);
    } else {
      newStartMin = toMin(blocks[0].s);
    }
  }

  const newEndMin = newStartMin + blockDuration;
  const oldEndMin = toMin(block.e);

  const moved = {
    s: toTime(newStartMin),
    e: toTime(newEndMin),
    c: block.c,
    l: block.l,
    n: block.n,
    _id: block._id,
  };

  // Apply as edit
  if (block._added) {
    const ae = state.edits[day].find(e => e.action === 'add' && sameBlock(e.block, block));
    if (ae) ae.block = moved;
  } else if (block._edited) {
    const re = state.edits[day].find(e => e.action === 'replace' && sameBlock(e.block, block));
    if (re) re.block = moved;
    else state.edits[day].push({ action: 'replace', orig: { s: block.s, e: block.e, l: block.l, _id: block._id }, block: moved });
  } else {
    state.edits[day].push({ action: 'replace', orig: { s: block.s, e: block.e, l: block.l, _id: block._id }, block: moved });
  }

  save();
  renderDetail(day);
  renderGrid();
  renderStats();

  // Offer cascade for blocks after the new position
  const deltaMin = newEndMin - newStartMin;
  if (deltaMin > 0) {
    setTimeout(() => openCascade(day, newEndMin, 0, renderDetail, renderGrid, renderStats), 50);
  }

  dragState = null;
}
