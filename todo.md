# Togstrek — project todo

## Foundation

- [ ] Finalise URL rules (optional `division` segment; canonical slugs vs legacy typos).
- [ ] Add `tokens.ts` (or similar) if you want TypeScript references alongside CSS tokens.
- [ ] Document `npm` scripts for dev, build, lint, and (later) Pagefind post-build.

## Content & migration

### Squarespace HTTrack backup (`TogsTrekBackup/togstrek.com`)

- [x] **Inventory script** — `npm run inventory:squarespace` runs `scripts/squarespace-inventory.ts` and writes:
  - `migration/migration-inventory.jsonl` — one JSON record per `.html` (classification, segments, `og:*`, `fullUrl` from Squarespace context).
  - `migration/path-mapping.template.csv` — same rows + empty `final_*` columns for manual slug decisions.
- [ ] **Review counts** (from latest inventory run): ~**316** `continent_place_candidate` vs **875** tag / **99** category pages — tag/category are indexes, not place MDX.
- [ ] **Lock slug rules** — edit `path-mapping.template.csv`: fill `final_continent_slug`, `final_country_slug`, `final_place_slug` for **UK** and any **multi-segment** paths (e.g. collapse `england/greater-london` vs single `london`). Add `notes` for edge cases.
- [ ] **After slugs are locked** — build HTML → MDX extractor; bulk image download from live Squarespace URLs (backup has few binaries).
- [ ] **Restructure images for CDN tree** — copy `migration/image-placement.template.csv` → `migration/image-placement.csv`, fill `filename` + `continent_slug` + `country_slug` + `place_slug` (filenames unchanged). Run `npm run media:restructure -- --source <folder-with-images> --manifest migration/image-placement.csv --out migration/cdn-upload-ready`. Use `npm run media:restructure -- --source TogsTrekBackup --discover` to list images under a tree; add `source_hint` when duplicate basenames exist.

### Legacy / general

- [x] **WXR → MDX** — `npm run import:wxr -- --input <export.xml> --out <dir>` runs `scripts/wxr-to-mdx.ts` (posts, pages, `attachments/manifest.json` + `urls.txt`, `_thumbnail_id` → frontmatter `thumbnail`). Fixture: `migration/fixtures/wxr/minimal-export.xml`.
- [ ] Download all images from Squarespace URLs; rewrite `src` to CDN paths under `{continent}/{country}/{place}/` (see `src/config/togstrek-media.ts`).
- [ ] Strip Squarespace HTML; map galleries to shared MDX layout wrappers (`togstrek-place-mdx-*`).
- [ ] Generate `redirects` map for any URL that cannot stay identical.
- [ ] Add content directory layout: `content/places/{continent}/{country}/{place}.mdx` (done for Tulum); adventure hubs under `content/adventures/` when ready.

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
