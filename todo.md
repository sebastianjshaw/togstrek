





## SEO / discovery (SEOptimer audit, Apr 2026)

- [ ] **DNS — SPF + DMARC**: add SPF and DMARC (and align DKIM if you send mail) for `togstrek.com` at your DNS provider. Audit flagged both; this is deliverability / anti-spoofing, not Next.js code.
- [ ] **Homepage lab pass**: audit reports heavy **image download weight** (~7MB+), **multiple redirects**, and **JS errors** on load — profile `/` in production (Network tab, Lighthouse, console), then tighten hero/region imagery (`sizes` / dimensions / CDN variants) and fix any real client errors (ignore one-off audit false positives).
- [ ] **`NEXT_PUBLIC_AUTHOR_SAMEAS` + visible socials**: JSON-LD already supports `sameAs` via env (`src/lib/togstrek-author.ts`); set URLs in Vercel and optionally mirror them as normal footer links so humans and tools both see profiles.


## Code quality / maintainability (code review, Apr 2026)

- [x] **P0 — CI**: fail the pipeline on `npm test`; address `npm run lint` **errors** (or make warnings non-blocking until they are fixed). (`.github/workflows/ci.yml` runs `npm run lint` + `npm test` + `tsc`; all ESLint **errors** fixed — warnings only remain.)
- [x] **P1 — React / ESLint** (`togstrek-visited-dashboard-client.tsx`): resolved — no `useEffect` for scope. `const scope = lockedContinent ?? internalScope` with `useState` only for user-driven scope when not locked; buttons call `setInternalScope`.
- [x] **P1 — Types in tests** (`remark-togstrek-jump-to.test.ts`): `asRoot()`, `looseChildren()`, and `MdxJsxAttr` (no `any` in the linted paths).
- [x] **P1 — Chores** (`togstrek-load-place-mdx.ts`): duplicate unused imports from `togstrek-place-mdx-fs` removed; re-exports unchanged.
- [x] **P2 — E2E smoke**: Playwright + `e2e/smoke.spec.ts` (home via `#togstrek-home-hero-heading`, `/africa/egypt/cairo`, `/search`, `/visited-map`). Run `npm run build && npm run test:e2e` (or rely on `webServer` in `playwright.config.ts`). CI: build → `playwright install --with-deps chromium` → `playwright test`.
- [x] **P2 — `exif:fill-mdx`**: added `--files` / `--file` (repeatable) and `--include` to `scripts/togstrek-fill-mdx-empty-image-exif.ts` so a single page (or subset) can be backfilled without scanning all of `content/places`.
- [x] **P3 — Next “middleware” → “proxy”**: migrated `src/middleware.ts` → `src/proxy.ts` and renamed the handler `middleware()` → `proxy()` (per `node_modules/next/dist/docs/.../proxy.md`). Build no longer emits the middleware deprecation warning.
- [ ] **Ongoing**: document that **CDN object keys** can differ from URL slugs (e.g. `abu%20simbel` vs `abu-simbel`); verify new uploads with `HEAD` against `media.togstrek.com`.

## Code quality / maintainability (full codebase review, Jul 2026)

