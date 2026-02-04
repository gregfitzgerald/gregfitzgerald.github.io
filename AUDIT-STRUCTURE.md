# Website Structure & Information Architecture Audit

**Site:** greg-fitzgerald.com (gregfitzgerald.github.io)  
**Auditor:** Automated professional review  
**Date:** 2026-02-04  
**Context:** Neuroscience PhD researcher transitioning to industry. Site must serve dual purpose: academic credibility + industry job search.

---

## Executive Summary

The site has a solid foundation — clean HTML, no framework bloat, good typography choices — but it's operating at roughly **30% of its potential**. The majority of pages contain placeholder content, the CV is entirely empty brackets, and several critical sections for a researcher's professional identity are missing altogether. The navigation is overcrowded with 9 links split across two tiers when most content doesn't yet exist. For someone transitioning to industry, the site currently communicates "work in progress" rather than "accomplished researcher ready for the next challenge."

**Top 3 urgent fixes:**
1. Fill the CV page — it's the single most-visited page by recruiters and hiring managers
2. Remove or hide all placeholder/stub content — visible `[PLACEHOLDER]` text and `YOUR_GITHUB_USERNAME` links destroy credibility instantly
3. Add a dedicated "Skills & Experience" or industry-facing landing section

---

## 1. Missing Sections

### 🔴 Critical — Must Have for Industry Transition

| Section | Status | Impact |
|---------|--------|--------|
| **Publications list** | Exists on research.html but only "manuscripts in preparation" — no published work listed | Recruiters and hiring managers check this first |
| **Downloadable CV/Resume (PDF)** | Commented-out link in cv.html, no actual PDF | Industry expects a downloadable resume |
| **Skills & Technical Proficiencies** | Skeleton in cv.html with `[Add relevant methods]` placeholders | Critical for ATS and recruiter scanning |
| **LinkedIn link** | Completely absent from the entire site | #1 professional networking platform for industry transition |
| **GitHub profile link** | Uses `YOUR_GITHUB_USERNAME` placeholder | Code portfolio is essential for data-adjacent roles |

### 🟡 Important — Strengthens Professional Profile

| Section | Status | Impact |
|---------|--------|--------|
| **Teaching/Mentoring experience** | Tutoring page exists but no formal teaching history | Shows leadership, communication skills |
| **Awards & Honors** | Skeleton in cv.html with `[Award Name]` placeholder | Social proof of excellence |
| **Professional development** | Absent | Shows growth mindset, continuous learning |
| **Industry-relevant project descriptions** | Projects described in academic language only | Need to frame for industry audience |
| **Headshot/Professional photo** | Completely absent | Personal connection, professionalism signal |

### 🟢 Nice to Have — Differentiators

