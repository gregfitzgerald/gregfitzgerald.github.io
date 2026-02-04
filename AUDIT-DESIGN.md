# Visual Design & UX Audit

**Auditor:** Professional UI/UX Design Review  
**Date:** July 2025  
**Site:** greg-fitzgerald.com (gregfitzgerald.github.io)  
**Scope:** All HTML pages + style.css — visual consistency, typography, color, layout, interactivity, and overall professional impression

---

## Executive Summary

The site currently reads as a **graduate student's early-career project** rather than the polished personal site of a serious researcher. The underlying content is strong, but visual execution undermines credibility. The core problems are:

1. **Two incompatible design systems** coexist — Alexey Guzey's borrowed CSS (Encode Sans + Dosis, pink accents) and a monospace/dark-mode system used on legacy pages (404, welcome, gallery, CV)
2. **No consistent spacing rhythm** — margins/padding are ad-hoc pixel values with no underlying scale
3. **Navigation is cluttered** — two rows of nav items with inline-styled `>` separators feel undesigned
4. **The homepage three-column layout** is ambitious but the sidebar widgets (fake tweets, fake books, fake calendar) actively damage credibility
5. **Links are near-invisible** — black underlined text on a white page gives no visual signal of interactivity
6. **Zero transitions or animations** on standard pages — the site feels static and dated

**Benchmark sites for comparison:**
- **Alexey Guzey** (guzey.com) — the original source CSS; clean, text-focused, deliberate
- **Andrej Karpathy** (karpathy.ai) — minimal, elegant, researcher-as-writer
- **Lilian Weng** (lilianweng.github.io) — excellent typography, clear hierarchy, professional
- **Chris Olah** (colah.github.io) — content-first, beautiful math/science presentation
- **Andrew Huberman** (hubermanlab.com) — polished brand, clear CTAs

The site should aim for the **Guzey/Karpathy zone**: text-focused, clean, idiosyncratic personality without visual clutter.

---

## 1. Visual Consistency

### Current State: ❌ Inconsistent

The site has **two completely separate visual languages**:

**System A — "Guzey-derived" pages** (index, about, research, writing, projects, tutoring, jimmy, blog posts using style.css):
- Font: Encode Sans 400/700 body, Dosis 500 headings
- Colors: `#121212` text, `#ffd1dc` pink accents, `#f9f9f9` backgrounds
- Max-width: 800px centered layout
- Pink border-left on h2/h3

**System B — "Monospace legacy" pages** (404.html, welcome.html, gallery.html, cv.html, igf2-alzheimers.html root version):
- Font: `monospace` (system default)
- Colors: `#333` text, `#0066cc` links, dark mode support
- Max-width: 650px centered layout
- Completely different heading styles, link colors, everything

**This is the single biggest design problem.** A visitor clicking from the homepage to the gallery page enters a completely different website.

### Specific Inconsistencies

| Element | System A (style.css) | System B (inline styles) |
|---------|---------------------|-------------------------|
| Body font | Encode Sans | monospace |
| Link color | `#121212` (same as text!) | `#0066cc` (blue) |
| Link hover | underline only | underline |
| Max width | 800px | 650px |
| H2 style | Pink border-left, Dosis font | Border-bottom: 1px solid #eee |
| Footer | `.site-footer` centered | `border-top: 1px solid #eee` |
| Dark mode | Not supported | `@media (prefers-color-scheme: dark)` |
| Header/Nav | Full nav bar with pink `>` separators | Simple `<nav>` with horizontal links |

### Recommendations

1. **Eliminate System B entirely.** Every page must use `style.css` and the shared header/footer. No inline `<style>` blocks that redefine body, headings, links, etc.
2. **Create a components file** or documented patterns for: header, footer, page container, section dividers
3. **Use CSS custom properties** for all colors, spacing, and fonts (see Color Palette section below)

---

## 2. Typography

### Current State: ⚠️ Mediocre

**Font choices:**
- **Encode Sans** (body): Functional but generic. It's a free Google Font that reads as "I picked the first sans-serif that looked okay." It lacks the warmth of Inter, the crispness of Source Sans, or the personality of IBM Plex Sans.
- **Dosis** (headings): A rounded geometric sans that feels playful/casual — not ideal for a neuroscience researcher wanting to be taken seriously. It softens the entire site's tone.

