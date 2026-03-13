// ─── DRAG TO REORDER BLOCKS ───────────────────────────────────────────────────
import { state, save } from './state.js';
import { getBlocks, sameBlock } from './blocks.js';
import { toMin, toTime, dur, fmtTime } from './time.js';
import { openCascade } from './cascade.js';

let dragState = null;
const LONG_PRESS_MS = 400;
const HINT_MS = 150;
const GAP_PX = 48;

function haptic(ms = 10) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

export function initDrag(renderDetail, renderGrid, renderStats) {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  let pressTimer = null;
  let hintTimer = null;
  let hintRow = null;

  function clearTimers() {
    clearTimeout(pressTimer);
    clearTimeout(hintTimer);
    pressTimer = null;
    hintTimer = null;
    if (hintRow) {
      hintRow.classList.remove('touch-holding');
      hintRow = null;
    }
  }

  // ── Touch events ──────────────────────────────────────────────────────────
  timeline.addEventListener('touchstart', (e) => {
    const row = e.target.closest('.trow');
    if (!row) return;
    const block = row.querySelector('[data-block-idx]');
    if (!block) return;

    const idx = parseInt(block.dataset.blockIdx);
    const touch = e.touches[0];

    // Visual hint at 150ms
    hintTimer = setTimeout(() => {
      row.classList.add('touch-holding');
      hintRow = row;
    }, HINT_MS);

    // Drag activation at 400ms
    pressTimer = setTimeout(() => {
      e.preventDefault();
      if (hintRow) hintRow.classList.remove('touch-holding');
      hintRow = null;
      startDrag(row, idx, touch.clientY, renderDetail, renderGrid, renderStats);
    }, LONG_PRESS_MS);
  }, { passive: false });

  timeline.addEventListener('touchmove', (e) => {
    if (!dragState && pressTimer) {
      const dy = Math.abs(e.touches[0].clientY - (hintRow ? hintRow.getBoundingClientRect().top : e.touches[0].clientY));
      if (dy > 10) clearTimers();
    }
    if (dragState) {
      e.preventDefault();
      moveDrag(e.touches[0].clientY);
    }
  }, { passive: false });

  timeline.addEventListener('touchend', () => {
    clearTimers();
    if (dragState) endDrag(renderDetail, renderGrid, renderStats);
  });

  // ── Mouse events ──────────────────────────────────────────────────────────
  timeline.addEventListener('mousedown', (e) => {
    const row = e.target.closest('.trow');
    if (!row) return;
    const block = row.querySelector('[data-block-idx]');
    if (!block) return;

    const idx = parseInt(block.dataset.blockIdx);

    hintTimer = setTimeout(() => {
      row.classList.add('touch-holding');
      hintRow = row;
    }, HINT_MS);

    pressTimer = setTimeout(() => {
      if (hintRow) hintRow.classList.remove('touch-holding');
      hintRow = null;
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
    clearTimers();
    if (dragState) endDrag(renderDetail, renderGrid, renderStats);
  });
}

// ─── START DRAG ──────────────────────────────────────────────────────────────
function startDrag(row, idx, startY, renderDetail, renderGrid, renderStats) {
  const blocks = getBlocks(state.selectedDay);
  const block = blocks[idx];
  if (!block || block.c === 'sleep') return;

  const timeline = document.getElementById('timeline');
  const rows = Array.from(timeline.querySelectorAll('.trow'));

  // Compute offset so ghost doesn't jump on pickup
  const rowRect = row.getBoundingClientRect();
  const offsetY = startY - rowRect.top;

  // Create ghost element
  const ghost = row.cloneNode(true);
  ghost.classList.add('drag-ghost');
  ghost.style.width = row.offsetWidth + 'px';
  ghost.style.top = (startY - offsetY) + 'px';

  // Add time preview label
  const timeLabel = document.createElement('div');
  timeLabel.className = 'drag-time-label';
  timeLabel.textContent = fmtTime(block.s) + ' - ' + fmtTime(block.e);
  ghost.appendChild(timeLabel);

  document.body.appendChild(ghost);

  // Mark original with faded placeholder
  row.classList.add('drag-origin');

  // Enable gap transitions on all rows
  document.body.classList.add('dragging');

  // Prevent scroll during drag
  timeline.style.touchAction = 'none';

  // Snapshot row positions for hit testing
  const rowRects = rows.map(r => {
    const rect = r.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, mid: (rect.top + rect.bottom) / 2 };
  });

  dragState = {
    idx,
    block,
    blocks,
    ghost,
    timeLabel,
    startY,
    offsetY,
    currentY: startY,
    rows,
    rowRects,
    renderDetail,
    renderGrid,
    renderStats,
    insertionIdx: idx,
    lastInsertionIdx: idx,
    rafId: null,
  };

  haptic(10);
}

// ─── MOVE DRAG ───────────────────────────────────────────────────────────────
function moveDrag(clientY) {
  if (!dragState) return;
  dragState.currentY = clientY;

  // Smooth ghost positioning via rAF
  if (dragState.rafId) cancelAnimationFrame(dragState.rafId);
  dragState.rafId = requestAnimationFrame(() => {
    if (!dragState) return;
    dragState.ghost.style.top = (clientY - dragState.offsetY) + 'px';
  });

  const { idx, block, blocks, rows, rowRects } = dragState;
  const ghostCenter = clientY;

  // Find insertion index based on ghost center vs row midpoints
  let insertionIdx = rows.length;
  for (let i = 0; i < rowRects.length; i++) {
    if (ghostCenter < rowRects[i].mid) {
      insertionIdx = i;
      break;
    }
  }

  // Clamp
  if (insertionIdx > blocks.length) insertionIdx = blocks.length;

  dragState.insertionIdx = insertionIdx;

  // Animate gap: shift rows apart to show insertion point
  rows.forEach((row, i) => {
    if (i === idx) return; // placeholder stays put
    let shift = 0;
    if (insertionIdx <= idx) {
      // Dragging upward: rows between insertionIdx and idx-1 shift down
      if (i >= insertionIdx && i < idx) shift = GAP_PX;
    } else {
      // Dragging downward: rows between idx+1 and insertionIdx-1 shift up
      if (i > idx && i < insertionIdx) shift = -GAP_PX;
    }
    row.style.transform = shift ? `translateY(${shift}px)` : '';
  });

  // Update time preview label
  const blockDuration = dur(block);
  const newStartMin = computeNewStartMin(insertionIdx, idx, blocks, block);
  const newEndMin = newStartMin + blockDuration;
  dragState.projectedStart = newStartMin;
  dragState.projectedEnd = newEndMin;
  dragState.timeLabel.textContent = fmtTime(toTime(newStartMin)) + ' - ' + fmtTime(toTime(newEndMin));

  // Haptic on zone change
  if (insertionIdx !== dragState.lastInsertionIdx) {
    dragState.lastInsertionIdx = insertionIdx;
    haptic(10);
  }
}

// ─── COMPUTE NEW START TIME ──────────────────────────────────────────────────
function computeNewStartMin(insertionIdx, dragIdx, blocks, dragBlock) {
  if (insertionIdx === 0) return toMin(blocks[0].s);

  // The block "before" the insertion depends on drag direction
  let prevIdx;
  if (insertionIdx <= dragIdx) {
    prevIdx = insertionIdx - 1;
  } else {
    // When dragging down, the drag block is removed from above,
    // so the effective previous block is at insertionIdx - 1
    // but we skip the drag block itself
    prevIdx = insertionIdx - 1;
    if (prevIdx === dragIdx && insertionIdx >= 2) {
      prevIdx = insertionIdx; // next block after the gap
      // Actually use the block that would be before insertion after removal
    }
  }

  // Simple approach: build the sequence without the dragged block, find prev
  const withoutDrag = blocks.filter((_, i) => i !== dragIdx);
  const effectiveIdx = insertionIdx > dragIdx ? insertionIdx - 1 : insertionIdx;
  if (effectiveIdx === 0) return toMin(withoutDrag[0].s);
  if (effectiveIdx <= withoutDrag.length && effectiveIdx > 0) {
    return toMin(withoutDrag[effectiveIdx - 1].e);
  }
  return toMin(withoutDrag[withoutDrag.length - 1].e);
}

// ─── END DRAG ────────────────────────────────────────────────────────────────
function endDrag(renderDetail, renderGrid, renderStats) {
  if (!dragState) return;

  const { idx, block, blocks, ghost, rows, insertionIdx } = dragState;
  const day = state.selectedDay;

  // Restore timeline scrolling
  const timeline = document.getElementById('timeline');
  if (timeline) timeline.style.touchAction = '';

  // Clear gap transforms
  rows.forEach(row => { row.style.transform = ''; });
  document.body.classList.remove('dragging');

  // Same position? Cancel.
  if (insertionIdx === idx || insertionIdx === idx + 1) {
    ghost.remove();
    document.querySelectorAll('.drag-origin').forEach(el => el.classList.remove('drag-origin'));
    dragState = null;
    return;
  }

  haptic(10);

  // Animate ghost to final position
  const targetVisualIdx = insertionIdx > idx ? insertionIdx - 1 : insertionIdx;
  const targetRow = rows[Math.min(targetVisualIdx, rows.length - 1)];
  if (targetRow) {
    const targetTop = targetRow.getBoundingClientRect().top;
    ghost.style.transition = 'top 200ms cubic-bezier(0.34, 1.56, 0.64, 1), transform 200ms ease-out, opacity 200ms ease-out';
    ghost.style.top = targetTop + 'px';
    ghost.style.transform = 'scale(1)';
    ghost.style.opacity = '1';
  }

  // Fade time label during settle
  if (dragState.timeLabel) dragState.timeLabel.style.opacity = '0';

  const localDragState = dragState;
  dragState = null;

  setTimeout(() => {
    ghost.remove();
    document.querySelectorAll('.drag-origin').forEach(el => el.classList.remove('drag-origin'));

    // Compute new times
    const blockDuration = dur(block);
    const newStartMin = computeNewStartMin(insertionIdx, idx, blocks, block);
    const newEndMin = newStartMin + blockDuration;

    const moved = {
      s: toTime(newStartMin),
      e: toTime(newEndMin),
      c: block.c,
      l: block.l,
      n: block.n,
      _id: block._id,
    };

    // Apply as edit -- find existing edit by _id to prevent duplicates
    if (block._added) {
      const ae = state.edits[day].find(e => e.action === 'add' && sameBlock(e.block, block));
      if (ae) ae.block = moved;
    } else {
      const re = block._id
        ? state.edits[day].find(e => e.action === 'replace' && e.orig._id === block._id)
        : state.edits[day].find(e => e.action === 'replace' && sameBlock(e.block, block));
      if (re) {
        re.block = moved;
      } else {
        state.edits[day].push({ action: 'replace', orig: { s: block.s, e: block.e, l: block.l, _id: block._id }, block: moved });
      }
    }

    save();
    renderDetail(day);
    renderGrid();
    renderStats();

    // Offer cascade if the moved block overlaps with following blocks
    const updatedBlocks = getBlocks(day);
    const movedIdx = updatedBlocks.findIndex(b => b._id && b._id === moved._id);
    if (movedIdx > -1 && movedIdx < updatedBlocks.length - 1) {
      const nextBlock = updatedBlocks[movedIdx + 1];
      if (nextBlock.c !== 'sleep') {
        const nextStartMin = toMin(nextBlock.s);
        const overlap = newEndMin - nextStartMin;
        if (overlap > 0) {
          setTimeout(() => openCascade(day, nextStartMin, overlap, renderDetail, renderGrid, renderStats), 50);
        }
      }
    }
  }, 220);
}
