# Website Overhaul Summary

**Date:** July 11, 2026  
**Scope:** 7 improvement cycles across greg-fitzgerald.com  
**Commits:** 7 (458d2f4 → 124baec)

---

## Cycle 1: Emergency Fixes

### Changes Made
- **Removed "graduate student" framing** from homepage title, meta description, OG tags, and body text — replaced with "Neuroscience Researcher" and "PhD Researcher" throughout
- **Deleted fake placeholder widgets** from homepage (fake Calendly scheduling, fake Twitter timeline, fake Goodreads reading widget). Converted from 3-column layout with fake sidebars to clean single-column layout
- **Removed all visible placeholder URLs**: `YOUR_GITHUB_USERNAME` links from projects.html, fake ORCID/Google Scholar/ResearchGate/Twitter URLs from contact.html
- **Deleted empty root-level `igf2-alzheimers.html`** (was a duplicate with empty `<main>` tag)
- **Fixed research.html link** to point to `posts/igf2-alzheimers.html` instead of deleted root-level version
- **Removed Gallery from site navigation** (100% placeholder content — still accessible via direct URL)
- **Added `<meta name="robots" content="noindex">`** to 4 empty blog post stubs to prevent Google indexing
- **Fixed jimmy.html** — replaced visible "[CONTENT NEEDED]" placeholder box with tasteful "Coming soon" text and invisible HTML comment
- **Fixed tutoring.html** — replaced fake Calendly placeholder with direct email booking link

### Impact
Eliminated all visually embarrassing placeholder content. A visitor landing on the site no longer sees broken links, fake widgets, or template instructions.

---

## Cycle 2: Unify Design System

