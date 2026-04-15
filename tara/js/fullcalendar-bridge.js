// ─── FULLCALENDAR BRIDGE ──────────────────────────────────────────────────────
// Owns the FullCalendar instance. Converts block arrays to FC events.
import { state, getCurrentWeek } from './state.js';
import { getBlocks } from './blocks.js';
import { toMin, fmtTime, fmtDur, dur } from './time.js';

let calendar = null;

const DAY_OFFSETS = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };

export function getDateForDayObj(dayName, weekOverride) {
  const today = new Date();
  const dow = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dow);
  sunday.setHours(0, 0, 0, 0);

  const currentWeek = getCurrentWeek();
  const targetView = weekOverride || state.view;
  let viewDelta = 0;
  if (currentWeek) {
    if (currentWeek !== targetView) viewDelta = 1;
  } else {
    if (targetView === 'w2') viewDelta = 1;
  }

  sunday.setDate(sunday.getDate() + viewDelta * 7);
  const target = new Date(sunday);
  target.setDate(sunday.getDate() + DAY_OFFSETS[dayName]);
  return target;
}

function timeStr(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function blocksToEvents(day) {
  const blocks = getBlocks(day);
  const date = getDateForDayObj(day);
  const dateStr = date.toISOString().split('T')[0];

  return blocks.filter(b => b.c !== 'sleep').map(b => {
    const origIdx = blocks.indexOf(b);
    const doneKey = `${state.view}_${day}_${b._id}`;
    const doneEntry = state.blockDone[doneKey];
    const isDone = doneEntry && doneEntry.done;
    const doneNote = doneEntry && doneEntry.note;
    const blockDur = dur(b);

    return {
      id: b._id,
      title: b.l,
      start: `${dateStr}T${b.s}:00`,
      end: `${dateStr}T${b.e}:00`,
      classNames: [b.c, isDone ? 'block-done' : ''].filter(Boolean),
      extendedProps: {
        category: b.c,
        note: b.n,
        doneNote,
        blockIdx: origIdx,
        _id: b._id,
        _edited: b._edited,
        _added: b._added,
        doneKey,
        isDone,
        duration: blockDur,
      },
    };
  });
}

export function getSleepSummary(day) {
  const blocks = getBlocks(day);
  const sleepBlocks = blocks.filter(b => b.c === 'sleep');
  if (!sleepBlocks.length) return '';
  return sleepBlocks.map(b =>
    `${fmtTime(b.s)}\u2013${fmtTime(b.e)} ${b.l}`
  ).join(' \u00b7 ');
}

function renderEventContent(arg) {
  const p = arg.event.extendedProps;
  const blockDur = p.duration;
  const elHeight = arg.event.end - arg.event.start;
  const hideNote = elHeight < 50 * 60 * 1000;

  let html = '<div class="fc-block-inner">';
  html += '<div class="fc-block-content">';
  html += `<div class="fc-block-title">${arg.event.title}`;
  if (blockDur >= 60) html += ` <span class="fc-block-dur">${fmtDur(blockDur)}</span>`;
  if (p._edited) html += '<span class="fc-block-tag"> edited</span>';
  if (p._added) html += '<span class="fc-block-tag"> +</span>';
  html += '</div>';
  if (p.note && !hideNote) html += `<div class="fc-block-note">${p.note}</div>`;
  if (p.doneNote && !hideNote) html += `<div class="fc-block-done-note">${p.doneNote}</div>`;
  html += '</div>';
  html += '<div class="fc-block-actions">';
  html += `<span class="tblock-edit-btn" data-edit-idx="${p.blockIdx}">edit</span>`;
  html += `<input type="checkbox" class="tblock-check" data-done-key="${p.doneKey}" ${p.isDone ? 'checked' : ''}>`;
  html += '</div>';
  html += '</div>';

  return { html };
}

function computeSlotMin(day) {
  const blocks = getBlocks(day);
  const wake = blocks.filter(b => b.c !== 'sleep');
  if (!wake.length) return '00:00:00';
  const earliest = Math.min(...wake.map(b => toMin(b.s)));
  const hour = Math.max(0, Math.floor(earliest / 60) - 1);
  return `${String(hour).padStart(2, '0')}:00:00`;
}

export function initCalendar(containerEl, handlers) {
  if (calendar) calendar.destroy();

  const day = state.selectedDay || 'MON';
  const date = getDateForDayObj(day);

  calendar = new FullCalendar.Calendar(containerEl, {
    initialView: 'timeGridDay',
    initialDate: date,
    headerToolbar: false,
    allDaySlot: false,
    nowIndicator: true,
    height: 'auto',
    slotMinTime: computeSlotMin(day),
    slotMaxTime: '24:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00',
    editable: true,
    eventDurationEditable: true,
    longPressDelay: 500,
    eventLongPressDelay: 500,
    snapDuration: '00:15:00',
    events: blocksToEvents(day),
    eventContent: renderEventContent,
    eventClick: handlers.onEventClick,
    eventDrop: handlers.onEventDrop,
    eventResize: handlers.onEventResize,
  });

  calendar.render();
  return calendar;
}

export function updateCalendar(day) {
  if (!calendar) return;

  const date = getDateForDayObj(day);
  calendar.setOption('slotMinTime', computeSlotMin(day));
  calendar.gotoDate(date);

  const src = calendar.getEventSources();
  src.forEach(s => s.remove());
  calendar.addEventSource(blocksToEvents(day));
}

export function getCalendar() { return calendar; }
export { timeStr };
