# Togstrek — project todo

## Foundation

- [ ] Finalise URL rules (optional `division` segment; canonical slugs vs legacy typos).
- [ ] Add `tokens.ts` (or similar) if you want TypeScript references alongside CSS tokens.
- [ ] Operational: After CDN paths are stable, run r2:upload / verify NEXT_PUBLIC_MEDIA_BASE_URL on production.
- [ ] Content: Fix vik.mdx / Iceland inline images** that still point at Squarespace in the body (hero was updated; body may still have old URLs).
- [ ] Backup health: Re-copy problematic folders from HTTrack to APFS if exFAT keeps returning unreadable names.

## Content & migration

### Squarespace HTTrack backup (`TogsTrekBackup/togstrek.com`)

- [ ] `migration/migration-inventory.jsonl` — one JSON record per `.html` (classification, segments, `og:*`, `fullUrl` from Squarespace context).
- [ ] `migration/path-mapping.template.csv` — same rows + empty `final_*` columns for manual slug decisions.
- [ ] **Review counts** (from latest inventory run): ~**316** `continent_place_candidate` vs **875** tag / **99** category pages — tag/category are indexes, not place MDX.
- [ ] **Lock slug rules** — edit `path-mapping.template.csv`: fill `final_continent_slug`, `final_country_slug`, `final_place_slug` for **UK** and any **multi-segment** paths (e.g. collapse `england/greater-london` vs single `london`). Add `notes` for edge cases.
- [ ] **After slugs are locked** — any remaining HTML → MDX gaps (most content is already MDX). **Images:** prefer `npm run media:migrate-squarespace-backup -- --backup <TogsTrekBackup>` (staging + rewrite from HTTrack mirror); use live-URL fetch only where backup cannot be read (e.g. exFAT “ghost” files).
- [ ] **Restructure images for CDN tree** — copy `migration/image-placement.template.csv` → `migration/image-placement.csv`, fill `filename` + `continent_slug` + `country_slug` + `place_slug` (filenames unchanged). Run `npm run media:restructure -- --source <folder-with-images> --manifest migration/image-placement.csv --out migration/cdn-upload-ready`. Use `npm run media:restructure -- --source TogsTrekBackup --discover` to list images under a tree; add `source_hint` when duplicate basenames exist.

### Legacy / general

- [ ] **Finish CDN migration** — grep `content/` for remaining `images.squarespace-cdn.com` / `static1.squarespace.com`; re-run backup migration with a readable mirror or fix URLs by hand. (Script: `npm run media:migrate-squarespace-backup` + `TOGSTREK_MEDIA_BACKUP_ROOT` / `--backup`.)
- [ ] Strip Squarespace HTML; map galleries to shared MDX layout wrappers (`togstrek-place-mdx-*`).
- [ ] Generate `redirects` map for any URL that cannot stay identical.
- [ ] Every country on the original site has a quote in its header releating to that country. These are all missing. Write a migraiton script to find them and add them to the new vercel pages.


## Routing & templates

- [X] Inconsistent use of round and sharp edges on image boxes.

## Search & SEO

- [ ] Global RSS (and optional per-region feeds).

## Design & UX

- [ ] **Paused:** Storybook + Figma sync / Code Connect — revisit after `htmltodesign` experiments; prefer atomic components in `src/components/togstrek-ui/` and shared hubs (`togstrek-hub-*`).
- [ ] Replace remote hero image with a hosted asset under `public/media/` when ready.


## Deploy

- [ ] Choose host (Vercel / Netlify / other), connect repo, and set env for production if not using defaults.
- [ ] Verify image and bandwidth limits; plan CDN or object storage if the repo gets large.

## Nice-to-have later

- [x] Dark theme toggle (tokens already have `[data-theme="dark"]` hook).


## Done
- [x] **Document `npm` scripts** — `README.md` (daily + migration tables); full list remains in `package.json`. Pagefind runs in `npm run build` and `npm run pagefind:index`.
- [x] **`TogstrekBodyLink` / prose links** — `focus-visible` ring + `rounded-sm` on `TOGSTREK_BODY_LINK_CLASSNAME` (covers MDX `a` via same token). Footer nav links get matching focus ring.
- [x] **Mega menu semantics (incremental)** — panel `id` + `role="region"`, `aria-hidden` when closed, `aria-controls` on desktop triggers; Escape-to-close already present. Full APG disclosure-with-`button` pattern still optional.
- [x] **Mobile `<summary>` focus** — shared `focus-visible` ring classes aligned with header CTA ring tokens.
- [x] **Contrast spot-check** — procedure documented in `docs/accessibility-spot-check.md` (manual Lighthouse/axe + what to watch for).
- [x] **Tone polish** — About page link text matches footer: **Usage & copyright**.

- [x] **Single `<main>` per page** — root `layout.tsx` wrapper is now `<div id="togstrek-main">` (skip target only); page templates keep one `<main>` each (fixes invalid nested `<main>`).

