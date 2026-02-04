# Technical Audit: greg-fitzgerald.com

**Date:** 2025-07-11  
**Auditor:** Automated code review (senior web developer perspective)  
**Scope:** Full codebase — HTML, CSS, JS, configuration, images, architecture  
**Site:** greg-fitzgerald.com (GitHub Pages)

---

## Executive Summary

The site is a hand-coded personal academic website with 15+ HTML pages, one CSS file, one JS file, a PWA tree identification app, and two museum tracker tools. The core content is well-structured and the site loads reasonably fast for a static site. However, there are **significant maintainability problems** from massive copy-paste duplication, **two competing design systems** (the main Guzey-derived stylesheet vs. per-page inline styles), and several accessibility gaps.

### Overall Score

| Category | Grade | Notes |
|----------|-------|-------|
| HTML Quality | C+ | Semantic issues, massive duplication, inconsistent structure |
| CSS Architecture | C | Two competing systems, no variables, lots of dead code |
| Performance | B- | Static site inherently fast, but font loading and images unoptimized |
| Responsive Design | B- | Works but gaps in tablet range, inconsistent across pages |
| Accessibility | D+ | No skip links, poor contrast, no focus styles, missing landmarks |
| JavaScript | B+ | Minimal and functional, but no fallbacks |
| GitHub Pages | B+ | Has all the right files but with inconsistencies |
| Browser Compat | B | Modern CSS used appropriately, minor prefix issues |
| Security | B | Static site is inherently secure; minor link hygiene issues |
| Build Process | D | Raw HTML with massive duplication; strong SSG candidate |

**Top 3 priorities:**
1. **Adopt a static site generator** (eliminates duplication, enables templating)
2. **Fix accessibility fundamentals** (skip link, focus styles, contrast)
3. **Unify the design system** (one consistent page structure, CSS variables)

---

## 1. HTML Quality

### 1.1 Massive Header/Nav Duplication (CRITICAL)

The exact same ~45-line navigation block is copy-pasted across **every single HTML file**. This is the single biggest maintainability problem on the site.

**Files affected:** `index.html`, `about.html`, `contact.html`, `cv.html`, `research.html`, `projects.html`, `writing.html`, `tutoring.html`, `gallery.html`, `jimmy.html`, `posts/igf2-alzheimers.html`, `posts/_template.html`, `posts/claude-code-researchers.html`, `posts/ai-resistant-learning.html`, `posts/meta-analysis-methodology.html`, `posts/research-literacy-overview.html`

**Impact:** Adding a new nav item requires editing 16+ files. Missing one file creates an inconsistent navigation experience. The 404 page and some older pages already have a different, simpler nav — proving the problem.

**Fix (Quick):** If staying with raw HTML, use a build script:
```bash
#!/bin/bash
# inject-header.sh - Replace header placeholder with shared header
HEADER=$(cat _includes/header.html)
for file in *.html posts/*.html; do
    sed -i "/<!-- HEADER START -->/,/<!-- HEADER END -->/c\\${HEADER}" "$file"
done
```

**Fix (Proper):** Migrate to a static site generator (see Section 10).

### 1.2 Two Competing Page Structures

Pages fall into two completely different design paradigms:

**Paradigm A** (main site style — `index.html`, `about.html`, `writing.html`, `projects.html`, `tutoring.html`, `jimmy.html`):
- Uses `style.css` (Guzey-derived styles)
- Uses Encode Sans + Dosis fonts
- Pink accent color `#ffd1dc`
- Header with styled nav pills

