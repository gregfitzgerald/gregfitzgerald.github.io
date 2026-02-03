# Website TODOs - greg-fitzgerald.com

## Recent Updates (2026-02-04)

**Completed by Sophie (Subagent - Ralph Wiggum Cycles):**
- ✅ Created `jimmy.html` stub (was broken link from about.html)
- ✅ Fixed GitHub placeholder URLs in `projects.html` (now clearly marked)
- ✅ Fixed academic profile placeholder URLs in `contact.html` (now clearly marked)
- ✅ Fixed navigation consistency in `cv.html` and `gallery.html` (now match site-wide nav)
- ✅ Fixed RSS feed URLs (changed from gregfitzgerald.github.io to greg-fitzgerald.com)
- ✅ Created 4 blog post stubs in `posts/`:
  - `claude-code-researchers.html`
  - `research-literacy-overview.html`
  - `meta-analysis-methodology.html`
  - `ai-resistant-learning.html`
- ✅ Created `CONTENT-NEEDED.md` documenting all content Greg needs to supply
- ✅ Updated `sitemap.xml` with new pages

**See `CONTENT-NEEDED.md` for comprehensive list of content Greg needs to provide.**

---

## Critical (Blocks Site Launch)

- [ ] **Configure DNS on Cloudflare** - Add CNAME records pointing to gregfitzgerald.github.io
  - Record 1: @ → gregfitzgerald.github.io (DNS only, gray cloud)
  - Record 2: www → gregfitzgerald.github.io (DNS only, gray cloud)
  - Reference: GITHUB-PAGES-DEPLOYMENT-GUIDE.md

- [ ] **Enable HTTPS** - After DNS propagates, enable "Enforce HTTPS" in GitHub Pages settings

## High Priority (Enhance Functionality)

- [ ] **Add Calendly URL** - Replace placeholder in tutoring.html (line 108)
  - Current: `https://calendly.com/YOURLINK/tutoring`
  - Action: Get Calendly account, replace YOURLINK with actual username

- [ ] **Add GitHub Username** - Replace placeholders in projects.html
  - Line 99: `https://github.com/username/meta-analysis-enrichment`
  - Line 164: `https://github.com/username/research-literacy-guide`
  - Action: Determine GitHub username, replace "username" with actual username

- [ ] **Replace Placeholder Testimonials** - Update data/testimonials.json with real student feedback
  - Current: 3 placeholder testimonials
  - Action: Collect real testimonials and update JSON file

## Content Creation (Medium Priority)

These blog posts would strengthen the portfolio:

- [ ] **Claude Code Guide for Researchers** - Write comprehensive guide
  - Demonstrates AI tool proficiency (key differentiator)
  - Target audience: Researchers, data scientists, biotech companies
  - Estimated time: 2-3 hours
  - Use posts/_template.html as starting point

- [ ] **Scientific Research Literacy Guide (Blog Version)** - Adapt existing 50+ page guide
  - Shows curriculum development and teaching ability
  - High-level overview with link to full guide
  - Estimated time: 3-4 hours

- [ ] **Meta-Analysis Methodology Post** - Write about thesis work
  - Explain 2.5x larger effect sizes in rodents vs humans finding
  - Demonstrates quantitative skills and systems thinking
  - Target audience: Translational researchers, CROs, pharma
  - Estimated time: 4-5 hours

- [ ] **Educational Software Project Post** - Document AI-resistant learning platform
  - Shows software development skills
  - Target audience: EdTech companies, data science roles
  - Estimated time: 2-3 hours

## GitHub Repositories (Medium Priority)

Create these repos and link from website:

- [ ] **meta-analysis-enrichment** - Thesis work (R code, data, documentation)
- [ ] **research-literacy-guide** - 50+ page curriculum as open-source resource
- [ ] **learning-platform** - AI-resistant educational software code
- [ ] **lab-inventory-manager** - If project exists, create repo

Each repo should include:
- Comprehensive README.md
- LICENSE file (choose appropriate open-source license)
- Link back to blog post on website
- Clear documentation

## Optional Enhancements (Low Priority)

- [ ] **Interactive Blog Post: Effect Size Calculator** - JavaScript-based meta-analysis tool
- [ ] **Interactive Blog Post: Power Analysis Tool** - For experimental design
- [ ] **Interactive Blog Post: Statistical Test Selector** - Decision tree interface
- [ ] **Dark Mode Toggle** - Mentioned in requirements but not critical
- [ ] **Blog Search Functionality** - Filter/search posts
- [ ] **RSS Feed** - For blog subscribers
- [ ] **Google Analytics** - Track visitor stats (if desired)
- [ ] **Professional Headshot** - Add to About page

## Content Enhancement Ideas

Based on Master Career Chronology, consider enriching:

### About Page
- Emphasize 15 years research experience
- Highlight Cell publication (2017, Impact Factor 64.5)
- Detail CSHL lab manager experience (500+ mouse colony, budgets)
- Mention industry exposure through Certerra
- Emphasize 7 semesters teaching statistics

### Projects Page
- Add more detail about Exerkine Performance startup (2021)
- Expand meta-analysis finding explanation
- Discuss translational validity implications for drug development

### Homepage
- Add quick stats: "15 years research | Published in Cell | 7 semesters teaching"
- Brief mention of AI/Claude Code proficiency
- Consider adding professional headshot

## Quick Reference

### Files You Can Edit Directly
- `data/testimonials.json` - Add/modify testimonials
- `posts/_template.html` - Copy to create new blog posts
- `writing.html` - Add new post previews
- `sitemap.xml` - Update when adding new pages

### Helper Scripts
- `preview-website.bat` - Double-click to preview locally
- `deploy-website.bat` - Double-click to commit and deploy

### Reference Docs
- `LOCAL-DEVELOPMENT-WORKFLOW.md` - Complete local editing guide
- `GITHUB-PAGES-DEPLOYMENT-GUIDE.md` - DNS and deployment instructions
- `HOSTING-ALTERNATIVES-FOR-DYNAMIC-FEATURES.md` - Future migration options

## Workflow for Adding New Blog Post

1. Copy `posts/_template.html` to `posts/new-post-slug.html`
2. Edit new file: update title, meta tags, datetime, content
3. Add post preview to `writing.html` (copy existing post-preview block)
4. If one of 3 most recent, update `index.html` homepage
5. Update `sitemap.xml` with new post URL
6. Commit and push using `deploy-website.bat`

## Notes

- Site is ready for launch - only DNS configuration blocks going live
- All core functionality implemented and tested locally
- Content creation can happen at your own pace while site is live
- Interactive features (Phase 3) are nice-to-have enhancements

---

Generated: January 21, 2026