- [x] **Featured grid** — `TogstrekAdventureFeaturedSection` / `TogstrekAdventureFeaturedPlace` with optional image, intro wrapper `togstrek-adventure-mdx-intro`, wider article max-width on adventure template.
- [x] **Legacy mega-menu thumbnails** — `TOGSTREK_ADVENTURE_LEGACY_THUMB_BY_SLUG` + `resolveAdventureArchiveTileVisuals()` when MDX has no `heroImage`.
- [x] **Normalize script** — `npm run normalize:adventure-mdx` (`scripts/normalize-adventure-mdx-featured-template.ts`); strips duplicate date lines after “Read more” correctly (same-date only).
- [x] **next-mdx-remote RSC** — JSX attrs must be **string literals** (`href="/path"`), not `href={"/path"}` (plugin strips expressions). **`npm run fix:adventure-mdx-attrs`** (`scripts/fix-adventure-mdx-rsc-props.ts`); normalizer emits literals; internal `"` in excerpts use **`&quot;`** (not `\"`) for MDX parse.
- [x] **Rebuilt from live Squarespace HTML** (where the normalizer had truncated lists): `2022-the-roof-of-africa`, `2020-the-end-of-the-world`, `2020-443-kilometres`, `2019-seeing-sweden`.
- [x] **Loader comment** — `src/lib/togstrek-load-adventure-mdx.ts` documents RSC attr rule.
- [x] **`metadataBase` / site origin** — `layout.tsx` uses `getTogstrekSiteOrigin()` (same as sitemap/robots). Override with `NEXT_PUBLIC_SITE_URL`; Vercel preview uses `VERCEL_URL` when unset. See `README.md`.
- [x] **Region / adventure card imagery (partial)** — legacy adventure thumbnails + place heroes where set; broader “art direction for all region grids” still optional.
- [x] **Adventure featured tiles — thumbnails** — `npm run fill:adventure-featured-images` pulls `heroImage` from linked place/hiking MDX into `TogstrekAdventureFeaturedPlace` (most adventures were text-only before).
- [x] **Squarespace → CDN from HTTrack backup (tooling)** — `npm run media:migrate-squarespace-backup` stages under `migration/cdn-upload-ready`, rewrites MDX; use `--backup` / `TOGSTREK_MEDIA_BACKUP_ROOT` when the mirror is on an external volume.
- [x] **Mobile nav keyboard focus** — `focus-visible` rings on `<summary>` controls (full-screen overlay still optional if you want stronger mobile UX).
- [x] **Favicon & default OG** — `layout.tsx` `icons`, `openGraph`, `manifest`; per-page OG on many routes.
- [x] Add Pagefind: run after `next build`, ship `public/pagefind/` (gitignored; CI/production build regenerates).
- [x] Add search UI page (`/search`) wired to Pagefind default UI.
- [x] **`sitemap.xml`, `robots.txt`, metadata, JSON-LD** — `app/sitemap.ts`, `app/robots.ts`, root `metadata` + `viewport` in `layout.tsx`, `TogstrekJsonLd` / per-route `generateMetadata` (Article, BreadcrumbList, WebSite, etc. where applicable).
- [x] **Place & hub routing** — `app/[continent]/page.tsx`, `[continent]/[country]/page.tsx`, `[continent]/[country]/[...place]/page.tsx` (multi-segment paths cover county/region nesting; not a separate `division` param).
- [x] **Templated place page** — frontmatter + MDX via `TogstrekPlacePageTemplate` / `loadTogstrekPlaceMdx`.
- [x] **Continent / country hubs** — listing children (`togstrek-hub-*`, UK nation / England county hubs where applicable).
- [x] **Adventures** — `/adventures` archive + `/adventures/[slug]` story template with featured place cards linking to site routes.
- [x] **Section routes** — `/hiking`, `/hiking/[...slug]`, `/other-work`, `/photography`, `/about`, `/contact`, `/copyright`, continents in sitemap/nav.
- [x] **Content directories** — `content/places/{continent}/{country}/…` (nested MDX, 300+ places) and `content/adventures/*.mdx` with archive + `[slug]` routes.
- [x] **Google Analytics 4** — `TogstrekGoogleAnalytics` + `getGoogleAnalyticsMeasurementId()` (`G-WFPJ519GNZ` default in production; `NEXT_PUBLIC_GA_MEASUREMENT_ID` / empty to override or disable). See `README.md` → Analytics.
- [x] **Inventory script** — `npm run inventory:squarespace` runs `scripts/squarespace-inventory.ts` and writes:
- [x] **WXR → MDX** — `npm run import:wxr -- --input <export.xml> --out <dir>` runs `scripts/wxr-to-mdx.ts` (posts, pages, `attachments/manifest.json` + `urls.txt`, `_thumbnail_id` → frontmatter `thumbnail`). Fixture: `migration/fixtures/wxr/minimal-export.xml`.