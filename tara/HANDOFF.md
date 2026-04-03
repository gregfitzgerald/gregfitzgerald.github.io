# Tara's Schedule App -- Handoff Document

**Last updated:** 2026-03-26
**Live URL:** greg-fitzgerald.com/tara/
**Repo:** /mnt/c/Users/gregs/gregfitzgerald.github.io (GitHub Pages, pushes go live)
**Primary user:** Tara (Greg's partner). Greg builds; Tara evaluates on her phone.

---

## What This Is

A mobile-first PWA that displays Tara's 2-week rotating work schedule. She opens it on her phone daily to see what block she's in, check off completed blocks, and make edits that cascade through the day's timing.

Key behaviors:
- 2-week cycle (Week 1: normal 38.5h, Week 2: 31.5h + OFF FRI)
- Cycle is **hardcoded** to anchor on 2026-03-09 as Week 1 Monday. The app auto-detects the current week. This must not change.
- Google Calendar-style timeline: blocks are absolutely positioned with height proportional to duration (60px/hour). Sleep blocks are collapsed into a summary bar above the grid. Hour gridlines in the left gutter.
- Edits persist in localStorage. There is a Firebase sync module (sync.js) but it's single-user, Tara-only.

---

## Architecture

Single-page app. No build step. ES modules loaded via `<script type="module">`.

```
tara/
  index.html          # All HTML: shell, modals, legend
  css/style.css       # All styles
  sw.js               # Service worker (bump CACHE_NAME on every deploy)
  manifest.json       # PWA manifest
  icons/              # PWA icons
  js/
    app.js            # Entry point: wires events, initializes state, registers SW
    data.js           # Constants: ALL_DAYS, CATEGORIES, BASE schedule, SMART_TASKS, WEEKLY_RESET
    state.js          # Central state: load/save localStorage, export, migrations, getCurrentWeek()
    blocks.js         # Block resolution: merges BASE data with user edits -> final block list
    time.js           # Pure utilities: toMin, toTime, dur, fmtTime, fmtDur
    render.js         # DOM rendering: grid, detail panel, preview panels, stats, time indicator
    cascade.js        # Cascade logic: when a block's time changes, shift subsequent blocks
    drag.js           # Long-press drag-to-reorder blocks
    modals.js         # Edit/add block modals, settings modal
    tasks.js          # Daily tasks, habit streaks (SMART tasks, ASMR tasks)
    sync.js           # Firebase auto-sync (single-user)
```

### Data Flow

1. `data.js` defines the **BASE** schedule (static, 14 days)
2. `state.js` loads **edits** from localStorage (add/replace/delete operations per day)
3. `blocks.js::getBlocks(day)` merges BASE + edits -> final ordered block array
4. `render.js` renders blocks into the DOM
5. User edits go through `modals.js` -> write to `state.edits` -> re-render

### Timeline Rendering (Google Calendar layout)

In `render.js`, both `renderDetail()` and `renderDayPreview()` use this pattern:

- Filter blocks into sleep vs wake
- `getTimeRange(blocks)` computes the visible minute range (first wake start rounded down, last wake end rounded up)
- Container `.timeline-grid` height = `(endMin - startMin) * PX_PER_MIN` (currently 1px/min, 60px/hour)
- Each wake block is `position: absolute` with `top` and `height` computed from its start/end times
- Sleep appears as a `.sleep-summary` bar above the grid
- Hour gridlines (`.hour-line`) are placed at each hour boundary
- Minimum block height is 36px for tap targets; notes hidden on blocks < 50px

Constants: `PX_PER_HOUR = 60`, `PX_PER_MIN = 1`, `MIN_BLOCK_PX = 36`

### Drag-to-Reorder

`drag.js` uses long-press (400ms) to initiate. The drag targets `.tblock[data-block-idx]` elements directly (no wrapper rows). Ghost element follows the finger; gap animation shifts blocks via `transform: translateY`. On drop, the block array is reordered and times are recalculated by `cascade.js`.

### Categories

Defined in `data.js::CATEGORIES`. CSS vars and classes in `style.css`. Modal `<select>` options in `index.html` (two copies: add modal `#am-cat` and edit modal `#em-cat`). Legend also in `index.html`.

Current categories: work, commute, exercise, creative, errands, social, mealprep, selfcare, sleep, papiapt, taraapt, cats, other.

**If you add/remove a category, you must update all four places:** data.js CATEGORIES, style.css (`:root` var + class), index.html legend, index.html both modal selects.

### State Migrations

`state.js::load()` includes a migration block that remaps old category names in existing edits (admin -> errands, gaming -> social, etc.). If you rename categories, add a migration here so Tara's saved edits don't break.

### Service Worker

`sw.js` caches all app files. **You must bump `CACHE_NAME`** (currently `tara-schedule-v15`) on every deploy, or Tara's phone will serve stale files. She can also hit Force Refresh in the Settings tab.

---

## Schedule Structure

### Morning Routines (standardized across all days)

All days start at 4:30am with the same sequence: Sunrise alarm, Stationary bike, Get ready, Coffee + light therapy, Final prep + cats. Workdays add Commute in (7:00-8:00). Nonworkdays do not.

### Evening Routines

- **Pre-workday** (tomorrow is a workday): 9:00pm-10:30pm, selfcare, "Evening routine"
- **Pre-nonworkday** (tomorrow is off): 10:00pm-11:30pm, selfcare, "Evening routine"

Wind down blocks were removed. Gaps between the last activity and the evening routine show as whitespace (this is intentional -- Google Calendar style).

### Day Classification

| Day | W1 | W2 |
|-----|----|----|
| MON-THU | Workday | Workday |
| FRI | Workday | **OFF** (nonworkday) |
| SAT-SUN | Nonworkday | Nonworkday |

THU is always the "long day" (8am-7pm work). Both weeks.

### Nonworkday Features

- 2hr Apartment pickup block (7:00-9:00) on every nonworkday
- SUN has Weekly planning + Meal prep blocks

---

## Known Quirks / Things to Watch

1. **The single-file version** at `/mnt/c/Users/gregs/tlmfitz.github.io/tara_schedule_v4.html` is a separate, older copy. The production app is the multi-file version at `/mnt/c/Users/gregs/gregfitzgerald.github.io/tara/`. Changes go to the multi-file version.

2. **`toTime()` must be imported** in render.js for the hour gridline labels. It was added to the import list during the timeline rewrite.

3. **`tara-test/`** exists in the repo as an older test directory. It may be stale.

4. **Block IDs** (`b._id`) are generated by `blocks.js` during resolution and used as keys for the `blockDone` completion tracking. If you change how blocks are resolved, completion state could get orphaned.

5. **Cycle anchor** is hardcoded in `state.js` as `cycleStart: "2026-03-09"`. User explicitly requested this never change. `getCurrentWeek()` computes w1/w2 from this anchor + today's date.

6. **Stats bar** in `renderStats()` tracks: exercise, creative, errands, social, mealprep. The meta line in detail view shows: Creative, Exercise, Social.

7. **Firebase sync** (sync.js) is wired up but the config may need updating. It's single-user (Tara's phone <-> localStorage).

---

## Tara's Feedback Style

Tara sends feedback via screenshots and a Word doc (forwarded through Greg). She evaluates on her phone. Key preferences she has expressed:
- Blocks should visually reflect duration (the whole reason for the calendar layout)
- Categories should be practical, not granular (social absorbs gaming/intimacy)
- No subheading clutter below the header
- The 2-week cycle must be date-aware and auto-detected, not manually toggled

---

## How to Deploy

```bash
cd /mnt/c/Users/gregs/gregfitzgerald.github.io
# Make changes to tara/ files
# Bump sw.js CACHE_NAME
git add tara/
git commit -m "Description of changes"
git push
```

GitHub Pages deploys automatically. Tell Tara to Force Refresh.