**Font loading:**
- Using old Google Fonts API format (`css?family=` instead of `css2?family=`)
- Only loading weights 400, 700 for Encode Sans and 500 for Dosis — limiting typographic range
- No `font-display: swap` — potential FOIT (Flash of Invisible Text)

**Hierarchy issues:**
- `html { font-size: 0.95em; }` — **shrinks all text below browser default for no reason**
- H1: 36px (hardcoded)
- H2: 28px (hardcoded)
- H3: no explicit size
- Body line-height: 1.5 (fine)
- Paragraph margins: `0.5rem` all sides — too tight vertically, unnecessary horizontal margin
- `h1, h2, h3, h4, h5, h6 { margin: 0; margin-left: 8px; }` — why do headings have left margin?

**Line length:**
- `.main { max-width: 800px }` produces ~95 characters per line at default size — **too long for comfortable reading**. Research consensus says 50-75 characters is optimal. At 800px with 8px padding on each side, body text runs ~90+ characters.

**Specific CSS issues:**
```css
/* This is wrong — headings shouldn't have left margin by default */
h1, h2, h3, h4, h5, h6 {
    margin: 0;
    margin-left: 8px;
}

/* This is wrong — paragraphs shouldn't have horizontal margins */
p {
    margin: 0.5rem;
}

/* This shrinks everything for no benefit */
html {
    font-size: 0.95em;
}
```

### Recommendations

**Font upgrade options (pick one pair):**

| Option | Body | Headings | Vibe |
|--------|------|----------|------|
| A (Modern Academic) | Inter | Inter (weight variation) | Clean, professional, universal |
| B (Distinctive) | Source Serif 4 | Source Sans 3 | Academic warmth, serif body |
| C (Tech-Forward) | IBM Plex Sans | IBM Plex Sans (weight) | Distinctive, institutional feel |
| D (Keep Identity) | Encode Sans | Replace Dosis → Encode Sans (bold) | Minimal change, more cohesion |

**Typography scale (use rem, not px):**
```css
:root {
  --font-size-base: 1rem;       /* 16px — don't shrink it */
  --font-size-sm: 0.875rem;     /* 14px */
  --font-size-xs: 0.75rem;      /* 12px */
  --font-size-lg: 1.125rem;     /* 18px */
  --font-size-h1: 2rem;         /* 32px */
  --font-size-h2: 1.5rem;       /* 24px */
  --font-size-h3: 1.25rem;      /* 20px */
  --font-size-h4: 1.125rem;     /* 18px */
  
  --line-height-body: 1.65;
  --line-height-heading: 1.3;
}

html {
  font-size: 100%; /* NOT 0.95em */
}

p {
  margin: 0 0 1rem 0; /* vertical only, no horizontal margin */
  max-width: 65ch; /* enforces optimal line length */
}

h1, h2, h3, h4, h5, h6 {
  margin: 0 0 0.5rem 0; /* no left margin */
  line-height: var(--line-height-heading);
}
```

**Max-width recommendation:**
```css
.main {
  max-width: 700px; /* tighter — better reading experience */
  /* OR use ch units for content-based width: */
  max-width: 70ch;
}
```

---

## 3. Color Palette

### Current State: ⚠️ Weak

The current "palette" is essentially:
- `#121212` — near-black (text)
- `#ffd1dc` — baby pink (accent everywhere)
- `#ffa1ac` — slightly darker pink (sidenote numbers)
- `#ffb8c6` — medium pink (hover states)
- `#9a9a9a` — gray (meta text)
- `#f9f9f9` — near-white (card backgrounds)
- `#f4f4f4` — slightly darker near-white (tags, code)
- `#e5e5e5` — light gray (borders)
- `white` — background

**Problems:**
1. **Pink overload.** `#ffd1dc` is used for: heading borders, selection highlight, TOC borders, project borders, navigation separators, sidebar borders, widget borders, calendly preview, progress bars, book cover placeholders, tags, callout borders. It's the only color doing all the work.
2. **No secondary accent color.** Everything is pink or gray. There's no color to distinguish different content types (research vs. blog vs. project), no semantic color usage.
3. **Links are invisible.** `a { color: #121212 }` makes links the same color as body text. The only distinction is a thin underline — **this fails accessibility guidelines** for distinguishability.
4. **Pink reads as feminine/unserious** in many academic contexts. This is a cultural bias, but it's real. For a neuroscience researcher, a more muted or scholarly palette communicates more authority.