| Section | Status | Impact |
|---------|--------|--------|
| **Talks/Presentations** | Listed on research.html but may be placeholder content | Conference presence = community engagement |
| **Datasets / Open Data** | Absent | Shows open science commitment |
| **Lab/Group page** | Absent (but links to advisor's lab) | Shows collaborative context |
| **News/Announcements** | Twitter widget exists as placeholder only | Timeliness signal |
| **Media mentions** | Absent | Social proof |
| **Volunteer/Service** | Absent | Shows well-rounded character |

---

## 2. Navigation Structure Analysis

### Current Structure

The site uses a **two-tier navigation** pattern:

**Primary row:** Home | Blog | Projects | Research Tutoring | About  
**Secondary row (smaller font):** Research | Contact | Gallery | CV

### Problems Identified

#### P1: Too many top-level items for a personal site
**9 navigation items** is excessive when most lack content. Industry best practice for personal sites is 4-6 items. The two-tier approach makes Research and CV feel like afterthoughts, but they're arguably the two most important pages.

#### P2: Research vs. Projects vs. Blog — confusing overlap
- **Research page** describes the same meta-analysis project that **Projects page** describes
- **Blog** has one real post that's essentially a research paper (IGF2), which also appears on the Research page
- A visitor landing on any of these three pages gets partial, overlapping information

#### P3: CV is buried in secondary navigation
For someone job-searching, the CV should be **primary navigation, position 2 or 3**. Currently it's in a smaller-font secondary row — the exact opposite of what a hiring manager needs.

#### P4: "Research Tutoring" occupies prime nav real estate
Tutoring is a side activity. It shouldn't be in the primary nav alongside core professional identity pages, especially during an industry job search.

#### P5: Gallery has no content and shouldn't be in navigation
The gallery is entirely placeholder images with instructions on how to add real ones. Having it in the nav actively harms credibility.

#### P6: Inconsistent navigation across page types
- **Main pages** (index, about, writing, projects, tutoring, contact, research): Full two-tier nav with styled arrows
- **Old-style pages** (404, igf2-alzheimers.html root-level, welcome.html): Minimal inline nav with different link set
- **Museum/tree pages**: No site navigation at all (standalone apps)

### Recommended Navigation Restructure

**Primary navigation (5 items):**
```
Home | Research | CV | Projects | Blog
```

**Footer links (secondary):**
```
About | Contact | Tutoring | Gallery
```

**Rationale:**
- Research and CV move to primary position for recruiter/hiring manager audiences
- Blog stays primary because thought leadership content is valuable for industry positioning
- About and Contact move to footer (standard web convention — visitors know to look there)
- Tutoring becomes a subpage or footer link since it's a side activity
- Gallery stays hidden until it has real content

---

## 3. Content Gaps — Page-by-Page Assessment

### 📄 index.html (Homepage)
**Content quality:** ⭐⭐⭐ (3/5)
- ✅ Good intro paragraph explaining research focus
- ✅ Featured projects section
- ❌ **Three sidebar widgets are ALL placeholders** (Calendly, Twitter, Goodreads) — these render as fake mockup content and look terrible
- ❌ Left sidebar nav duplicates header nav — wasted space
- ❌ "Recent Writing" shows only 1 post from January 2025 — looks stale
- ❌ No headshot, no professional photo
- ❌ No clear call-to-action for recruiters ("I'm seeking opportunities in...")
- ❌ Still says "graduate student" — needs updating if transitioning

**Recommendation:** Remove all three placeholder sidebar widgets immediately. They make the site look like a template demo. Replace with a simple, clean single-column layout until real widgets are ready. Add a brief "seeking opportunities" statement.

### 📄 about.html (About)
**Content quality:** ⭐⭐⭐ (3/5)
- ✅ Solid research interests list
- ✅ Good philosophy section
- ❌ Missing `<meta name="description">` tag
- ❌ Missing Open Graph tags
- ❌ Missing `<link rel="icon">` favicon
- ❌ Background section is generic — no specific institutions, years, or achievements
- ❌ "Outside Research" section is thin (hiking, reading, turtle)
- ❌ No professional photo

**Recommendation:** Add specific credentials. This page should establish authority quickly: "PhD candidate at University at Albany (20XX-present), researching under Dr. Ewan McNay..."

### 📄 cv.html (Curriculum Vitae)
**Content quality:** ⭐ (1/5) — CRITICAL
- ❌ **ENTIRELY PLACEHOLDER** — Every single section contains `[Degree Name]`, `[Year - Year]`, `[Institution Name]`, etc.
- ❌ Has its own inline CSS that conflicts with the site stylesheet (dual styling)
- ❌ PDF download link is commented out
- ❌ No downloadable resume option

**Recommendation:** This is the #1 priority fix. A CV page full of bracket placeholders is worse than having no CV page at all. Fill it in or take it offline until content is ready.

### 📄 research.html (Research)
**Content quality:** ⭐⭐⭐ (3/5)
- ✅ Good project descriptions
- ✅ Publications section with manuscripts in preparation
- ✅ Conference presentations listed
- ⚠️ Conference presentations may be placeholder/fictional (verify: were these actually presented?)
- ❌ Missing meta description tag
- ❌ Missing Open Graph tags
- ❌ Missing favicon link
- ❌ "Collaborations" section lists institutions but no named collaborators — feels generic
- ❌ "Funding" section — verify if these are real awards

**Recommendation:** Consolidate with the CV publications/presentations sections. Currently the same info exists (or should exist) in two places with no cross-linking.

### 📄 projects.html (Projects)
**Content quality:** ⭐⭐⭐ (3/5)
- ✅ Good project descriptions with status indicators
- ✅ Nice structure (type, status, timeline metadata)
- ❌ **Two links use `YOUR_GITHUB_USERNAME`** — these are live, clickable broken links pointing to `https://github.com/YOUR_GITHUB_USERNAME/...`
- ❌ "Exerkine Performance" startup concept has no links, no evidence, no details — reads as fantasy rather than work product
- ❌ "Lab Inventory Management Tool" — no demo, no screenshots, no repo link
- ❌ "AI-Resistant Learning Platform" — status "Concept" with no implementation evidence

**Recommendation:** Fix the GitHub username links immediately. For projects without demos or repos, either add concrete artifacts or reframe as "Research Interests" rather than "Projects."

### 📄 writing.html (Blog)
**Content quality:** ⭐⭐ (2/5)
- ✅ Clean layout
- ❌ Only **1 published post** listed (IGF2 paper from Jan 2025)
- ❌ 4 additional blog post stubs exist in `/posts/` but are NOT listed on this page (they're all `[CONTENT NEEDED]` stubs)
- ❌ The welcome.html post exists but isn't listed here either

**Recommendation:** Either publish more content or reduce the prominence of the blog. A blog with one post from over a year ago signals abandonment.

### 📄 contact.html (Contact)
**Content quality:** ⭐⭐ (2/5)
- ✅ Email addresses provided (real, working)
- ✅ Good collaboration interests section
- ❌ Missing meta description, OG tags, favicon
- ❌ **All 4 academic profile links are placeholder URLs:**
  - ORCID: `https://orcid.org/0000-0000-0000-0000`
  - Google Scholar: `https://scholar.google.com/citations?user=YOUR_ID`
  - ResearchGate: `https://www.researchgate.net/profile/Your-Name`
  - Twitter: `https://twitter.com/your_handle`
- ❌ No LinkedIn (the most important link for industry transition)
- ❌ No GitHub profile link
- ❌ Manuscript review offer section is generous but may set unrealistic expectations

**Recommendation:** Remove all placeholder academic profile links immediately — they currently link to wrong/nonexistent profiles. Add LinkedIn and GitHub. Only add ORCID/Google Scholar/ResearchGate when real profiles exist.

### 📄 tutoring.html (Tutoring)
**Content quality:** ⭐⭐⭐ (3/5)
- ✅ Clear service description
- ✅ Topic list is comprehensive
- ✅ Pricing listed
- ⚠️ Testimonials loaded via JS from JSON — may be fabricated (all 5-star, generic names)
- ❌ Calendly booking integration is placeholder
- ❌ No payment method mentioned

**Recommendation:** Verify testimonials are real. If not, remove them — fake testimonials are an ethical issue and credibility risk.

### 📄 gallery.html (Gallery)
**Content quality:** ⭐ (1/5)
- ❌ **100% placeholder** — 6 template examples with instructions on how to add images
- ❌ Has its own inline CSS that partially conflicts with site stylesheet
- ❌ Description says "A collection of beautiful images" — generic

**Recommendation:** Remove from navigation entirely until real content exists. Leaving a "how to add images" instruction page in your live navigation is unprofessional.

### 📄 jimmy.html (Jimmy the Turtle)
**Content quality:** ⭐ (1/5)
- ❌ Only contains a `[CONTENT NEEDED]` placeholder box
- ❌ Linked from about.html as if it has content

**Recommendation:** Either add content quickly (it's a fun, humanizing page that takes 10 minutes to write) or remove the link from about.html until ready.

### 📄 igf2-alzheimers.html (Root level)
**Content quality:** ⭐ (1/5)
- ❌ **Completely empty `<main>` tag** — the page renders with header and footer but zero content
- ❌ Uses old-style inline navigation (different from rest of site)
- ❌ Appears to be a deprecated duplicate of `posts/igf2-alzheimers.html`

**Recommendation:** Either redirect to `posts/igf2-alzheimers.html` or delete this file. An empty page indexed by search engines hurts SEO.

### 📄 posts/igf2-alzheimers.html (IGF2 Paper)
**Content quality:** ⭐⭐⭐⭐⭐ (5/5) — Best page on the site
- ✅ Substantial academic content (~50KB)
- ✅ Table of contents
- ✅ Proper academic structure
- ❌ "5 random top posts" sidebar links all point to `#` (dead links) except jimmy.html
- ❌ No meta description or OG tags in the `<head>`

### 📄 posts/welcome.html
**Content quality:** ⭐⭐ (2/5)
- ✅ Clean, functional
- ❌ Uses old-style inline nav (inconsistent with rest of site)
- ❌ Not listed on writing.html
- ❌ Content is thin — "this is an example blog post"
- ❌ Not included in RSS feed properly

### 📄 posts/ (4 Draft Stubs)
- `claude-code-researchers.html` — `[CONTENT NEEDED]` placeholder only
- `ai-resistant-learning.html` — `[CONTENT NEEDED]` placeholder only
- `meta-analysis-methodology.html` — `[CONTENT NEEDED]` placeholder only
- `research-literacy-overview.html` — `[CONTENT NEEDED]` placeholder only

**Recommendation:** These are deployed to production but have no content. They're indexed by search engines. Either add `<meta name="robots" content="noindex">` to prevent indexing, or don't deploy until content is written.

### 📄 Standalone Apps (Museum Trackers, Troy Trees)
- `albany-museums/index.html` — Standalone app, no site branding
- `nyc-museums/index.html` — Standalone app, no site branding
- `troy-trees/index.html` — Standalone app, links back to main site via stylesheet

**Observation:** These are interesting portfolio pieces but are completely invisible from the main site. They're not listed on the Projects page, not in the sitemap, and not in the navigation. They demonstrate real technical skills (JavaScript, JSON data handling, responsive design, PWA) that would be valuable for an industry job search.

**Recommendation:** Add these to the Projects page with descriptions. They're the best evidence of practical software development skills on the entire site.

---

## 4. SEO and Metadata Analysis

### Domain Configuration Issue
- **CNAME:** `greg-fitzgerald.com`
- **Sitemap:** References `https://greg-fitzgerald.com/` (correct)
- **Robots.txt:** References `https://gregfitzgerald.github.io/sitemap.xml` (WRONG — should be `greg-fitzgerald.com`)
- **RSS feed:** Mix of `greg-fitzgerald.com` and `gregfitzgerald.github.io` URLs in template comments
- **OG URLs on some pages:** `https://gregfitzgerald.github.io/` (inconsistent with CNAME)

### Page-by-Page Metadata Status

| Page | Title | Description | OG Tags | Favicon | Twitter Card |
|------|-------|-------------|---------|---------|-------------|
| index.html | ✅ | ✅ | ✅ (partial — no og:image) | ✅ | ❌ |
| about.html | ✅ | ❌ | ❌ | ❌ | ❌ |
| cv.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| research.html | ✅ | ❌ | ❌ | ❌ | ❌ |
| projects.html | ✅ | ✅ | ✅ (no og:image) | ❌ | ❌ |
| writing.html | ✅ | ✅ | ✅ (no og:image) | ❌ | ❌ |
| tutoring.html | ✅ | ✅ | ✅ (no og:image) | ❌ | ❌ |
| contact.html | ✅ | ❌ | ❌ | ❌ | ❌ |
| gallery.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| jimmy.html | ✅ | ✅ | ❌ | ✅ | ❌ |
| 404.html | ✅ | ✅ | ✅ (partial) | ✅ | ✅ |
| igf2-alzheimers.html (root) | ✅ | ✅ | ✅ | ✅ | ✅ |
| posts/igf2-alzheimers.html | ✅ | ❌ | ❌ | ❌ | ❌ |
| posts/welcome.html | ✅ | ✅ | ✅ | ❌ | ✅ |
| posts/claude-code-researchers.html | ✅ | ✅ | ✅ | ✅ | ❌ |
| posts/ai-resistant-learning.html | ✅ | ✅ | ✅ | ✅ | ❌ |
| posts/meta-analysis-methodology.html | ✅ | ✅ | ✅ | ✅ | ❌ |
| posts/research-literacy-overview.html | ✅ | ✅ | ✅ | ✅ | ❌ |

### Key SEO Issues

1. **No `og:image` on any page** — When shared on social media, no preview image appears. Need at minimum a default site-wide OG image.
2. **No canonical URLs** — With both `greg-fitzgerald.com` and `gregfitzgerald.github.io` resolving, search engines may split ranking between domains. Add `<link rel="canonical" href="https://greg-fitzgerald.com/...">` to every page.
3. **No structured data (JSON-LD)** — Adding `Person`, `WebSite`, and `ScholarlyArticle` schema would significantly improve search appearance.
4. **RSS feed is stale** — Only contains the welcome post, not the IGF2 article.
5. **Sitemap excludes live pages** — Museum trackers and troy-trees are not in the sitemap.
6. **Page titles inconsistent** — Some use `|` separator, others use `-`, some have site name first, others last.

---

## 5. Broken Links & References

### 🔴 Confirmed Broken/Placeholder Links

| Location | Link | Issue |
|----------|------|-------|
| projects.html | `https://github.com/YOUR_GITHUB_USERNAME/meta-analysis-enrichment` | Placeholder username |
| projects.html | `https://github.com/YOUR_GITHUB_USERNAME/research-literacy-guide` | Placeholder username |
| contact.html | `https://orcid.org/0000-0000-0000-0000` | Placeholder ORCID (resolves but wrong person) |
| contact.html | `https://scholar.google.com/citations?user=YOUR_ID` | Placeholder Google Scholar |
| contact.html | `https://www.researchgate.net/profile/Your-Name` | Placeholder ResearchGate |
| contact.html | `https://twitter.com/your_handle` | Placeholder Twitter |
| index.html | `#` (Twitter follow link) | Dead link |
| index.html | `#` (Goodreads profile link) | Dead link |
| posts/igf2-alzheimers.html | 4 links to `#` in "5 random top posts" sidebar | Dead links to nonexistent posts |
| igf2-alzheimers.html (root) | N/A | Entire page is empty (no content in `<main>`) |

### ⚠️ Potentially Problematic Links

| Location | Link | Concern |
|----------|------|---------|
| research.html | Link to `igf2-alzheimers.html` (root) | Points to the EMPTY root-level version, not the content-filled `posts/igf2-alzheimers.html` |
| about.html | `https://www.albany.edu/psychology/faculty/ewan-mcnay` | External link — should verify still works |
| research.html | Conference presentations | May be fabricated placeholder content — verify |
| research.html | Funding section | May be fabricated — verify |
| about.html | CC-BY 4.0 license link uses `http://` not `https://` | Minor but should update |

### 🟡 Inconsistency Issues

| Issue | Details |
|-------|---------|
| Duplicate IGF2 page | `igf2-alzheimers.html` (root, empty) AND `posts/igf2-alzheimers.html` (full content) |
| Footer inconsistency | Some pages: "© 2025 Greg Fitzgerald. All rights reserved." Others: "Licensed under Creative Commons Attribution 4.0" — contradictory |
| Copyright year | All pages say 2025, should be 2025-2026 or dynamically set |
| `<div class="container">` | Some pages wrap content in `.container`, others don't — CSS conflicts |
| Blog posts not listed | 4 draft stubs + welcome.html exist but aren't on writing.html |

---

## 6. Prioritized Action Plan

### Phase 1: Emergency Fixes (Do This Week) ⏰

1. **Fill CV page with real content** — This is the single highest-impact change. Every recruiter checks this.
2. **Remove or fix ALL placeholder links** — The `YOUR_GITHUB_USERNAME` and `0000-0000-0000-0000` links must go today.
3. **Remove the three fake sidebar widgets from homepage** — Calendly mockup, fake tweets, and Goodreads placeholder make the site look like a template demo.
4. **Delete or redirect `igf2-alzheimers.html` (root)** — Empty page that search engines can find.
5. **Remove gallery.html from navigation** — Link to it from About page once it has content.
6. **Fix robots.txt** — Change sitemap URL from `gregfitzgerald.github.io` to `greg-fitzgerald.com`.
7. **Add `<meta name="robots" content="noindex">` to all 4 draft post stubs** — Prevent Google from indexing empty pages.

### Phase 2: Content Foundation (Do This Month) 📝

8. **Write a professional summary / "seeking opportunities" statement** for the homepage — Frame the transition positively.
9. **Add LinkedIn and GitHub profile links** to contact page and homepage.
10. **Create a proper "Skills" section** somewhere prominent — R, Python, meta-analysis, statistical modeling, literature review, scientific writing, data visualization. Frame for industry.
11. **Add the museum trackers and tree guide to Projects page** — These demonstrate real engineering skills.
12. **Fill in Jimmy page** — Takes 10 minutes, humanizes the site, shows personality.
13. **Add professional headshot** to About page and/or homepage.
14. **Standardize navigation** across all pages — Pick one nav style and use it everywhere, including blog posts and 404 page.

### Phase 3: Content Development (Next 1-2 Months) ✍️

15. **Write the meta-analysis methodology blog post** — This is the highest-value post for industry positioning. The "2.5x effect size gap" finding is genuinely interesting and demonstrates analytical thinking.
16. **Write the Claude Code for researchers post** — Shows tech-forward thinking, AI literacy.
17. **Add canonical URLs** to every page.
18. **Create an OG image** (even a simple branded card) and add to all pages.
19. **Add JSON-LD structured data** — `Person` schema on homepage, `ScholarlyArticle` on IGF2 post.
20. **Update RSS feed** to include the IGF2 article and any new posts.

### Phase 4: Polish & Optimization (Ongoing) ✨

21. **Consolidate Research and Projects pages** — Consider merging into a single "Work" page with sections.
22. **Create a proper 404 page** that uses the site's main stylesheet and navigation.
23. **Standardize footer** — Pick either "All rights reserved" or "CC-BY 4.0" and use consistently.
24. **Add a PDF resume download** — Industry standard; don't make people read HTML.
25. **Consider adding a "Hire Me" or "Working With Me" page** explicitly framing skills for industry.

---

## 7. Industry Transition-Specific Recommendations

The site is currently positioned 100% as an academic site. For someone transitioning to industry, consider these additions:

### A. Reframe Language
- Change "graduate student" → "neuroscientist" or "researcher" throughout
- Add industry-relevant keywords: "data analysis," "experimental design," "evidence synthesis," "quantitative methods," "cross-functional collaboration"
- Describe projects in terms of outcomes and business value, not just academic contribution

### B. Add an Industry-Relevant Skills Section
Visible on homepage or a dedicated page:
- **Data Analysis:** R, Python, SPSS, meta-analytic modeling
- **Research Methods:** Experimental design, systematic review, literature synthesis
- **Statistics:** Effect size estimation, power analysis, regression, ANOVA, publication bias assessment
- **Communication:** Scientific writing, conference presentations, curriculum development, tutoring
- **Tools:** Git/GitHub, web development (HTML/CSS/JS), data visualization

### C. Portfolio Pieces That Matter to Industry
The museum trackers and tree guide are actually stronger portfolio pieces for industry than the academic work. They demonstrate:
- Full-stack web development
- JSON data handling
- Responsive design
- User-facing product thinking
- PWA architecture (troy-trees)

Feature these prominently.

### D. Consider a "Transitioning" Blog Post
A thoughtful post about why you're moving from academia to industry would:
- Control the narrative
- Show self-awareness
- Demonstrate communication skills
- Signal to recruiters that you're seriously committed to the transition

---

## Appendix: Complete File Inventory

```
Root level pages:
├── index.html          [Homepage - 3-column layout, placeholder widgets]
├── about.html          [About - needs metadata, photo]
├── cv.html             [CV - ENTIRELY PLACEHOLDER]
├── research.html       [Research - solid but overlaps with projects]
├── projects.html       [Projects - broken GitHub links]
├── writing.html        [Blog index - only 1 post listed]
├── tutoring.html       [Tutoring - functional but booking is placeholder]
├── contact.html        [Contact - all profile links are placeholder]
├── gallery.html        [Gallery - 100% placeholder content]
├── jimmy.html          [Turtle page - content needed stub]
├── igf2-alzheimers.html [EMPTY DUPLICATE - should delete]
├── 404.html            [Error page - uses different nav style]
├── style.css           [Main stylesheet]
├── favicon.svg         [Site icon]
├── sitemap.xml         [Missing several live pages]
├── rss.xml             [Stale - missing IGF2 post]
├── robots.txt          [Wrong sitemap URL]
└── CNAME               [greg-fitzgerald.com]

Blog posts:
├── posts/igf2-alzheimers.html       [COMPLETE - excellent content]
├── posts/welcome.html               [Thin - example post]
├── posts/claude-code-researchers.html [STUB - no content]
├── posts/ai-resistant-learning.html   [STUB - no content]
├── posts/meta-analysis-methodology.html [STUB - no content]
├── posts/research-literacy-overview.html [STUB - no content]
└── posts/_template.html              [Template file - should not be deployed]

Standalone apps (NOT linked from main site):
├── albany-museums/index.html  [Museum exhibit tracker - Capital Region]
├── albany-museums/exhibits.json
├── nyc-museums/index.html     [Museum exhibit tracker - NYC]
├── nyc-museums/exhibits.json
├── troy-trees/index.html      [Tree identification PWA]
├── troy-trees/manifest.json
└── troy-trees/sw.js

Data:
├── data/testimonials.json  [3 testimonials - possibly fabricated]
└── js/testimonials.js      [Loader script]
```

---

*This audit identifies 25+ specific, actionable improvements. The most impactful single change is filling the CV page — everything else is secondary to that.*