- [ ] **P0 — MDX plugin order breaks photo galleries** (`src/lib/togstrek-mdx-remark-plugins.ts:13`): `remarkTogstrekJumpTo` runs before image-unwrap/gallery grouping; reproduced case where the injected jump-to nav splits what should be a grouped `<PhotoGallery>`. Reorder the pipeline so unwrap/gallery grouping runs first.
- [ ] **P0 — Photography MDX can silently drop components** (`src/lib/togstrek-load-photography-mdx.ts:9`): missing the `rehype-sanitize` exemption that place/adventure/hiking/other-work loaders have (see `src/lib/togstrek-mdx-sanitize-schema.ts:49`). Not firing yet (no photography post has 2+ headings) but will silently delete `<TogstrekJumpTo>`/`<PhotoGallery>` — no error, no warning — the moment one does.
- [ ] **P0 — Map pin focus ring never renders** (`src/components/togstrek-explore-map/togstrek-explore-map.css:58`): selector expects a `<button>` descendant of `.togstrek-explore-map-pin`, but the class is on the button itself. Individual pins get no focus-visible ring, contradicting `docs/accessibility-spot-check.md`.
- [ ] **P0 — Data-loss risk in migration script** (`scripts/togstrek-fix-migration-north-america-layout.ts:140`): skips a file when its relocation target already exists, then unconditionally `rmSync`s the whole legacy dir afterward with no empty-check — skipped files get deleted. Add an emptiness check (like the sibling `removeEmptyDirs` helper) before removing.
- [ ] **P1 — Uncached content-tree walks outside places** (`src/lib/togstrek-hiking-groups.ts`, `togstrek-load-photography-mdx.ts`, `togstrek-load-other-work-mdx.ts`): the place loader got a directory-listing cache after a documented "hundreds of full-tree walks" bug (`togstrek-place-mdx-fs.ts:158`); hiking/photography/other-work never got the same fix and re-walk their trees on every call.
- [ ] **P1 — Redundant frontmatter re-reads**: place pages parse frontmatter up to 3x per render path; `togstrek-visited-travel-data.ts` and the adventures archive re-read/re-parse every content file on every call site (3+ call sites each), with no caching layer.
- [ ] **P1 — Map marker MutationObserver recreated every render** (`src/components/togstrek-explore-map/togstrek-explore-map-marker.tsx:18`): `useLayoutEffect` has no dependency array; add `[]` so it only runs once per mount instead of on every pan/zoom re-render.
- [ ] **P1 — Copy-pasted `parseHeroImage` across 4 frontmatter files** (place/adventure/hiking/other-work): silently returns `undefined` on malformed `heroImage` while adjacent code throws loudly on missing `title`/`description`. Extract to one shared helper, pick one failure mode, add tests for malformed frontmatter.
- [ ] **P1 — Squarespace migration scripts have drifted** (`scripts/togstrek-migrate-squarespace-from-backup.ts` vs `scripts/togstrek-rewrite-squarespace-urls-to-media.ts`): the backup-migration script special-cases the about-page as a URL source; the rewrite script claims the same rule set but doesn't, so a shared image URL can get assigned different CDN destinations by each.
- [ ] **P1 — Unsafe overwrite-on-rerun** (`scripts/togstrek-restructure-media.ts`, all 7 `migrate-squarespace-places-*.ts`): write output with no existence check; re-running against live `content/` risks silently clobbering hand-edited pages. Add an existence guard or explicit `--force` flag.
- [ ] **P1 — Sequential network I/O in fetch/probe scripts** (`togstrek-fetch-{africa,asia,north-america,oceania}-images.ts`, `togstrek-probe-broken-media-urls.ts`): download one-at-a-time where sibling scripts (`togstrek-fix-mdx-media-urls.ts`, `togstrek-audit-mdx-media-urls.ts`) correctly use an 8-worker pool.
- [ ] **P2 — Dead redirect code** (`src/app/feed.xml/route.ts`, `src/app/rss.xml/route.ts`): duplicates a redirect check `src/proxy.ts` already performs first; unreachable, safe to remove.
- [ ] **P2 — `?category=` legacy rewrite only covers `/asia`** (`src/proxy.ts:98`): unconfirmed whether other continents ever received that query traffic — check GA/404 data before "fixing".
- [ ] **P2 — Redundant `key` prop** (`src/components/togstrek-explore-map/togstrek-explore-map.tsx:136,251`): same `placesFitKey` set on both the outer wrapper and the inner `<Map>`; drop the inner one.
- [ ] **P2 — Orphaned "sections" type schema** (`src/types/togstrek-place-page.ts:106-159`): `TogstrekPlacePageV1` and friends are unused by the real implementation; risk of a future contributor building against the wrong model — remove or document as legacy.
- [ ] **P2 — Dead ISO2 override entries** (`src/lib/togstrek-visited-travel-data.ts:96-112`): `turkiye`/`liechtenstein` already resolve via the fallback UN-name matcher; safe to prune.
- [ ] **P2 — Env var naming inconsistency** across region fetch scripts: `TOGSTREK_MEDIA_PUBLIC_BASE_<REGION>` vs. unsuffixed `TOGSTREK_MEDIA_PUBLIC_BASE` for north-america.
- [ ] **P2 — Missing image-fetch scripts for europe/south-america/antarctica**: those regions' migration scripts reference a fetch step that doesn't exist for them.