### Recommended Palette

**Option A — Scholarly Warmth (recommended):**
```css
:root {
  /* Core */
  --color-text: #1a1a2e;          /* rich near-black with slight warmth */
  --color-text-secondary: #64748b; /* slate gray for meta/dates */
  --color-bg: #fafaf9;            /* warm white */
  --color-bg-alt: #f1f0ee;        /* slightly darker warm white */
  
  /* Accent — muted rose instead of baby pink */
  --color-accent: #c08497;        /* dusty rose — sophisticated, not girly */
  --color-accent-light: #e8d5dc;  /* light version for borders/backgrounds */
  --color-accent-hover: #a06b7e;  /* darker version for hover */
  
  /* Semantic */
  --color-link: #2563eb;          /* standard accessible blue */
  --color-link-hover: #1d4ed8;    /* darker blue */
  --color-link-visited: #7c3aed;  /* purple for visited */
  
  /* Borders & Dividers */
  --color-border: #e2e1df;
  --color-border-accent: var(--color-accent-light);
  
  /* Status colors (for project badges) */
  --color-status-active: #059669;
  --color-status-concept: #d97706;
  --color-status-complete: #2563eb;
}
```

**Option B — Minimal Monochrome + Single Accent:**
```css
:root {
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-bg: #ffffff;
  --color-bg-alt: #f9fafb;
  --color-accent: #4f46e5;        /* indigo — academic, modern */
  --color-accent-light: #e0e7ff;
  --color-link: #4f46e5;
  --color-link-hover: #4338ca;
}
```

**Critical fix — make links visible:**
```css
a {
  color: var(--color-link);
  text-decoration: underline;
  text-decoration-color: var(--color-accent-light);
  text-underline-offset: 2px;
  transition: color 0.15s ease, text-decoration-color 0.15s ease;
}

a:hover {
  color: var(--color-link-hover);
  text-decoration-color: var(--color-link-hover);
}
```

---

## 4. Layout and Spacing

### Current State: ❌ Poor

**The spacing is the most obviously "student project" element.** Values are scattered, inconsistent, and too tight.

**Inventory of current spacing values used:**
```
0, 0px, 0rem, 4px, 5px, 6px, 8px, 10px, 12px, 15px, 16px, 20px, 24px, 25px, 30px, 32px, 40px, 50px
0.25rem, 0.3rem, 0.4rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 2.5rem, 3.5rem
```

There are **19+ different spacing values** with no system. Professional sites use a spacing scale: `4, 8, 12, 16, 24, 32, 48, 64, 96` (or a similar geometric progression).

**Specific layout problems:**

1. **Header padding is too tight.** `padding-top: 16px` on `.site-navi` leaves the header cramped against the top of the viewport.
2. **Content starts immediately after the pink border.** There's only 8px between the header border and the first content. Needs 32-48px of breathing room.
3. **Paragraph margins are wrong.** `p { margin: 0.5rem }` adds horizontal margin to paragraphs — text content should never have side margins distinct from its container.
4. **Homepage three-column grid** is overly complex for the content it contains. The sidebars are mostly placeholder content and the left sidebar duplicates the main navigation.
5. **Footer has no breathing room.** `margin-top: 24px` is insufficient — footer should feel separated from content.

### Recommended Spacing System

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.5rem;    /* 24px */
  --space-6: 2rem;      /* 32px */
  --space-7: 3rem;      /* 48px */
  --space-8: 4rem;      /* 64px */
  --space-9: 6rem;      /* 96px */
}

/* Apply consistently */
.site-header {
  padding: var(--space-6) 0;
}

.site-header-bottom {
  margin-bottom: var(--space-7); /* breathing room before content */
}

.main {
  padding: 0 var(--space-4);
  margin-bottom: var(--space-8);
}

h1 { margin-bottom: var(--space-5); }
h2 { margin-top: var(--space-7); margin-bottom: var(--space-4); }
h3 { margin-top: var(--space-6); margin-bottom: var(--space-3); }

