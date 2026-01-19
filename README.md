# gregfitzgerald.github.io

Personal website and blog for Greg Fitzgerald.

## Overview

This is a minimalist static website built with pure HTML and CSS -- no frameworks, no build process, no JavaScript dependencies. The design philosophy emphasizes simplicity, readability, and zero bloat.

## Design Principles

- Hand-coded HTML5 with embedded CSS
- Monospace typography throughout
- Maximum content width: 650px (1200px for gallery)
- Dark mode support via prefers-color-scheme
- Zero dependencies or build tools
- Accessible and semantic markup

## Structure

```
/
├── index.html              # Homepage
├── about.html              # About page
├── contact.html            # Contact page
├── research.html           # Research page
├── writing.html            # Writing and publications
├── gallery.html            # Image gallery with attribution system
├── cv.html                 # CV/Resume
├── igf2-alzheimers.html   # Article: IGF-2 and Alzheimer's
├── posts/                  # Blog posts directory
├── rss.xml                 # RSS feed
├── sitemap.xml             # Site map for search engines
└── robots.txt              # Search engine instructions
```

## Features

### Image Gallery
The gallery page includes a comprehensive attribution system supporting:
- Creative Commons licensed images
- Museum and archive images
- Personal photographs
- Stock images
- Public domain images
- Fair use images

The gallery uses CSS Grid for responsive masonry layout and CSS-only lightbox effects.

### Blog Posts
Blog posts are stored in the `posts/` directory as individual HTML files. Each post follows the same minimal template with consistent navigation and styling.

### RSS Feed
The site includes a hand-coded RSS feed at `/rss.xml` for blog updates.

## Deployment

This site is hosted on GitHub Pages and deploys automatically from the main branch.

To update:
1. Edit HTML files locally
2. Commit changes: `git add . && git commit -m "Description"`
3. Push to GitHub: `git push origin main`
4. Changes appear at https://gregfitzgerald.github.io

## Color Scheme

**Light Mode:**
- Background: #fff
- Text: #333
- Links: #0066cc
- Accent: #f4f4f4

**Dark Mode:**
- Background: #1a1a1a
- Text: #e0e0e0
- Links: #4d9fff
- Accent: #2a2a2a

## Local Development

No build process required. Simply open HTML files in a browser.

For a local server (optional):
```bash
python3 -m http.server 8000
```

Then visit: http://localhost:8000

## License

Content copyright Greg Fitzgerald. All rights reserved.

Website structure and design: MIT License.
