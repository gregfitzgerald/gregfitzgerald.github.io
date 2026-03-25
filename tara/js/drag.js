// ─── DRAG TO REORDER BLOCKS ───────────────────────────────────────────────────
import { state, save } from './state.js';
import { getBlocks, sameBlock } from './blocks.js';
import { toMin, toTime, dur, fmtTime } from './time.js';

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
  let hintBlock = null;

  function clearTimers() {
    clearTimeout(pressTimer);
    clearTimeout(hintTimer);
    pressTimer = null;
    hintTimer = null;
    if (hintBlock) {
      hintBlock.classList.remove('touch-holding');
      hintBlock = null;
    }
  }

  // ── Touch events ──────────────────────────────────────────────────────────
  timeline.addEventListener('touchstart', (e) => {
    cleanupOrphans(); // Clear any stuck ghost from a previous drag
    const block = e.target.closest('.tblock[data-block-idx]');
    if (!block) return;

    const idx = parseInt(block.dataset.blockIdx);
    const touch = e.touches[0];

    // Visual hint at 150ms
    hintTimer = setTimeout(() => {
      block.classList.add('touch-holding');
      hintBlock = block;
    }, HINT_MS);

    // Drag activation at 400ms
    pressTimer = setTimeout(() => {
      if (hintBlock) hintBlock.classList.remove('touch-holding');
      hintBlock = null;
      startDrag(block, idx, touch.clientY, renderDetail, renderGrid, renderStats);
    }, LONG_PRESS_MS);
  }, { passive: false });

  timeline.addEventListener('touchmove', (e) => {
    if (!dragState && pressTimer) {
      const dy = Math.abs(e.touches[0].clientY - (hintBlock ? hintBlock.getBoundingClientRect().top : e.touches[0].clientY));
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

  // touchcancel fires when the browser takes over (context menu, scroll, etc.)
  // Without this, the ghost stays stuck on screen
  timeline.addEventListener('touchcancel', () => {
    clearTimers();
    if (dragState) endDrag(renderDetail, renderGrid, renderStats);
  });

  // Suppress context menu during drag (Android long-press triggers it ~500ms)
  timeline.addEventListener('contextmenu', (e) => {
    if (dragState || pressTimer) e.preventDefault();
  });

  // ── Mouse events ──────────────────────────────────────────────────────────
  timeline.addEventListener('mousedown', (e) => {
    const block = e.target.closest('.tblock[data-block-idx]');
    if (!block) return;

    const idx = parseInt(block.dataset.blockIdx);

    hintTimer = setTimeout(() => {
      block.classList.add('touch-holding');
      hintBlock = block;
    }, HINT_MS);

    pressTimer = setTimeout(() => {
      if (hintBlock) hintBlock.classList.remove('touch-holding');
      hintBlock = null;
      startDrag(block, idx, e.clientY, renderDetail, renderGrid, renderStats);
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
function startDrag(blockEl, idx, startY, renderDetail, renderGrid, renderStats) {
  const blocks = getBlocks(state.selectedDay);
  const block = blocks[idx];
  if (!block || block.c === 'sleep') return;

  const timeline = document.getElementById('timeline');
  const tblockEls = Array.from(timeline.querySelectorAll('.timeline-blocks .tblock[data-block-idx]'));

  // Compute offset so ghost doesn't jump on pickup
  const blockRect = blockEl.getBoundingClientRect();
  const offsetY = startY - blockRect.top;

  // Create ghost element
  const ghost = blockEl.cloneNode(true);
  ghost.classList.add('drag-ghost');
  ghost.style.width = blockEl.offsetWidth + 'px';
  ghost.style.top = (startY - offsetY) + 'px';
  ghost.style.position = 'fixed';
  ghost.style.height = blockRect.height + 'px';

  // Add time preview label
  const timeLabel = document.createElement('div');
  timeLabel.className = 'drag-time-label';
  timeLabel.textContent = fmtTime(block.s) + ' - ' + fmtTime(block.e);
  ghost.appendChild(timeLabel);

  document.body.appendChild(ghost);

  // Mark original with faded placeholder
  blockEl.classList.add('drag-origin');

  // Enable gap transitions on all blocks
  document.body.classList.add('dragging');

  // Prevent scroll, selection, and callout during drag
  timeline.style.touchAction = 'none';
  timeline.style.userSelect = 'none';
  timeline.style.webkitUserSelect = 'none';
  document.body.style.webkitTouchCallout = 'none';

  // Snapshot block positions for hit testing
  const rowRects = tblockEls.map(r => {
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
    rows: tblockEls,
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

// ─── CLEANUP ORPHANS ─────────────────────────────────────────────────────────
// Safety net: if any ghost or drag-origin elements exist without an active drag,
// clean them up. Runs on every touchstart to catch stuck ghosts.
function cleanupOrphans() {
  if (dragState) return; // drag is active, don't interfere
  document.querySelectorAll('.drag-ghost').forEach(el => el.remove());
  document.querySelectorAll('.drag-origin').forEach(el => el.classList.remove('drag-origin'));
  document.body.classList.remove('dragging');
}

// ─── END DRAG ────────────────────────────────────────────────────────────────
function endDrag(renderDetail, renderGrid, renderStats) {
  if (!dragState) return;

  const { idx, block, blocks, ghost, rows, insertionIdx } = dragState;
  const day = state.selectedDay;

  // Restore timeline scrolling and selection
  const timeline = document.getElementById('timeline');
  if (timeline) {
    timeline.style.touchAction = '';
    timeline.style.userSelect = '';
    timeline.style.webkitUserSelect = '';
  }
  document.body.style.webkitTouchCallout = '';

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

    // Build the new sequence: remove dragged block, insert at new position
    const withoutDrag = blocks.filter((_, i) => i !== idx);
    const effectiveIdx = insertionIdx > idx ? insertionIdx - 1 : insertionIdx;
    const newSequence = [...withoutDrag];
    newSequence.splice(effectiveIdx, 0, block);

    // Recalculate ALL times sequentially: each block starts where the previous ended
    let cursor = toMin(newSequence[0].s);
    for (let i = 0; i < newSequence.length; i++) {
      const b = newSequence[i];
      const duration = dur(b);
      const newS = toTime(cursor);
      const newE = toTime(cursor + duration);

      // Skip if times haven't changed
      if (b.s === newS && b.e === newE) {
        cursor += duration;
        continue;
      }

      const updated = { s: newS, e: newE, c: b.c, l: b.l, n: b.n, _id: b._id };

      if (b._added) {
        const ae = state.edits[day].find(e => e.action === 'add' && sameBlock(e.block, b));
        if (ae) ae.block = updated;
      } else {
        const re = b._id
          ? state.edits[day].find(e => e.action === 'replace' && e.orig._id === b._id)
          : state.edits[day].find(e => e.action === 'replace' && sameBlock(e.block, b));
        if (re) {
          re.block = updated;
        } else {
          state.edits[day].push({ action: 'replace', orig: { s: b.s, e: b.e, l: b.l, _id: b._id }, block: updated });
        }
      }

      cursor += duration;
    }

    save();
    renderDetail(day);
    renderGrid();
    renderStats();
  }, 220);
}