p { 
  margin: 0 0 var(--space-4) 0;  /* bottom only */
}

.site-footer {
  margin-top: var(--space-8);
  padding: var(--space-6) var(--space-4);
  border-top: 1px solid var(--color-border);
}
```

### Homepage Layout Recommendation

**Drop the three-column layout.** It's over-engineered for the current content stage.

Replace with a **single-column layout** (like the rest of the site) with optional sidebar elements that could be added later. The left sidebar navigation duplicates the header nav. The right sidebar widgets are all fake/placeholder. Both actively harm the site.

```css
/* Simple, professional homepage layout */
.main {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}
```

If you want a two-column layout eventually (content + sidebar), only do it when you have **real widget content** (actual Calendly, actual reading list, actual Twitter).

---

## 5. Interactive Elements

### Current State: ❌ Underdeveloped

**Links:**
- Default: `color: #121212; text-decoration: underline;` — invisible as links
- Hover: only adds/keeps underline — no color change, no transition
- No `transition` property — state changes are instantaneous and jarring
- Nav links: `text-decoration: none` → `text-decoration: underline` on hover — bare minimum

**Buttons:**
- `.widget-button` has `transition: background-color 0.2s ease` ✓ (only element with transitions)
- No `.btn` or button class for general use
- Tutoring page's "Book a session" CTA has no button styling at all

**Cards/project items:**
- `.widget:hover` has `transform: translateY(-2px)` + box-shadow ✓ (homepage widgets)
- But `.project`, `.post-preview` have zero hover effects
- `.gallery-item` has nice hover effects (scale, shadow, caption reveal) ✓ — but uses System B styling

**Navigation:**
- No visual indication of current page (except left sidebar `.nav-current`)
- No active state styling for nav items
- The pink `>` separators are inline-styled spans — not proper CSS

### Recommendations

```css
/* Global transition baseline */
* {
  transition-property: color, background-color, border-color, box-shadow, transform, opacity;
  transition-duration: 0.15s;
  transition-timing-function: ease;
}

/* Links — visible and interactive */
a {
  color: var(--color-link);
  text-decoration: underline;
  text-decoration-color: rgba(37, 99, 235, 0.3);
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}

a:hover {
  color: var(--color-link-hover);
  text-decoration-color: var(--color-link-hover);
  text-decoration-thickness: 2px;
}

/* Nav current page indicator */
.site-navi-item-current a {
  font-weight: 700;
  border-bottom: 2px solid var(--color-accent);
}

/* Post previews — clickable feel */
.post-preview {
  padding: var(--space-4);
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.post-preview:hover {
  background-color: var(--color-bg-alt);
}

/* Project cards */
.project {
  padding: var(--space-5);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.project:hover {
  border-color: var(--color-accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* CTA Button */
.btn {
  display: inline-block;
  padding: 0.625rem 1.25rem;
  background: var(--color-accent);
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.btn:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

/* Back-to-top / back links */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
}

.back-link:hover {
  color: var(--color-text);
}
```

---

## 6. Dark Mode

### Current State: ⚠️ Partial & Inconsistent

- **System B pages** (404, welcome, gallery, CV) have `@media (prefers-color-scheme: dark)` with proper dark mode
- **System A pages** (everything using style.css) have **zero dark mode support**
- This means the **majority of the site** — including the homepage, research, blog posts, about — has no dark mode

### Recommendation: Yes, implement dark mode

For a researcher's personal site, dark mode is increasingly expected. It's also relatively straightforward with CSS custom properties.

```css
/* Light mode (default) */
:root {
  --color-text: #1a1a2e;
  --color-text-secondary: #64748b;
  --color-bg: #fafaf9;
  --color-bg-alt: #f1f0ee;
  --color-accent: #c08497;
  --color-accent-light: #e8d5dc;
  --color-link: #2563eb;
  --color-border: #e2e1df;
  --color-code-bg: #f3f4f6;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #e2e1df;
    --color-text-secondary: #94a3b8;
    --color-bg: #1a1a2e;
    --color-bg-alt: #242445;
    --color-accent: #d4a0b0;
    --color-accent-light: #3d2d35;
    --color-link: #60a5fa;
    --color-border: #334155;
    --color-code-bg: #1e293b;
  }
}

/* Use variables everywhere — dark mode is then automatic */
body {
  color: var(--color-text);
  background: var(--color-bg);
}
```

