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

  // Build DOM nodes so we can set .checked property directly (not just attribute)
  const outer = document.createElement('div');
  outer.className = 'fc-block-inner';

  const content = document.createElement('div');
  content.className = 'fc-block-content';

  const title = document.createElement('div');
  title.className = 'fc-block-title';
  title.textContent = arg.event.title;
  if (blockDur >= 60) {
    const dur = document.createElement('span');
    dur.className = 'fc-block-dur';
    dur.textContent = ` ${fmtDur(blockDur)}`;
    title.appendChild(dur);
  }
  if (p._edited) { const t = document.createElement('span'); t.className = 'fc-block-tag'; t.textContent = ' edited'; title.appendChild(t); }
  if (p._added)  { const t = document.createElement('span'); t.className = 'fc-block-tag'; t.textContent = ' +'; title.appendChild(t); }
  content.appendChild(title);

  if (p.note && !hideNote) {
    const note = document.createElement('div');
    note.className = 'fc-block-note';
    note.textContent = p.note;
    content.appendChild(note);
  }
  if (p.doneNote && !hideNote) {
    const dn = document.createElement('div');
    dn.className = 'fc-block-done-note';
    dn.textContent = p.doneNote;
    content.appendChild(dn);
  }
  outer.appendChild(content);

  const actions = document.createElement('div');
  actions.className = 'fc-block-actions';

  const editBtn = document.createElement('span');
  editBtn.className = 'tblock-edit-btn';
  editBtn.dataset.editIdx = p.blockIdx;
  editBtn.textContent = 'edit';
  actions.appendChild(editBtn);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'tblock-check';
  checkbox.dataset.doneKey = p.doneKey;
  checkbox.checked = !!p.isDone; // set property, not attribute -- always reflects visual state
  actions.appendChild(checkbox);

  outer.appendChild(actions);
  return { domNodes: [outer] };
}

function computeSlotMin(day) {
  const blocks = getBlocks(day);
  const wake = blocks.filter(b => b.c !== 'sleep');
  if (!wake.length) return '00:00:00';
  const earliest = Math.min(...wake.map(b => toMin(b.s)));
  // Round down to nearest 30 min so the first block starts right at the top
  const rounded = Math.floor(earliest / 30) * 30;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
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
    eventSources: [{ id: 'tara-blocks', events: [] }],
    eventContent: renderEventContent,
    eventClick: handlers.onEventClick,
    eventDrop: handlers.onEventDrop,
    eventResize: handlers.onEventResize,
  });

  calendar.render();
  // Populate after render so the source is registered
  const src = calendar.getEventSourceById('tara-blocks');
  if (src) blocksToEvents(day).forEach(e => calendar.addEvent(e, 'tara-blocks'));
  return calendar;
}

export function updateCalendar(day) {
  if (!calendar) return;

  const date = getDateForDayObj(day);
  calendar.setOption('slotMinTime', computeSlotMin(day));
  calendar.gotoDate(date);

  // Remove all events and re-add for this day via the named source
  calendar.getEvents().forEach(e => e.remove());
  blocksToEvents(day).forEach(e => calendar.addEvent(e, 'tara-blocks'));
}

export function getCalendar() { return calendar; }
export { timeStr };