## Backlog / later

- [ ] **Image alt/caption cleanup**: policy is implemented; remaining work is content edits. Use `npm run media:audit-image-alt` → `migration/image-alt-manual-review.jsonl`, then update MDX alts.
- [x] **Country hub quotes migration**: original Squarespace country headers had quotes; write a script to extract and add them to the new pages (or decide to drop the feature).
- [ ] **Backup health**: re-copy problematic HTTrack folders off exFAT if filenames continue to be unreadable.
- [ ] **Replace remote hero images**: optionally move key heroes under `public/media/` when you want tighter control over caching/availability.

## Recently completed (Apr 2026)

- **`public/llms.txt`**: added for AI crawlers / assistants — site summary, main sections, sitemap & feed URLs, contact, place URL pattern, and light usage notes (Apr 2026).
- **Deploy checklist**: chose **Vercel** as production host (matches `@vercel/*` usage). Documented production env vars + image/bandwidth strategy (`images.unoptimized`, CDN on `media.togstrek.com`) in `README.md` and `.env.example`. Verified `npm run build` succeeds (Apr 2026).
- **R2 photography consolidation mirrors**: ran `.venv/bin/python scripts/r2_copy_photography_consolidation.py` (dry-run then live); 23 server-side copies into canonical `photography/astrophotography/...` and `photography/avalon/...` keys, 0 errors. For future MDX prefix changes, mirror with the matching script under `scripts/`.
- **Remote image hosts:** dropped `images.squarespace-cdn.com` / `static1.squarespace.com` from `togstrek-remote-image-hosts.ts` after grep showed no matches under `content/` or `public/` (only migration scripts reference those hosts).
- **Canonical place URLs**: App Router uses **`[division]/page.tsx`** (one segment after country) and **`[division]/[...place]/page.tsx`** (deeper paths); the first slug is always the `division` param (Next.js disallows sibling `[place]` + `[division]`). Public paths unchanged (`buildTogstrekPlacePublicPath`). Shared logic: `src/lib/togstrek-place-app-route.tsx`.
- **“Jump to…” TOC**: `remark-togstrek-jump-to` strips legacy `Jump to…` + ordered `#` lists, fills opt-in `<TogstrekJumpTo />`, and auto-injects after the first paragraph when there are **≥2** outline entries and no nav yet (max **24** items; uses `##` when any exist, else `###`).
- **No-hero fallback header**: `TogstrekPageHeroFallbackHeader` replaces duplicated muted-band `<header>` markup across templates.
- **Photography consolidation**: unified astro + avalon content paths, updated hub/featured links, and added 301s + `scripts/r2_copy_photography_consolidation.py` for R2 rekeys.
- **Adventure featured `imageSrc` (Squarespace → `media.togstrek.com`)**: remaining `images.squarespace-cdn.com` URLs in `content/adventures/*.mdx` were rewritten to existing CDN keys (place / hiking / adventure paths); verified with HTTP `HEAD` where ambiguous.
- **RSS 2.0**: `/feed.xml` and `/rss.xml` (same payload; `atom:link rel="self"` matches each URL). Query filters: `?section=adventures|places|hiking|photography|other-work`, `?continent=<hub-slug>` (places-only; if `section` omitted with `continent`, treats as places). Footer link + `metadata.alternates.types` on `feed.xml`.