**Paradigm B** (standalone pages — `404.html`, `welcome.html`, `igf2-alzheimers.html` (root), `gallery.html`, `cv.html`):
- Has massive inline `<style>` blocks (50-100 lines) that override everything
- Uses `body { font-family: monospace }` and completely different styling
- Different link colors (`#0066cc` vs `#121212`)
- Different nav structure (simple inline links)
- Has `prefers-color-scheme: dark` media queries (other pages don't)

**This creates a jarring UX.** Clicking from the homepage to the CV page feels like visiting a different website.

**Fix:** Choose one design system. The main site style (Paradigm A) is more polished. Move Paradigm B pages to use the shared stylesheet:

```html
<!-- BEFORE (cv.html) - 80+ lines of inline styles -->
<style>
    body { font-family: monospace; max-width: 650px; ... }
    h2 { font-size: 1.5em; ... }
    /* 60 more lines */
</style>

<!-- AFTER - consistent with rest of site -->
<link rel="stylesheet" href="style.css">
<!-- Add a few CV-specific rules to style.css or a cv.css file -->
```

### 1.3 Semantic HTML Issues

**Heading hierarchy problems:**
- `h1` is used for both the site title (in `<nav>`) AND the page title. Screen readers see two `h1` elements.
- Fix: The site title in the nav should NOT be `h1` on interior pages:

```html
<!-- On index.html (homepage), h1 is fine for site title -->
<h1 class="site-title"><a href="index.html">Greg Fitzgerald</a></h1>

<!-- On interior pages, demote to a div or span -->
<div class="site-title"><a href="index.html">Greg Fitzgerald</a></div>
<!-- Then the page's actual title is the only h1 -->
<h1>About</h1>
```

**Missing semantic elements:**
- Most pages lack `<main>` element (only `gallery.html`, `cv.html`, and `404.html` have it)
- No `<section>` or `<article>` wrappers on most content
- Footer inconsistency: some use `<footer class="site-footer">`, others `<footer class="footer">`, some just `<footer>`

**Inline styles everywhere:**
```html
<!-- Current - scattered inline styles -->
<span style="color: #ffd1dc;">&gt;</span>
<div style="display: block">
<a href="research.html" style="font-size: 0.85em">
<div style="background: #f9f9f9; padding: 1.5rem; border-left: 4px solid #ffd1dc; margin: 1.5rem 0.5rem;">

<!-- Better - use classes -->
<span class="nav-chevron">&gt;</span>
<div class="nav-wrapper">
<a href="research.html" class="nav-secondary">
<div class="callout-box">
```

### 1.4 Missing Meta Tags on Several Pages

**Pages missing Open Graph / description meta:**
- `about.html` — no `<meta name="description">`, no OG tags
- `contact.html` — no `<meta name="description">`, no OG tags
- `research.html` — no `<meta name="description">`, no OG tags
- `jimmy.html` — no OG tags

**Inconsistent favicon references:**
- Some pages have `<link rel="icon" type="image/svg+xml" href="favicon.svg">`, others don't
- Should be present on every page

### 1.5 Empty/Placeholder Content Issues

- `igf2-alzheimers.html` (root level) has an empty `<main></main>` — this is a dead page
- `cv.html` is full of `[Degree Name]`, `[Year - Year]` placeholders
- `contact.html` has placeholder URLs: `https://orcid.org/0000-0000-0000-0000`, `https://scholar.google.com/citations?user=YOUR_ID`
- `projects.html` has `YOUR_GITHUB_USERNAME` in links
- These placeholder URLs will confuse search engines and look unprofessional to visitors

**Quick fix:** Either fill in real data or remove placeholder sections entirely until ready. Don't publish URLs with `YOUR_ID`.

---

## 2. CSS Architecture

### 2.1 No CSS Custom Properties

The site uses hardcoded color values throughout. The primary accent `#ffd1dc` appears **47+ times** across the codebase.

**Fix — add variables to the top of style.css:**
```css
:root {
    --color-accent: #ffd1dc;
    --color-accent-hover: #ffb8c6;
    --color-text: #121212;
    --color-text-muted: #9a9a9a;
    --color-bg: #ffffff;
    --color-bg-secondary: #f9f9f9;
    --color-border: #e5e5e5;
    --font-heading: 'Dosis', sans-serif;
    --font-body: 'Encode Sans', sans-serif;
    --max-width: 800px;
    --max-width-wide: 1400px;
}
```

Then replace all hardcoded values. This enables theming and dark mode.

### 2.2 Dead/Unused CSS (~30% of file)

The following styles in `style.css` appear to have no corresponding HTML elements on the live site:

- `.notable` and all `.notable` children (the notable sidebar feature)
- `.list`, `.list-title`, `.list-item` (Hugo theme leftovers?)
- `.article-title-series` and related (from Guzey theme, not used)
- `.pagination` and related styles (no pagination exists)
- `.breadcrumb` styles (no breadcrumbs on any page)
- `.footer .poweredby` (Guzey theme leftover)
- `.highlight_pink`, `.highlight_blue` (debug helpers?)
- `.min`, `.med`, `.max` (color utility classes — unused)
- `hr` with `background: url(../files/hrcross.png)` — references a file that doesn't exist

**Estimated waste:** ~200 lines out of ~650 total lines in `style.css` (~30%)

**Quick fix:** Audit with Chrome DevTools Coverage panel, then remove unused rules.

### 2.3 CSS Organization

Current structure is disorganized — Guzey's original CSS mixed with custom additions mixed with component styles. Suggested organization:

```css
/* ============================================
   1. CUSTOM PROPERTIES (variables)
   2. RESET / BASE STYLES
   3. TYPOGRAPHY
   4. LAYOUT (header, main, footer, grid)
   5. NAVIGATION
   6. COMPONENTS (cards, buttons, tags, widgets)
   7. PAGE-SPECIFIC STYLES
   8. UTILITIES
   9. MEDIA QUERIES (all together at bottom)
   ============================================ */
```

### 2.4 Font Loading Issues

**Current (render-blocking, old API):**
```html
<link href="https://fonts.googleapis.com/css?family=Encode+Sans:400,700" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Dosis:500" rel="stylesheet">
```

**Issues:**
1. Two separate HTTP requests (should be one)
2. Uses old Google Fonts API v1 (missing `font-display`)
3. Render-blocking — page waits for fonts before painting
4. No fallback font metrics specified

**Fix:**
```html
<!-- Single request, v2 API, font-display: swap -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Dosis:wght@500&family=Encode+Sans:wght@400;700&display=swap" rel="stylesheet">
```

Or better yet, self-host the fonts to eliminate the third-party dependency entirely:
```bash
# Download with google-webfonts-helper or fontsource
npm install @fontsource/encode-sans @fontsource/dosis
# Or manually download WOFF2 files and host them
```

---

## 3. Performance

### 3.1 File Size Analysis

| Asset | Size | Notes |
|-------|------|-------|
| `style.css` | 20.5 KB | ~30% unused CSS |
| `index.html` | 13.5 KB | Reasonable |
| `posts/igf2-alzheimers.html` | **681 KB** | ⚠️ Extremely large single page |
| `troy-trees/index.html` | **193 KB** | Large, but it's an app |
| Troy tree images (total) | **12.2 MB** | 112 JPEG files, unoptimized |
| `gallery.html` | 18.9 KB | Mostly inline styles + placeholders |
| Museum trackers | ~18 KB each | Self-contained, fine |

### 3.2 Image Optimization (HIGH IMPACT)

The troy-trees images are the biggest performance concern. Individual images range from 45 KB to 272 KB.

**Current:** Standard JPEG, no srcset, no lazy loading, no WebP
```html
<!-- Current approach in troy-trees -->
<img src="images/Acer_saccharum/leaf.jpg">
```

**Recommended:**
```html
<picture>
    <source srcset="images/Acer_saccharum/leaf.webp" type="image/webp">
    <img src="images/Acer_saccharum/leaf.jpg" 
         alt="Sugar maple leaf showing five-pointed lobes with smooth margins"
         loading="lazy"
         width="400" height="300"
         decoding="async">
</picture>
```

**Quick wins:**
1. Add `loading="lazy"` to all images below the fold
2. Add `width` and `height` attributes to prevent layout shift (CLS)
3. Compress existing JPEGs (can likely save 30-50%):
```bash
# Using ImageMagick
find troy-trees/images -name '*.jpg' -exec mogrify -quality 80 -strip {} \;
```
4. Convert to WebP for ~30% additional savings:
```bash
find troy-trees/images -name '*.jpg' -exec sh -c 'cwebp -q 80 "$1" -o "${1%.jpg}.webp"' _ {} \;
```

### 3.3 The 681 KB IGF2 Page

`posts/igf2-alzheimers.html` is by far the largest HTML file. This is a long-form academic article, which is fine, but:
- Consider adding a Table of Contents that collapses on mobile
- The page already has a TOC structure — ensure it works on mobile
- Consider pagination or lazy-loading sections for very slow connections

### 3.4 Critical CSS / Above-the-Fold

For a static site with one 20 KB stylesheet, this is low priority. However, if you ever optimize:

```html
<!-- Inline critical CSS for first paint -->
<style>
    body { color: #121212; font-family: 'Encode Sans', sans-serif; line-height: 1.5; }
    .site-header { max-width: 800px; margin: 0 auto; }
    .site-navi { display: flex; justify-content: flex-end; align-items: center; padding: 16px 8px; }
    /* ... just enough for header + above-fold content */
</style>
<!-- Load full CSS asynchronously -->
<link rel="preload" href="style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="style.css"></noscript>
```

---

## 4. Responsive Design

### 4.1 Current Breakpoints

```
1600px - TOC sidebar collapse
1300px - Sidenotes collapse, TOC goes inline
1100px - Homepage grid: 3-col → 2-col
760px  - Mobile: single column, nav wraps
768px  - Gallery: masonry effect kicks in (GOING UP, not down)
```

### 4.2 Tablet Gap (768px–1100px)

There's a gap in the homepage layout. At 900px width:
- The 3-column grid still tries to render with `220px + 1fr + 260px`
- The main content column gets squeezed to ~420px
- This is a tight reading width

**Fix:** Add the 2-column transition earlier:
```css
@media (max-width: 1100px) {
    /* Current rules are fine, but consider triggering at 960px instead */
}
```

### 4.3 Pages Without Responsive Grid

These pages use `.main { max-width: 800px }` and work fine on all sizes:
- about.html, contact.html, research.html, writing.html, projects.html, tutoring.html, jimmy.html

But `gallery.html` and `cv.html` set `body { max-width: 650px/1200px }` in inline styles, which overrides `.main`. This creates inconsistent content widths across pages.

### 4.4 Mobile Nav Issues

At narrow widths (< 400px), the nav items may wrap awkwardly due to `white-space: nowrap` on list items and long names like "Research Tutoring". The secondary nav row compounds this.

**Fix:** Consider a hamburger menu for mobile, or at minimum:
```css
@media (max-width: 500px) {
    .site-navi-items li {
        padding-left: 10px;
        font-size: 1rem;
    }
}
```

---

## 5. Accessibility

### 5.1 No Skip Navigation Link (HIGH IMPACT)

Screen reader and keyboard users must tab through the entire nav on every page. This is the #1 accessibility fix needed.

```html
<!-- Add as first child of <body> -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Add id to main content area -->
<main id="main-content" class="main">
```

```css
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #121212;
    color: #fff;
    padding: 8px 16px;
    z-index: 100;
    transition: top 0.2s;
}

.skip-link:focus {
    top: 0;
}
```

### 5.2 Missing Focus Styles (HIGH IMPACT)

The site has no custom `:focus` styles. While browsers provide defaults, they're often invisible on some elements (especially with the pink color scheme).

```css
/* Add visible focus indicators */
a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible {
    outline: 3px solid #121212;
    outline-offset: 2px;
}

/* Remove ugly default outline only when using mouse */
:focus:not(:focus-visible) {
    outline: none;
}
```

### 5.3 Color Contrast Problems

| Element | Foreground | Background | Contrast Ratio | WCAG |
|---------|-----------|------------|----------------|------|
| Nav chevron `>` | #ffd1dc | #ffffff | **1.4:1** | ❌ FAIL (all levels) |
| `.post-meta` text | #9a9a9a | #ffffff | **2.8:1** | ❌ FAIL AA |
| `.tweet-time` | #999999 | #ffffff | **2.8:1** | ❌ FAIL AA |
| `.calendar-times` | #999999 | ~#fef5f7 | **2.7:1** | ❌ FAIL AA |
| `.widget-link` | #666666 | #fafafa | **4.9:1** | ✅ PASS AA |
| Body text | #121212 | #ffffff | **18.1:1** | ✅ PASS AAA |

**Fixes:**
```css
/* Darken muted text to meet WCAG AA (4.5:1 minimum) */
.post-meta,
.tweet-time,
.calendar-times { 
    color: #666666; /* 5.7:1 ratio */
}

/* The pink chevrons are decorative - hide from assistive tech */
.site-navi-items span[style*="color: #ffd1dc"] {
    /* Better: replace inline styles with a class */
}
```

Or better yet, replace the inline-styled chevrons with CSS:
```css
.site-navi-items li::before {
    content: ">";
    color: #ffd1dc;
    margin-right: 4px;
    /* aria-hidden not needed on CSS pseudo-elements */
}
```

### 5.4 Gallery Lightbox Accessibility

The CSS-only lightbox (`:target`-based) has accessibility issues:
- No keyboard trap management (focus can leave the modal)
- No `role="dialog"` or `aria-modal`
- Close button is just an `×` character with no accessible label
- No `Escape` key to close

**Fix:** Replace with a lightweight JS lightbox or add ARIA:
```html
<div id="lightbox1" class="lightbox" role="dialog" aria-modal="true" aria-label="Full-size image view">
    <a href="#" class="lightbox-close" aria-label="Close image">&times;</a>
    <img src="..." alt="Descriptive text">
</div>
```

### 5.5 Missing `lang` Consistency

Most pages use `lang="en"`, but some use `lang="en-us"`. Pick one and be consistent:
- `404.html`: `lang="en-us"`
- `cv.html`: `lang="en-us"`
- `gallery.html`: `lang="en-us"`
- All others: `lang="en"`

### 5.6 Testimonials - No Noscript Fallback

Testimonials are loaded via JS `fetch()`. If JavaScript fails:
```html
<!-- Add fallback -->
<div id="testimonials-container">
    <noscript>
        <div class="testimonial">
            <blockquote><p>"Greg helped me finally understand hypothesis testing..."</p></blockquote>
            <p class="testimonial-meta"><strong>Alex M.</strong><br>Psychology Statistics, Fall 2024</p>
        </div>
    </noscript>
</div>
```

---

## 6. JavaScript

### 6.1 testimonials.js — Good, Minor Issues

The file is clean, async, and handles errors. Minor improvements:

```javascript
// Current - XSS vulnerability via JSON injection
div.innerHTML = `<blockquote><p>"${testimonial.text}"</p></blockquote>`;

// Better - use textContent for user-controlled data
const quote = document.createElement('blockquote');
const p = document.createElement('p');
p.textContent = `"${testimonial.text}"`;
quote.appendChild(p);
div.appendChild(quote);
```

The JSON data is controlled by Greg so the XSS risk is theoretical, but using `textContent` is better practice.

### 6.2 Service Worker (troy-trees/sw.js) — Well Done

The service worker is well-structured with:
- ✅ Proper install/activate/fetch lifecycle
- ✅ Cache-first strategy
- ✅ Graceful fallback on network failure
- ✅ Old cache cleanup

Minor improvement — add cache versioning awareness:
```javascript
// Consider cache-busting with query parameters
const CACHE_VERSION = 'v2'; // Bump this when images change
const CACHE_NAME = `troy-trees-${CACHE_VERSION}`;
```

### 6.3 Museum Tracker Apps — Self-Contained

Both `albany-museums/index.html` and `nyc-museums/index.html` are single-file apps with inline CSS, JS, and JSON fetching. They use:
- CSS custom properties ✅
- Dark mode toggle ✅
- System font stack ✅
- Responsive design ✅

These are actually **better architected** than the main site. They could serve as a model for the main site's CSS variables and dark mode implementation.

---

## 7. GitHub Pages Optimization

### 7.1 Current Status

| Feature | Present | Notes |
|---------|---------|-------|
| 404.html | ✅ | Works but has different design from rest of site |
| CNAME | ✅ | `greg-fitzgerald.com` |
| sitemap.xml | ✅ | But has domain inconsistencies |
| robots.txt | ✅ | Points to wrong domain |
| rss.xml | ✅ | Only one item, stale |
| .nojekyll | ❌ | Should add to prevent Jekyll processing |
| favicon.svg | ✅ | Clean SVG |

### 7.2 Domain Inconsistency (BUG)

Three different domains are used across configuration files:

| File | Domain Used |
|------|-------------|
| `CNAME` | `greg-fitzgerald.com` |
| `robots.txt` | `gregfitzgerald.github.io` |
| `sitemap.xml` | `greg-fitzgerald.com` |
| `rss.xml` | Mixed (`greg-fitzgerald.com` in channel, `gregfitzgerald.github.io` in template comments) |
| HTML OG tags | Mixed (some `greg-fitzgerald.com`, some `gregfitzgerald.github.io`) |

**Fix:** Use `greg-fitzgerald.com` consistently everywhere:
```
# robots.txt - FIX
Sitemap: https://greg-fitzgerald.com/sitemap.xml
```

### 7.3 RSS Feed is Stale

The RSS feed has only one item ("Welcome to My Blog") and doesn't include the IGF2 article, which is the site's main content. `lastBuildDate` is November 2025.

**Fix:** Update `rss.xml` to include all published posts:
```xml
<item>
    <title>Insulin-like growth factor-2 is a promising candidate for the treatment and prevention of Alzheimer's disease</title>
    <link>https://greg-fitzgerald.com/posts/igf2-alzheimers.html</link>
    <description>A comprehensive review of IGF2 as a neurotrophic therapeutic agent for Alzheimer's disease.</description>
    <pubDate>Wed, 15 Jan 2025 00:00:00 +0000</pubDate>
    <guid isPermaLink="true">https://greg-fitzgerald.com/posts/igf2-alzheimers.html</guid>
</item>
```

### 7.4 Missing .nojekyll

GitHub Pages tries to process sites with Jekyll by default. Adding a `.nojekyll` file tells it to serve raw files, which avoids potential issues with underscored directories like `_template.html`.

```bash
touch .nojekyll
```

### 7.5 Sitemap Missing Pages

The sitemap doesn't include:
- `posts/welcome.html`
- `posts/claude-code-researchers.html` (commented out)
- `posts/ai-resistant-learning.html` (commented out)
- `posts/meta-analysis-methodology.html` (commented out)
- `posts/research-literacy-overview.html` (commented out)
- `albany-museums/index.html`
- `nyc-museums/index.html`
- `troy-trees/index.html`

These sub-apps may be intentionally unlisted, but `welcome.html` should be in the sitemap if it's published.

---

## 8. Browser Compatibility

### 8.1 Modern CSS Features Used

| Feature | Browser Support | Risk |
|---------|----------------|------|
| CSS Grid | 95%+ | ✅ Safe |
| `display: flex` | 97%+ | ✅ Safe |
| `height: fit-content` | 94% | ⚠️ Low risk (used on sidebar) |
| `gap` in Flexbox | 92% | ⚠️ Low risk |
| `:focus-visible` | 93% | ⚠️ Low risk (if added) |
| `prefers-color-scheme` | 93% | ✅ Progressive enhancement |
| CSS `object-fit` | 96% | ✅ Safe |
| `position: sticky` | 95% | ✅ Safe |

### 8.2 Vendor Prefixes

Some `-webkit-` prefixes are present but inconsistently applied:
```css
/* Has prefix */
-webkit-flex-grow: 1;
-webkit-flex-wrap: wrap;
-webkit-justify-content: flex-start;

/* Missing prefix for same property elsewhere */
display: flex; /* No -webkit-flex */
```

**Fix:** These `-webkit-` prefixes are no longer needed for any browser with > 1% usage. Remove them to reduce CSS size:
```css
/* Remove these (safe since ~2018) */
/* -webkit-flex-grow: 1; */
flex-grow: 1;
```

### 8.3 IE11 Considerations

The site will not work in IE11 due to CSS Grid, CSS Custom Properties, and modern flexbox. This is **fine** — IE11 is end-of-life. No action needed.

---

## 9. Security

### 9.1 External Links Missing `rel` Attributes

Links to external sites should include `rel="noopener noreferrer"` for security and performance:

```html
<!-- Current -->
<a href="https://www.albany.edu/psychology/faculty/ewan-mcnay">Behavioral Neuroscience Lab</a>

<!-- Better -->
<a href="https://www.albany.edu/psychology/faculty/ewan-mcnay" 
   rel="noopener noreferrer">Behavioral Neuroscience Lab</a>
```

GitHub Pages doesn't support custom headers, so these can't be set server-side. But you can add a meta tag for basic CSP:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src https://fonts.gstatic.com;
               img-src 'self' data:;">
```

### 9.2 Placeholder URLs Should Be Removed

Contact page has live links to:
- `https://orcid.org/0000-0000-0000-0000`
- `https://scholar.google.com/citations?user=YOUR_ID`
- `https://www.researchgate.net/profile/Your-Name`
- `https://twitter.com/your_handle`

These are discoverable by search engines and look unprofessional. Remove until real profiles exist.

### 9.3 Email Addresses Exposed

Email addresses (`gfitz@albany.edu`, `greg.s.fitzgerald@gmail.com`) are in plain HTML. This enables scraping by spam bots.

**Low-tech obfuscation (good enough for a personal site):**
```html
<a href="mailto:gfitz [at] albany.edu" 
   onclick="this.href=this.href.replace(' [at] ','@')">
   gfitz [at] albany.edu
</a>
```

Or use a simple contact form via Formspree/Netlify Forms instead.

---

## 10. Build Process — The Case for a Static Site Generator

### 10.1 The Core Problem

Maintaining 16+ HTML files with copy-pasted headers, footers, and meta tags is unsustainable. Every navigation change, every new page, every footer update requires editing every file.

### 10.2 Recommended: 11ty (Eleventy)

For this site specifically, **Eleventy (11ty)** is the best fit because:

1. **Zero config** — works with existing HTML files
2. **No framework lock-in** — outputs plain HTML
3. **Templating** — Nunjucks/Liquid for shared headers/footers
4. **Markdown support** — write blog posts in Markdown
5. **GitHub Pages compatible** — just deploy the `_site` folder
6. **Tiny learning curve** — most similar to current raw HTML approach

**Migration path:**

```
gregfitzgerald.github.io/
├── _includes/
│   ├── header.njk        ← shared nav (ONE file)
│   └── footer.njk        ← shared footer (ONE file)
├── _layouts/
│   ├── base.njk          ← base HTML template
│   ├── page.njk          ← standard page layout
│   └── post.njk          ← blog post layout
├── posts/
│   ├── igf2-alzheimers.md  ← Markdown content
│   └── welcome.md
├── index.njk
├── about.njk
├── style.css
├── .eleventy.js          ← minimal config
└── _site/                ← generated output (gitignored)
```

**Example base template (`_layouts/base.njk`):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }} | Greg Fitzgerald</title>
    <meta name="description" content="{{ description }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Dosis:wght@500&family=Encode+Sans:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/style.css">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    {% include "header.njk" %}
    <main id="main-content" class="main">
        {{ content | safe }}
    </main>
    {% include "footer.njk" %}
