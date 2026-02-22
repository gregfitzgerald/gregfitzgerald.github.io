# Beats Import Scripts

Scripts to import activity from various sources into the beats system.

## Quick Start

```bash
# Import from all sources
node scripts/import-all.mjs

# Quick mode (skip slow importers like Twitter)
node scripts/import-all.mjs --quick

# Import from specific sources
node scripts/import-zotero.mjs
node scripts/import-github.mjs
node scripts/import-twitter.mjs
node scripts/import-til.mjs
```

## Sources

### Zotero (Papers)
- Imports recently added papers from your Zotero library
- Requires: Zotero API key at `C:\Users\gregs\Drive\programming_GF776417\claude-code-companion\zotero api key.txt`
- Displays: Paper title, authors, year, DOI link

### GitHub (Code)
- Imports public GitHub activity (pushes, repo creations, releases)
- No authentication required for public repos
- Displays: Activity type, repo name, link

### Twitter (Thoughts)
- Imports your recent tweets (excluding replies and retweets)
- Requires: `SOCIALDATA_API_KEY` in `~/clawd-assistant/apify-skills/.env`
- Note: Costs $0.20 per 1000 tweets via SocialData.tools

### TILs (Today I Learned)
- Imports entries from `data/tils.md`
- Format:
  ```markdown
  ---
  ## YYYY-MM-DD: Title
  
  Content here (optional, becomes description)
  
  Tags: tag1, tag2
  ---
  ```

## Output

All scripts write to `data/beats.json`. The website's `js/beats.js` reads this file and renders beats on:
- Homepage (Recent Activity section)
- Activity page (`/activity.html`)

## Automation

To keep beats fresh, run the import periodically:

```bash
# Add to crontab (daily at 6am)
0 6 * * * cd /mnt/c/Users/gregs/gregfitzgerald.github.io && node scripts/import-all.mjs --quick
```

Or integrate into your deployment workflow.
