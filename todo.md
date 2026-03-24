# Togstrek — project todo

## Foundation

- [ ] Finalise URL rules (optional `division` segment; canonical slugs vs legacy typos).
- [ ] Add `tokens.ts` (or similar) if you want TypeScript references alongside CSS tokens.
- [ ] Document `npm` scripts for dev, build, lint, and (later) Pagefind post-build.

## Content & migration

- [ ] Write WXR → Markdown/MDX importer (posts, pages, attachments, thumbnails).
- [ ] Download all images from Squarespace URLs; rewrite `src` to `/media/...` (or R2/S3 when needed).
- [ ] Strip Squarespace HTML; map galleries to a shared `<Gallery>` MDX component.
- [ ] Generate `redirects` map for any URL that cannot stay identical.
- [ ] Add content directory layout: `content/{continent}/{country}/...` and adventure hubs under `content/adventures/`.

## Routing & templates

- [ ] Implement dynamic routes for `/{continent}/{country}/{division?}/{place}` (division optional, one level max).
- [ ] Build templated **city/place** page from frontmatter + MDX body.
- [ ] Build **continent / country / division** hub pages (listing children).
- [ ] Build **adventure** hub pages (framing MDX + links to place URLs).
- [ ] Stub or implement region routes: `/africa`, `/europe`, `/hiking`, `/other-work`, etc.

## Search & SEO

- [ ] Add Pagefind: run after `next build` (or static export if required), ship `pagefind/` assets.
- [ ] Add search UI page (e.g. `/search`) wired to Pagefind.
- [ ] `sitemap.xml`, `robots.txt`, per-page `metadata`, JSON-LD (Article, BreadcrumbList, WebSite).
- [ ] Global RSS (and optional per-region feeds).

## Design & UX

- [ ] **Paused:** Storybook + Figma sync / Code Connect — revisit after `htmltodesign` experiments; prefer atomic components in `src/components/togstrek-ui/` and shared hubs (`togstrek-hub-*`).
- [ ] Replace remote hero image with a hosted asset under `public/media/` when ready.
- [ ] Real imagery or art direction for region grid cards (optional).
- [ ] Review mobile nav (`<details>`) — consider full-screen overlay if needed.
- [ ] Favicon and OG image strategy (static defaults in `app` metadata).

## Deploy

- [ ] Choose Vercel or Netlify; connect repo; set `metadataBase` / env for production URL.
- [ ] Verify image and bandwidth limits; plan CDN or object storage if the repo gets large.

## Nice-to-have later

- [ ] Dark theme toggle (tokens already have `[data-theme="dark"]` hook).
- [ ] Analytics (only if you want traffic data).