</body>
</html>
```

**Example page (`about.njk`):**
```yaml
---
layout: page.njk
title: About
description: About Greg Fitzgerald - Behavioral neuroscientist and research methodologist
---

I'm a graduate student in the [Behavioral Neuroscience Lab](https://www.albany.edu/psychology/faculty/ewan-mcnay)...
```

### 10.3 Why Not Jekyll?

Jekyll is GitHub Pages' native SSG, but:
- Ruby dependency is heavy
- Slower builds
- Less flexible templating
- 11ty is lighter, faster, and more aligned with this site's philosophy

### 10.4 If SSG Is Too Much

If Greg wants to stay with raw HTML, at minimum implement:

1. A **shell script** that injects a shared `_includes/header.html` into all pages
2. A **Makefile** that validates HTML and checks for broken links
3. A **pre-commit hook** that ensures header consistency

```makefile
# Makefile
.PHONY: build validate

build:
    @./scripts/inject-headers.sh
    @echo "Headers injected into all HTML files"

validate:
    @npx html-validate "*.html" "posts/*.html"
    @echo "HTML validation passed"

check-links:
    @npx broken-link-checker https://greg-fitzgerald.com --recursive
```

---

## Priority Roadmap

### 🏃 Quick Wins (< 1 hour each)

1. **Add `.nojekyll` file** — `touch .nojekyll` (1 minute)
2. **Fix robots.txt domain** — Change `gregfitzgerald.github.io` to `greg-fitzgerald.com` (1 minute)
3. **Remove placeholder URLs** from contact.html (5 minutes)
4. **Update Google Fonts** to v2 API with `display=swap` and `preconnect` (10 minutes)
5. **Add `loading="lazy"`** to troy-trees images (15 minutes)
6. **Add skip-to-content link** on all pages (20 minutes)
7. **Add `.nojekyll`** and fix OG tag domain inconsistencies (30 minutes)
8. **Update RSS feed** with actual published posts (15 minutes)
9. **Remove `igf2-alzheimers.html`** from root (dead/empty page) (1 minute)

### 🔧 Medium Effort (1–4 hours each)

10. **Add CSS custom properties** and replace hardcoded colors (2 hours)
11. **Remove dead CSS** (~200 lines of unused styles) (1 hour)
12. **Fix color contrast** on muted text and decorative elements (1 hour)
13. **Add focus-visible styles** site-wide (1 hour)
14. **Unify page structure** — remove inline `<style>` blocks from cv.html, gallery.html, 404.html (3 hours)
15. **Compress troy-trees images** — JPEG optimization + WebP generation (2 hours)
16. **Fix heading hierarchy** — site title should be h1 only on homepage (2 hours)
17. **Replace inline styles** with CSS classes throughout all HTML (2 hours)

### 🏗️ Larger Refactors (1–2 days each)

18. **Migrate to Eleventy** (or similar SSG) — eliminates duplication, enables Markdown blogging, auto-generates sitemap and RSS (2 days)
19. **Implement dark mode** site-wide (the museum apps already have it) (1 day)
20. **Redesign navigation** for mobile — hamburger menu or simplified layout (1 day)
21. **Add proper lightbox** to gallery with keyboard support and ARIA (4 hours)
22. **Self-host fonts** to eliminate Google Fonts dependency (2 hours)

---

## Appendix: File-by-File Issues

| File | Key Issues |
|------|-----------|
| `index.html` | Homepage 3-column grid is good; placeholder widgets should be removed or replaced; missing `<main>` landmark |
| `about.html` | Missing meta description, OG tags, favicon; uses `.container` wrapper (only page that does) |
| `contact.html` | Placeholder profile URLs live on production; missing meta tags |
| `cv.html` | Entirely different design system (monospace, inline styles); full of placeholder content |
| `research.html` | Missing meta description, OG tags; solid content |
| `projects.html` | `YOUR_GITHUB_USERNAME` in live links; good structure otherwise |
| `writing.html` | Clean structure; could benefit from auto-generation from post frontmatter |
| `tutoring.html` | Good structure; JS testimonials need noscript fallback |
| `gallery.html` | Different design system; all placeholder images; lightbox accessibility issues |
| `jimmy.html` | Placeholder content page — either fill or remove from nav/sitemap |
| `404.html` | Different design system; doesn't use site nav; no link to shared CSS |
| `igf2-alzheimers.html` (root) | **Empty page** — should be deleted (content is at `posts/igf2-alzheimers.html`) |
| `posts/igf2-alzheimers.html` | 681 KB; good structure but enormous |
| `posts/welcome.html` | Different design system; not in sitemap |
| `posts/_template.html` | Good template, but reinforces manual duplication problem |
| `troy-trees/index.html` | Well-built PWA; images need optimization |
| `albany-museums/index.html` | Clean self-contained app; great CSS variable usage |
| `nyc-museums/index.html` | Nearly identical to albany-museums (could share code) |
| `style.css` | ~30% dead code; no variables; mixed concerns; needs reorganization |
| `js/testimonials.js` | Clean; minor XSS hygiene improvement |
| `robots.txt` | Wrong domain |
| `sitemap.xml` | Missing several published pages |
| `rss.xml` | Stale — missing main article |
| `favicon.svg` | Clean, minimal |
| `CNAME` | Correct |

---

*This audit focuses on technical improvements. Content quality and design direction are separate concerns.*
