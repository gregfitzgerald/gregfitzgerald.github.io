# Content Needed for greg-fitzgerald.com

This document lists ALL content that needs to be provided or created for the website to be fully complete.

Generated: 2026-02-04

---

## 🔴 HIGH PRIORITY (Blocks Professional Appearance)

### 1. GitHub Username
**Location:** `projects.html` (2 places)
**Current:** `YOUR_GITHUB_USERNAME` placeholder
**Action:** Replace with your actual GitHub username

Files to update:
- `projects.html` line ~99: `https://github.com/YOUR_GITHUB_USERNAME/meta-analysis-enrichment`
- `projects.html` line ~164: `https://github.com/YOUR_GITHUB_USERNAME/research-literacy-guide`

### 2. Academic Profile URLs
**Location:** `contact.html`
**Current:** Placeholder URLs
**Action:** Create accounts (if not existing) and update with real profile URLs

Required profiles:
- [ ] **ORCID:** Get your ORCID iD from https://orcid.org/register
- [ ] **Google Scholar:** Set up profile at https://scholar.google.com/citations
- [ ] **ResearchGate:** Create profile at https://www.researchgate.net/
- [ ] **Twitter/X:** Decide if you want to include this (optional)

### 3. Calendly URL
**Location:** `tutoring.html` AND `index.html` (homepage widget)
**Current:** `YOURLINK` / `YOUR_CALENDLY_URL` placeholders
**Action:** 
1. Create Calendly account at https://calendly.com
2. Set up a "tutoring" event type
3. Uncomment the Calendly widget in tutoring.html
4. Replace `YOURLINK` with your Calendly username
5. **NEW:** Also update homepage widget in `index.html` (sidebar-right section)

### 3b. Twitter/X Profile
**Location:** `index.html` (homepage widget), `contact.html`
**Current:** `YOUR_TWITTER_HANDLE` placeholder
**Action:**
1. Decide if you want a professional Twitter/X account
2. If yes, create account and update:
   - Homepage widget embed code in `index.html`
   - Profile link in `contact.html`
3. If no, consider removing the Twitter widget from homepage

### 3c. Goodreads Profile
**Location:** `index.html` (homepage widget)
**Current:** Placeholder preview widget
**Action:**
1. Get Goodreads widget code from https://www.goodreads.com/widgets
2. Select "Currently Reading" widget
3. Replace placeholder in `index.html` with actual widget code
4. Update profile link

### 4. CV Content
**Location:** `cv.html`
**Current:** All placeholder text with [brackets]
**Action:** Fill in your actual CV information

Sections needing content:
- [ ] Education (degree, institution, years, thesis title)
- [ ] Research Experience (positions, dates, responsibilities)
- [ ] Publications (full citations)
- [ ] Presentations (conference talks/posters)
- [ ] Skills (expand technical skills list)
- [ ] Awards and Honors
- [ ] Professional Memberships

---

## 🟡 MEDIUM PRIORITY (Enhances Site Quality)

### 5. Real Testimonials
**Location:** `data/testimonials.json`
**Current:** 3 placeholder testimonials
**Action:** Collect real student feedback and replace

Each testimonial needs:
```json
{
  "name": "First name + Last initial",
  "course": "Course they took",
  "semester": "When you tutored them",
  "text": "Their actual feedback",
  "rating": 5
}
```

### 6. Jimmy the Turtle Page
**Location:** `jimmy.html` (newly created stub)
**Action:** Fill in content about your pet turtle

Needed:
- [ ] Information about Jimmy (species, age, how long you've had him)
- [ ] Photos of Jimmy
- [ ] Any fun facts or personality traits

### 7. Gallery Images
**Location:** `gallery.html`
**Current:** Placeholder template images
**Action:** Add actual images you find beautiful

For each image:
- [ ] The image file (place in `images/` folder -- create if needed)
- [ ] Proper attribution (artist, source, license)
- [ ] Your description of why you find it beautiful

---

## 🟢 BLOG POST STUBS (Write When Ready)

Four blog post stubs have been created. Each needs full content written.

### 8. Claude Code Guide for Researchers
**Location:** `posts/claude-code-researchers.html`
**Estimated time:** 2-3 hours
**Topics to cover:**
- Introduction to Claude Code for academic/research use
- Setting up for research workflows
- Data analysis applications (R, Python)
- Literature review assistance
- Writing scientific manuscripts
- Best practices and limitations

### 9. Scientific Research Literacy Overview
**Location:** `posts/research-literacy-overview.html`
**Estimated time:** 3-4 hours
**Topics to cover:**
- Why research literacy matters
- Overview of the 50+ page curriculum
- Research design fundamentals
- Critical evaluation of papers
- Publication bias and reproducibility

### 10. Meta-Analysis Methodology Post
**Location:** `posts/meta-analysis-methodology.html`
**Estimated time:** 4-5 hours
**Topics to cover:**
- Your meta-analysis on environmental enrichment
- The 2.5x effect size finding (rodent vs human)
- Implications for translational research
- Methodological challenges
- Implications for drug development

### 11. AI-Resistant Learning Post
**Location:** `posts/ai-resistant-learning.html`
**Estimated time:** 2-3 hours
**Topics to cover:**
- The problem with traditional assessment
- Process-oriented design philosophy
- Platform features and implementation
- Pedagogical rationale

---

## 📂 GitHub Repositories to Create

These repos should be created and linked from the website:

### 12. meta-analysis-enrichment
**Link from:** `projects.html`
**Contents needed:**
- [ ] R code from your meta-analysis
- [ ] Data files (or synthetic/anonymized data)
- [ ] Comprehensive README.md
- [ ] LICENSE file
- [ ] Documentation

### 13. research-literacy-guide
**Link from:** `projects.html`
**Contents needed:**
- [ ] The 50+ page curriculum (PDF or source files)
- [ ] README.md explaining the guide
- [ ] LICENSE file (CC-BY recommended for educational content)

---

## 🖼️ Images/Assets Needed

### 14. Professional Headshot
**Suggested location:** About page, homepage
**Requirements:**
- [ ] High-quality photo
- [ ] Professional appearance
- [ ] Good for academic/professional context

### 15. Images Folder
**Location:** Create `images/` folder in website root
**Use for:**
- Profile photo
- Gallery images
- Any blog post images

---

## ✅ COMPLETED (No Action Needed)

The following items are working correctly:
- ✅ Main navigation across all pages (now consistent)
- ✅ RSS feed URLs (updated to greg-fitzgerald.com)
- ✅ Jimmy.html page exists (was broken link)
- ✅ Blog post stubs created
- ✅ Placeholder markers clearly visible

---

## Quick Reference: File Locations

| Content Type | File |
|--------------|------|
| GitHub URLs | `projects.html` |
| Academic profiles | `contact.html` |
| Calendly | `tutoring.html` |
| CV details | `cv.html` |
| Testimonials | `data/testimonials.json` |
| Jimmy content | `jimmy.html` |
| Gallery | `gallery.html` |
| Blog posts | `posts/*.html` |
| Sitemap | `sitemap.xml` |

---

## After Adding Content

When you add a new blog post:
1. Copy stub content to new file (or fill in existing stub)
2. Add post preview to `writing.html`
3. Update `sitemap.xml` with new URL
4. Update `rss.xml` with new item
5. If one of 3 most recent, update `index.html` homepage
