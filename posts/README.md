# Blog Posts

This directory contains individual blog posts for the site.

## Creating a New Post

1. Copy `_template.html` to create a new post file
2. Name the file using lowercase with hyphens: `post-title.html`
3. Update the following in your new post:
   - `<title>` tag
   - Meta description
   - OpenGraph tags (og:title, og:description, og:url)
   - Twitter card tags
   - Main heading (`<h1>`)
   - Date in `<time>` tag (both datetime attribute and display text)
   - Post content

4. Add the post to `../writing.html` in the post list (in reverse chronological order)
5. Add the post to `../sitemap.xml`
6. Update `../rss.xml` with the new post

## File Naming Convention

Use descriptive, URL-friendly filenames:
- Good: `meta-analysis-basics.html`
- Good: `welcome.html`
- Bad: `Post 1.html`
- Bad: `my_post.html`

## Post Structure

Each post should include:
- Back link to writing page
- Article heading (h1)
- Publication date
- Main content with appropriate headings (h2, h3)
- Proper semantic HTML

## Example Posts

- `welcome.html` -- Example introductory post
- `_template.html` -- Blank template for new posts