**Optional: Manual toggle** (requires ~10 lines of JS):
```html
<button class="theme-toggle" aria-label="Toggle dark mode">🌙</button>
```

---

## 7. Micro-Interactions & Polish

### Current State: ❌ Almost None

The only micro-interactions on the site are:
- `.widget:hover` transform/shadow (homepage only)
- `.gallery-item:hover` scale/shadow/caption reveal (gallery only)
- `@keyframes pulse` on calendar icon (homepage only)
- `.nav-list a` has `transition: background-color 0.2s ease` (homepage sidebar only)

The rest of the site is completely static. No scroll effects, no subtle animations, no loading states.

### Recommendations

**Header separator — subtle animation on scroll:**
```css
.site-header-bottom {
  border-top: 2px solid var(--color-accent-light);
  transition: border-color 0.3s ease;
}

/* Add via JS: class when scrolled past header */
.site-header-bottom.scrolled {
  border-color: var(--color-accent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

**Smooth page entry (subtle fade-in):**
```css
.main {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Post preview stagger on blog index:**
```css
.post-preview {
  animation: fadeIn 0.4s ease-out both;
}

.post-preview:nth-child(1) { animation-delay: 0.05s; }
.post-preview:nth-child(2) { animation-delay: 0.1s; }
.post-preview:nth-child(3) { animation-delay: 0.15s; }
/* etc. */
```

**Heading anchor links on hover** (extremely common on academic/technical blogs):
```css
h2:hover::after,
h3:hover::after {
  content: " #";
  color: var(--color-text-secondary);
  font-weight: 400;
  opacity: 0.5;
}
```

**Reading progress bar** (for long posts like IGF2):
```css
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--color-accent);
  z-index: 100;
  transition: width 0.1s linear;
}
```

**Important:** Keep animations subtle. Academic sites should feel calm and focused, not bouncy.

---

## 8. Overall Impression

### Current Rating: 4/10 — "Student Project with Good Content"

**What works:**
- Content quality is genuinely strong (the IGF2 paper, project descriptions, tutoring page)
- The sidenote system (borrowed from Tufte CSS via Guzey) is excellent for academic writing
- The TOC sidebar on long posts is well-implemented
- Having a structured projects page with status badges shows professionalism
- The overall site architecture (pages, structure) is logical

**What doesn't work:**
- Two incompatible design systems create a fragmented, unfinished feel
- Pink baby-shower color palette undermines scholarly authority
- Navigation is cluttered with two rows and inline styles
- Homepage has fake placeholder widgets (fake tweets, fake books) — **remove these immediately**
- Links are visually indistinguishable from body text
- Spacing is inconsistent and too tight throughout
- The "GUZEY'S EXACT CSS" comment at the top of style.css signals "I copied someone's homework"
- Multiple placeholder pages (Jimmy, Gallery) with no real content
- CV page has bracketed `[Degree Name]` placeholders — looks broken

**Professional benchmarks comparison:**

| Criterion | This Site | Guzey | Karpathy | Lilian Weng |
|-----------|-----------|-------|----------|-------------|
| Visual cohesion | ❌ Split personality | ✅ Minimal, consistent | ✅ Minimal, consistent | ✅ Clean, academic |
| Typography | ⚠️ Generic fonts, bad spacing | ✅ Deliberate, readable | ✅ System fonts, clear | ✅ Strong hierarchy |
| Color | ⚠️ Pink overload | ✅ Minimal, intentional | ✅ Monochrome + blue | ✅ Subtle blue accents |
| Navigation | ❌ Cluttered, 2 rows | ✅ Simple top bar | ✅ Minimal 4 links | ✅ Clean sidebar |
| Interactivity | ❌ Nearly none | ⚠️ Minimal (intentional) | ⚠️ Minimal | ✅ Code blocks, search |
| Dark mode | ❌ Partial, inconsistent | ❌ None | ❌ None | ✅ Full support |
| Mobile | ⚠️ Basic responsive | ✅ Works | ✅ Works | ✅ Works well |
| "Is this person serious?" | ⚠️ Unclear | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 9. CSS Technical Issues

### Redundant / Problematic Styles

```css
/* ISSUE: Comment at top of file */
/* GUZEY'S EXACT CSS - EXTRACTED FROM HIS SITE */
/* Remove this comment — it's embarrassing to attribute your design to copying */

/* ISSUE: Two different selection highlight colors exist */
::selection { background: #ffd1dc; }
/* The commented-out #fff999 should be removed entirely */

/* ISSUE: h2:before counter system conflicts with .nocount */
/* Every single h2 on the site uses class="nocount" — 
   the counter system is dead code. Remove it or actually use it. */

/* ISSUE: .right_float has a blue box-shadow for no apparent reason */
.right_float {
  box-shadow: 1px 2px 2px 0px rgba(0, 0, 255, .2); /* why blue? */
}

/* ISSUE: hr references a non-existent image */
hr {
  background: url(../files/hrcross.png) repeat-x 0 0;
  /* This file path likely doesn't exist — produces broken HR */
}

/* ISSUE: .notable sidebar is display:none at <1600px */
/* Since most screens are < 1600px, this feature never shows */

/* ISSUE: Sidenotes are display:none at <1300px with toggle */
/* This is actually fine behavior, but the toggle styling is unstyled */
```

### Specificity Problems

```css
/* cv.html has inline <style> that overrides style.css body font */
body { font-family: monospace; } /* In <head> style block */
/* AND */
body { font-family: monospace; } /* In page-level <style> */
/* PLUS style.css has: */
body { font-family: 'Encode Sans', sans-serif; }
/* Result: cv.html uses monospace because inline styles win */

/* gallery.html same problem — inline styles override everything */
/* 404.html doesn't even load style.css */
/* welcome.html doesn't load style.css */
```

### Media Query Gaps

```css
/* Current breakpoints: 1600px, 1300px, 1100px, 760px, 768px */
/* Issues: */

/* 1. 760px and 768px are used inconsistently */
@media (max-width: 760px) { /* in style.css */ }
@media (min-width: 768px) { /* in gallery.html */ }
/* Pick one breakpoint for "mobile" and stick to it */

/* 2. No breakpoint between 760px and 1100px (tablet) */
/* Content pages at 800-1000px wide have issues */

/* 3. Homepage grid has responsive rules but inner pages don't */
/* .main at 800px max-width works, but some pages override this */

/* RECOMMENDED BREAKPOINTS: */
/* --bp-sm: 640px   (small mobile) */
/* --bp-md: 768px   (tablet) */
/* --bp-lg: 1024px  (desktop) */
/* --bp-xl: 1280px  (large desktop) */
```

### Dead / Unused CSS

The following classes appear in `style.css` but may not be used meaningfully:
- `.highlight_pink`, `.highlight_blue` — only useful if content uses them
- `.min`, `.med`, `.max` — color-coding system (blue/green/red) with no apparent use
- `.hexplain` — heading explanation class, unused in current HTML
- `.notable` — hidden at <1600px, only used in one post (IGF2)
- Counter system (h2:before, h3:before, h4:before) — every heading uses `.nocount`

---

## 10. Priority Action Plan

### Phase 1: Critical Fixes (Do First — 1-2 hours)

1. **Unify all pages to use style.css + shared header/footer.** Remove all inline `<style>` blocks from gallery.html, cv.html, 404.html, welcome.html, igf2-alzheimers.html (root). These pages must use the same visual system.

2. **Remove or hide placeholder content.** The homepage sidebar widgets (fake tweets, fake Goodreads, fake Calendly) must go. Replace with a simple single-column layout until real content exists. Similarly, either fill jimmy.html with real content or remove it from navigation.

3. **Fix link colors.** Change `a { color: #121212 }` to a visible link color (blue recommended). This is borderline an accessibility violation.

4. **Remove the "GUZEY'S EXACT CSS" comment.** It's your site now. Own the CSS.

5. **Fill or remove CV placeholders.** `[Degree Name]`, `[Year - Year]`, `[Institution Name]` look broken. Either fill them with real data or take the page down.

### Phase 2: Design System (1-2 days)

6. **Implement CSS custom properties** for all colors, spacing, and typography. This is the foundation for everything else.

7. **Establish a spacing scale** and apply consistently across all elements.

8. **Clean up navigation.** Consolidate to a single row. Reduce to 5-6 top-level items. Remove inline-styled pink `>` separators — use CSS `::before` pseudo-elements instead.

9. **Remove the heading counter system** (or actually use it). Currently every h2 has `.nocount` — the feature is dead weight.

10. **Standardize responsive breakpoints** to 3-4 consistent values.

### Phase 3: Polish (1 week)

11. **Add transitions** to all interactive elements (links, nav items, cards).

12. **Implement dark mode** using CSS custom properties.

13. **Upgrade typography** — consider replacing Dosis with a more authoritative heading font, or simplifying to a single font family with weight variation.

14. **Add subtle page animations** (fade-in on load, stagger on lists).

15. **Add reading progress bar** for long-form posts.

16. **Clean up dead CSS** — remove unused classes, consolidate redundant rules.

### Phase 4: Content Presentation (Ongoing)

17. **Add a professional headshot** to the homepage or about page.

18. **Create a proper favicon** (the current one references `favicon.svg` — verify it exists and looks good at small sizes).

19. **Add social/academic profile icons** to the header or footer (ORCID, Google Scholar, GitHub) — use actual URLs, not placeholders.

20. **Consider adding a subtle hero section** to the homepage with name, title, institution, and one-line bio.

---

## Appendix: Recommended Navigation Structure

Current navigation (2 rows, 9 items) is too many. Recommended:

```
Greg Fitzgerald      Research  |  Writing  |  Projects  |  About  |  CV
```

- Merge "Research Tutoring" into About or make it a sub-page
- Remove Gallery from top nav (link from About page)
- Remove Contact from top nav (link from footer + About page)
- "Home" is redundant — clicking the site name goes home

This reduces cognitive load and matches the standard pattern for academic sites.

---

## Appendix: Complete CSS Custom Properties Template

```css
/* ============================================
   DESIGN TOKENS — greg-fitzgerald.com
   ============================================ */

:root {
  /* Typography */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  --font-size-4xl: 2.5rem;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.65;
  --line-height-relaxed: 1.8;
  
  --letter-spacing-tight: -0.01em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  
  /* Colors — Light Mode */
  --color-text: #1a1a2e;
  --color-text-secondary: #64748b;
  --color-text-tertiary: #94a3b8;
  --color-bg: #fafaf9;
  --color-bg-alt: #f1f0ee;
  --color-bg-code: #f3f4f6;
  --color-accent: #c08497;
  --color-accent-light: #e8d5dc;
  --color-accent-dark: #a06b7e;
  --color-link: #2563eb;
  --color-link-hover: #1d4ed8;
  --color-link-visited: #7c3aed;
  --color-border: #e2e1df;
  --color-border-accent: var(--color-accent-light);
  --color-selection-bg: var(--color-accent-light);
  --color-selection-text: var(--color-text);
  
  /* Spacing Scale */
  --space-px: 1px;
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;
  --space-9: 6rem;
  --space-10: 8rem;
  
  /* Layout */
  --content-width: 700px;
  --content-width-wide: 900px;
  --content-width-narrow: 550px;
  
  /* Borders */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 0.1s ease;
  --transition-normal: 0.15s ease;
  --transition-slow: 0.3s ease;
  
  /* Breakpoints (for reference — can't use in media queries) */
  /* sm: 640px, md: 768px, lg: 1024px, xl: 1280px */
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #e2e1df;
    --color-text-secondary: #94a3b8;
    --color-text-tertiary: #64748b;
    --color-bg: #0f172a;
    --color-bg-alt: #1e293b;
    --color-bg-code: #1e293b;
    --color-accent: #d4a0b0;
    --color-accent-light: #3d2d35;
    --color-accent-dark: #e8c0cc;
    --color-link: #60a5fa;
    --color-link-hover: #93bbfd;
    --color-link-visited: #a78bfa;
    --color-border: #334155;
    --color-border-accent: #3d2d35;
    --color-selection-bg: #3d2d35;
    --color-selection-text: #e2e1df;
  }
}
```

---

*This audit focuses on actionable improvements. The content is strong — the writing quality, project scope, and academic substance are well above average for an early-career researcher. The visual design simply needs to match the quality of the thinking behind it.*
