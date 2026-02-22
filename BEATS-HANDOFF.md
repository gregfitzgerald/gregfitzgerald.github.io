# Beats System Handoff

**Created:** 2026-02-21  
**Inspired by:** [Simon Willison's beats feature](https://simonwillison.net/2026/Feb/20/beats/)

## What We Built

A "beats" system that pulls activity from multiple sources and displays them as inline badges on the website. Shows what Greg is reading, coding, thinking, and learning -- without requiring manual updates.

## Architecture

```
data/beats.json          ← All beat data (source of truth)
data/tils.md             ← Manual TIL entries (parsed by importer)
js/beats.js              ← Client-side renderer
style.css                ← Beat badge styling (appended)
activity.html            ← Full activity timeline page
index.html               ← Homepage with beats section + sidebar widget

scripts/
  beats-utils.mjs        ← Shared utilities
  import-zotero.mjs      ← Papers from Zotero library
  import-github.mjs      ← Public GitHub activity
  import-twitter.mjs     ← Tweets via SocialData API
  import-til.mjs         ← TILs from data/tils.md
  import-all.mjs         ← Master script (runs all)
  README.md              ← Usage docs
```

## Beat Types

| Type | Icon | Source | Color |
|------|------|--------|-------|
| paper | 📄 | Zotero | Blue |
| code | 💻 | GitHub | Green |
| thought | 💭 | Twitter | Orange |
| til | 💡 | Manual | Pink |

## How It Works

1. **Import scripts** fetch from APIs → write to `data/beats.json`
2. **beats.js** reads JSON on page load → renders beats inline
3. **Commit & push** to deploy updates

The site is static HTML on GitHub Pages. No build step. Beats are fetched client-side from the JSON file.

## Usage

### Refresh all beats
```bash
cd /mnt/c/Users/gregs/gregfitzgerald.github.io
node scripts/import-all.mjs
git add data/beats.json && git commit -m "Update beats" && git push
```

### Quick mode (skip Twitter to save API costs)
```bash
node scripts/import-all.mjs --quick
```

### Add a TIL manually
Edit `data/tils.md`:
```markdown
---
## 2026-02-22: Learned about beats

Simon Willison's blog has this cool feature where activity from other places shows up inline.

Tags: web, inspiration
---
```
Then run `node scripts/import-til.mjs`.

## API Dependencies

| Source | API | Auth |
|--------|-----|------|
| Zotero | Zotero Web API v3 | API key in `C:\Users\gregs\Drive\programming_GF776417\claude-code-companion\zotero api key.txt` |
| GitHub | GitHub Events API | None (public activity) |
| Twitter | SocialData.tools | `SOCIALDATA_API_KEY` in `~/clawd-assistant/apify-skills/.env` ($0.20/1000 tweets) |
| TILs | Local file | None |

## Where Beats Appear

1. **Homepage** (`index.html`)
   - "Recent Activity" section in main content (5 beats)
   - Sidebar widget (3 beats, compact style)

2. **Activity page** (`activity.html`)
   - Full timeline with filter buttons
   - Shows up to 50 beats

## Rendering API

The `js/beats.js` exposes a global `Beats` object:

```javascript
// Render beats into a container
Beats.render('container-id', {
  limit: 10,           // Max beats to show
  types: ['paper'],    // Filter by type (null = all)
  showEmpty: true      // Show message if no beats
});

// Auto-init: add data-beats attribute to any element
<div id="my-beats" data-beats data-beats-limit="5"></div>
```

## Styling

Beats use CSS custom properties from the site's design system. Each type has its own color scheme defined in `style.css` under the "BEATS" section.

## Future Ideas

- [ ] GitHub Action to auto-refresh beats daily
- [ ] Add Goodreads as a beat source (currently a separate widget)
- [ ] Interleave beats with blog posts on writing.html
- [ ] Add "research" beat type for papers Greg is working on (not just reading)

## Files Changed

**New:**
- `activity.html`
- `data/beats.json`
- `data/tils.md`
- `js/beats.js`
- `scripts/*`

**Modified:**
- `index.html` - Added beats sections
- `style.css` - Added beats CSS
- `sitemap.xml` - Added activity.html
- `CLAUDE.md` - Updated TODOs