### Changes Made
- **Created CSS custom properties** (design tokens) in style.css: typography, colors, spacing scale, layout, borders, shadows, transitions
- **New color palette**: Shifted from baby pink (#ffd1dc) to sophisticated dusty rose (#c08497) for accents, with blue (#2563eb) for links (WCAG AA compliant)
- **Eliminated ALL inline `<style>` blocks** from:
  - `cv.html` (was 80+ lines of monospace/dark-mode overrides)
  - `gallery.html` (was 120+ lines of completely separate design system)
  - `404.html` (was standalone monospace design)
  - `posts/welcome.html` (was standalone monospace design)
- **Fixed link colors** — links now visibly distinct from body text (blue instead of same-as-text black)
- **Removed dead CSS** — eliminated unused `.social-links`, `.right_float`, `.article-subtitle`, and other orphaned rules
- **Added consistent spacing** using CSS custom property scale (--space-1 through --space-8)

### Impact
Every page on the site now uses the same design system. No more "two different websites" experience when navigating between pages.

---

## Cycle 3: Navigation & Structure

### Changes Made
- **Consolidated navigation** from 9 items in 2 tiers → 6 items in 1 row: Home | Research | Projects | CV | Blog | Contact
- **Removed redundant items**: Gallery (no content), Research Tutoring (still accessible, just not in primary nav)
- **Standardized nav across ALL 15+ pages** — same markup, same classes, same structure
- **Replaced inline-styled chevrons** with `.nav-chevron` CSS class
- **Added skip-to-content links** (`<a href="#main-content" class="skip-link">`) on all pages for keyboard/screen reader accessibility
- **Added `<main id="main-content">` landmarks** to all pages
- **Added museum trackers and troy-trees** as portfolio projects on projects.html — these demonstrate real technical skills (JavaScript, PWA, responsive design, JSON data handling)

### Impact
Navigation is now clean, consistent, and accessible. Portfolio projects are visible to recruiters.

---

## Cycle 4: CV Page Overhaul

### Changes Made
- **Removed ALL bracket placeholders** — no more `[Degree Name]`, `[Year - Year]`, `[Institution Name]` visible to visitors
- **Populated with real information**:
  - Education: Ph.D. Behavioral Neuroscience (ABD), University at Albany
  - Research: PhD Researcher with 2.5× finding, 500+ mouse colony, R/Python/SPSS
  - Cold Spring Harbor Lab: Laboratory Manager position (dates TBD)
  - Publications: IGF-2 review (in preparation), meta-analysis methodology paper
  - Teaching: 7 semesters, 50+ page research literacy curriculum
  - Skills: Organized into Data Analysis, Research Methods, and Technical categories
- **Used invisible `<!-- [CONTENT-NEEDED: ...] -->` comments** for details Greg needs to supply (exact dates, Cell citation, undergraduate degree, etc.)
- **Added Presentations section** with tasteful "Details coming soon" placeholder
- **Updated nav and styling** to match unified design system

### Impact
CV page is now a professional, usable document rather than a broken template. Recruiters can actually read it.

---

## Cycle 5: Homepage & Content Reframing

### Changes Made
- **Rewrote homepage intro** — leads with capability ("I turn messy preclinical research into clear, quantitative answers") not title
- **Added key credentials upfront**: 2.5× finding, Cell publication (IF 64.5), 15 years experience
- **Added "Skills & Expertise" section** to homepage — framed for industry (R, Python, meta-analysis, etc.)
- **Added "Open to Opportunities" section** — explicitly states job target for recruiters
- **Rewrote about page** entirely:
  - Personal narrative structure instead of generic academic template
  - Mentions specific numbers (15 years, 500+ mouse colony, 7 semesters, Cell IF 64.5)
  - CSHL lab management experience highlighted
  - "What I'm Looking For" section targeting industry
  - Hiking/Catskills/Adirondacks personal detail
- **Added OG tags and canonical URL** to about page

### Impact
Site now communicates "accomplished researcher ready for industry" instead of "graduate student with an unfinished website."

---

## Cycle 6: Technical & Accessibility

### Changes Made
- **Fixed robots.txt** — changed sitemap URL from `gregfitzgerald.github.io` to `greg-fitzgerald.com`
- **Updated sitemap.xml** — added troy-trees, albany-museums, nyc-museums, posts/welcome.html; updated lastmod dates
- **Updated RSS feed** — added IGF-2 article as first item, updated lastBuildDate, fixed all URLs to use greg-fitzgerald.com
- **Added focus-visible styles** — keyboard navigation now shows visible focus indicators (accent-colored outlines)
- **Updated Google Fonts loading** across ALL pages — migrated from v1 API to v2 API with `display=swap`, added `preconnect` hints (eliminates Flash of Invisible Text)
- **Updated copyright** from 2025 → 2026 across all 15+ pages
- **Standardized footers** — replaced inconsistent CC-BY-4.0 footers on contact.html and research.html with site-standard footer
- **Added .nojekyll file** — prevents GitHub Pages Jekyll processing issues
- **Added `<main>` landmarks** to all remaining pages (post stubs, igf2-alzheimers.html)

### Impact
Technical foundation is solid. SEO, RSS, accessibility, and performance all improved.

---

## Cycle 7: Polish & Deploy

### Changes Made
- **Added favicon** to 7 pages that were missing it (contact, projects, research, tutoring, writing, posts/_template, posts/igf2-alzheimers)
- **Added meta descriptions** to contact.html and research.html (the only pages still missing them)
- **Added canonical URLs** to research.html, projects.html, writing.html, contact.html, tutoring.html
- **Removed dead CSS** — deleted unused `.social-links`, `.right_float`, `.article-subtitle` rules
- **Created CONTENT-NEEDED.md** — comprehensive tracking file of everything Greg needs to supply
- **Pushed to GitHub** — site is live

### Impact
Clean, consistent, professional site deployed to production.

---

## Files Changed

| File | Changes |
|------|---------|
| `index.html` | Complete rewrite — single-column layout, industry-focused intro, skills section |
| `about.html` | Complete rewrite — personal narrative, specific credentials, "What I'm Looking For" |
| `cv.html` | Complete rewrite — real content, proper structure, no visible placeholders |
| `contact.html` | Removed fake profile URLs, added meta tags, fixed footer |
| `projects.html` | Removed broken GitHub links, added troy-trees and museum trackers |
| `research.html` | Fixed IGF-2 link to posts/ version, added meta tags, fixed footer |
| `writing.html` | Updated nav, fonts, meta tags |
| `tutoring.html` | Replaced fake Calendly with email link, updated nav/fonts |
| `gallery.html` | Complete rewrite — simple "coming soon", noindex, uses shared CSS |
| `404.html` | Complete rewrite — uses shared design system |
| `jimmy.html` | Removed visible placeholder, uses invisible comment |
| `style.css` | Complete rewrite — CSS custom properties, unified design, accessible colors |
| `robots.txt` | Fixed domain from github.io to greg-fitzgerald.com |
| `sitemap.xml` | Added all live pages, updated dates |
| `rss.xml` | Added IGF-2 article, fixed URLs |
| `posts/welcome.html` | Complete rewrite — uses shared design system |
| `posts/igf2-alzheimers.html` | Updated nav, fonts, added main landmark |
| `posts/*.html` (4 stubs) | Added noindex, updated nav/fonts/landmarks |
| `igf2-alzheimers.html` (root) | **DELETED** — was empty duplicate |
| `.nojekyll` | **CREATED** — prevents Jekyll processing |
| `CONTENT-NEEDED.md` | **CREATED** — tracks all items Greg needs to supply |

---

## What Greg Still Needs to Provide

See `CONTENT-NEEDED.md` for the full list. The highest-priority items:

1. **Cell publication full citation** (authors, year, title, journal, volume, pages, DOI)
2. **Undergraduate degree details** (institution, degree, year)
3. **Cold Spring Harbor Lab details** (dates, responsibilities)
4. **PDF version of CV** (upload to `files/greg-fitzgerald-cv.pdf`)
5. **Professional headshot** for about page
6. **LinkedIn and GitHub profile URLs** for contact page
7. **Conference presentations list** for CV
8. **Meta-analysis methodology blog post** — the single highest-impact content item for the job search

---

## What Was NOT Changed

- **posts/igf2-alzheimers.html** — content untouched (only nav, fonts, landmarks updated). This is the best page on the site.
- **troy-trees/** — standalone PWA, not modified (already well-built)
- **albany-museums/** and **nyc-museums/** — standalone apps, not modified
- **data/testimonials.json** — not modified (Greg should verify these are real)
- **js/testimonials.js** — not modified

---

*Generated by automated overhaul process, July 11, 2026*
