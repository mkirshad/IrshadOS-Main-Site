# IrshadOS Main Site

SEO-first, ultra-fast portfolio + directory site for **IrshadOS**, built with **Astro + TypeScript + Tailwind**.

## Features

- Pages: `/`, `/apps`, `/apps/[slug]`, `/ebooks`, `/ebooks/[slug]`, `/about`, `/contact`, `/privacy`, `/terms`
- Content collections (Markdown/MDX): apps, ebooks, pages, blog
- Optional runtime API fetch with local fallback:
  - `GET https://api.irshados.com/public/apps`
  - `GET https://api.irshados.com/public/ebooks`
- SEO essentials: canonical URLs, OpenGraph/Twitter cards, JSON-LD, `robots.txt`, `sitemap.xml`, custom `404`

## Local Development

```bash
npm install
npm run dev
```

Astro dev server runs at `http://localhost:4321`.

## Build

```bash
npm run build
npm run preview
```

## Content

### Apps

Add new apps as Markdown in `src/content/apps/*.md`.

Frontmatter fields:

- `name` (string)
- `short_description` (string)
- `long_description` (string, optional)
- `tags` (string[])
- `status` (`live` | `coming-soon`)
- `url` (string URL, optional)
- `repo_url` (string URL, optional)
- `icon` (string path, optional; e.g. `/assets/services/freedom.jpg`)

### Ebooks

Add new ebooks as Markdown in `src/content/ebooks/*.md`.

Frontmatter fields:

- `title` (string)
- `author` (string)
- `description` (string)
- `category` (string, optional)
- `tags` (string[])
- `language` (string, e.g. `en`)
- `cover_image` (string path, optional; e.g. `/assets/banners/banner-2.jpg`)
- `download_url` (string path/URL, optional; e.g. `/assets/ebooks/my-ebook/book.pdf`)
- `status` (`free` | `coming-soon`)

### Pages

Page copy lives in `src/content/pages/*.md` and is rendered by:

- `src/pages/about.astro`
- `src/pages/contact.astro`
- `src/pages/privacy.astro`
- `src/pages/terms.astro`

## API Fallback Behavior

Pages under `/apps` and `/ebooks` are server-rendered (SSR on Cloudflare) so they can:

1. Try `IRSHADOS_API_BASE_URL` (defaults to `https://api.irshados.com`)
2. Fall back to local content collections if the API is unavailable

## Cloudflare Pages Deployment

This project uses `@astrojs/cloudflare` (Pages Functions) and `output: "hybrid"`.

**Build settings**

- Build command: `npm run build`
- Build output directory: `dist`

**Environment variables**

- `SITE_URL` (recommended; used for canonical URLs + sitemap/robots)
- `IRSHADOS_API_BASE_URL` (optional)

## Assets

Design/placeholder images from `Docs/` are copied into `public/assets/`:

- `public/assets/banners/`
- `public/assets/services/`
