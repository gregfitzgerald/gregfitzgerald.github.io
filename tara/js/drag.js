// ─── DRAG TO REORDER BLOCKS ───────────────────────────────────────────────────
import { state, save } from './state.js';
import { getBlocks, sameBlock } from './blocks.js';
import { toMin, toTime, dur, fmtTime } from './time.js';

let dragState = null;
const LONG_PRESS_MS = 500;   // longer than Android context menu threshold
const HINT_MS = 200;
const MOVE_THRESHOLD = 15;   // px of finger movement before cancelling long-press
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
  let startTouch = null;  // track initial touch position for threshold

  function clearTimers() {
    clearTimeout(pressTimer);
    clearTimeout(hintTimer);
    pressTimer = null;
    hintTimer = null;
    startTouch = null;
    if (hintBlock) {
      hintBlock.classList.remove('touch-holding');
      hintBlock = null;
    }
  }

  // ── Touch events ──────────────────────────────────────────────────────────
  // Only use passive: false on touchmove (to preventDefault during active drag)
  // touchstart is passive to avoid scroll-blocking warnings
  timeline.addEventListener('touchstart', (e) => {
    cleanupOrphans();
    // Only trigger from drag handle
    const handle = e.target.closest('.drag-handle');
    if (!handle) return;
    const block = handle.closest('.tblock[data-block-idx]');
    if (!block) return;

    const idx = parseInt(block.dataset.blockIdx);
    const touch = e.touches[0];
    startTouch = { x: touch.clientX, y: touch.clientY };

    // Visual hint
    hintTimer = setTimeout(() => {
      block.classList.add('touch-holding');
      hintBlock = block;
    }, HINT_MS);

    // Drag activation
    pressTimer = setTimeout(() => {
      if (hintBlock) hintBlock.classList.remove('touch-holding');
      hintBlock = null;
      startDrag(block, idx, touch.clientY, renderDetail, renderGrid, renderStats);
      // Prevent scroll once drag starts
      e.preventDefault && e.preventDefault();
    }, LONG_PRESS_MS);
  }, { passive: false }); // passive:false needed so we can preventDefault on drag start

  timeline.addEventListener('touchmove', (e) => {
    // Cancel long-press if finger moved too far before activation
    if (!dragState && pressTimer && startTouch) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - startTouch.x);
      const dy = Math.abs(touch.clientY - startTouch.y);
      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
        clearTimers();
      }
    }
    if (dragState) {
      e.preventDefault(); // prevent scroll during active drag
      moveDrag(e.touches[0].clientY);
    }
  }, { passive: false });

  timeline.addEventListener('touchend', () => {
    clearTimers();
    if (dragState) endDrag(renderDetail, renderGrid, renderStats);
  });

  timeline.addEventListener('touchcancel', () => {
    clearTimers();
    if (dragState) endDrag(renderDetail, renderGrid, renderStats);
  });

  // Suppress context menu during drag/long-press
  timeline.addEventListener('contextmenu', (e) => {
    if (dragState || pressTimer) e.preventDefault();
  });

  // ── Mouse events (desktop) ────────────────────────────────────────────────
  timeline.addEventListener('mousedown', (e) => {
    const handle = e.target.closest('.drag-handle');
    if (!handle) return;
    const block = handle.closest('.tblock[data-block-idx]');
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

  const blockRect = blockEl.getBoundingClientRect();
  const offsetY = startY - blockRect.top;

  // Create ghost element
  const ghost = blockEl.cloneNode(true);
  ghost.classList.add('drag-ghost');
  ghost.style.width = blockEl.offsetWidth + 'px';
  ghost.style.top = (startY - offsetY) + 'px';
  ghost.style.position = 'fixed';
  ghost.style.height = blockRect.height + 'px';

  const timeLabel = document.createElement('div');
  timeLabel.className = 'drag-time-label';
  timeLabel.textContent = fmtTime(block.s) + ' – ' + fmtTime(block.e);
  ghost.appendChild(timeLabel);

  document.body.appendChild(ghost);

  blockEl.classList.add('drag-origin');
  document.body.classList.add('dragging');

  // Lock scroll & selection
  timeline.style.touchAction = 'none';
  timeline.style.userSelect = 'none';
  timeline.style.webkitUserSelect = 'none';
  document.body.style.webkitTouchCallout = 'none';
  document.body.style.overflow = 'hidden'; // prevent body scroll

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

  haptic(15);
}

// ─── MOVE DRAG ───────────────────────────────────────────────────────────────
function moveDrag(clientY) {
  if (!dragState) return;
  dragState.currentY = clientY;

  if (dragState.rafId) cancelAnimationFrame(dragState.rafId);
  dragState.rafId = requestAnimationFrame(() => {
    if (!dragState) return;
    dragState.ghost.style.top = (clientY - dragState.offsetY) + 'px';
  });

  const { idx, block, blocks, rows, rowRects } = dragState;
  const ghostCenter = clientY;

  let insertionIdx = rows.length;
  for (let i = 0; i < rowRects.length; i++) {
    if (ghostCenter < rowRects[i].mid) {
      insertionIdx = i;
      break;
    }
  }
  if (insertionIdx > blocks.length) insertionIdx = blocks.length;

  dragState.insertionIdx = insertionIdx;

  // Animate gap
  rows.forEach((row, i) => {
    if (i === idx) return;
    let shift = 0;
    if (insertionIdx <= idx) {
      if (i >= insertionIdx && i < idx) shift = GAP_PX;
    } else {
      if (i > idx && i < insertionIdx) shift = -GAP_PX;
    }
    row.style.transform = shift ? `translateY(${shift}px)` : '';
  });

  // Update time preview
  const blockDuration = dur(block);
  const newStartMin = computeNewStartMin(insertionIdx, idx, blocks, block);
  const newEndMin = newStartMin + blockDuration;
  dragState.projectedStart = newStartMin;
  dragState.projectedEnd = newEndMin;
  dragState.timeLabel.textContent = fmtTime(toTime(newStartMin)) + ' – ' + fmtTime(toTime(newEndMin));

  if (insertionIdx !== dragState.lastInsertionIdx) {
    dragState.lastInsertionIdx = insertionIdx;
    haptic(10);
  }
}

// ─── COMPUTE NEW START TIME ──────────────────────────────────────────────────
function computeNewStartMin(insertionIdx, dragIdx, blocks, dragBlock) {
  if (insertionIdx === 0) return toMin(blocks[0].s);
  const withoutDrag = blocks.filter((_, i) => i !== dragIdx);
  const effectiveIdx = insertionIdx > dragIdx ? insertionIdx - 1 : insertionIdx;
  if (effectiveIdx === 0) return toMin(withoutDrag[0].s);
  if (effectiveIdx <= withoutDrag.length && effectiveIdx > 0) {
    return toMin(withoutDrag[effectiveIdx - 1].e);
  }
  return toMin(withoutDrag[withoutDrag.length - 1].e);
}

// ─── CLEANUP ORPHANS ─────────────────────────────────────────────────────────
function cleanupOrphans() {
  if (dragState) return;
  document.querySelectorAll('.drag-ghost').forEach(el => el.remove());
  document.querySelectorAll('.drag-origin').forEach(el => el.classList.remove('drag-origin'));
  document.body.classList.remove('dragging');
}

// ─── END DRAG ────────────────────────────────────────────────────────────────
function endDrag(renderDetail, renderGrid, renderStats) {
  if (!dragState) return;

  const { idx, block, blocks, ghost, rows, insertionIdx } = dragState;
  const day = state.selectedDay;

  // Restore scrolling and selection
  const timeline = document.getElementById('timeline');
  if (timeline) {
    timeline.style.touchAction = '';
    timeline.style.userSelect = '';
    timeline.style.webkitUserSelect = '';
  }
  document.body.style.webkitTouchCallout = '';
  document.body.style.overflow = '';

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

  if (dragState && dragState.timeLabel) dragState.timeLabel.style.opacity = '0';

  const localDragState = dragState;
  dragState = null;

  setTimeout(() => {
    ghost.remove();
    document.querySelectorAll('.drag-origin').forEach(el => el.classList.remove('drag-origin'));

    const withoutDrag = blocks.filter((_, i) => i !== idx);
    const effectiveIdx = insertionIdx > idx ? insertionIdx - 1 : insertionIdx;
    const newSequence = [...withoutDrag];
    newSequence.splice(effectiveIdx, 0, block);

    // Recalculate all times sequentially
    let cursor = toMin(newSequence[0].s);
    for (let i = 0; i < newSequence.length; i++) {
      const b = newSequence[i];
      const duration = dur(b);
      const newS = toTime(cursor);
      const newE = toTime(cursor + duration);

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
