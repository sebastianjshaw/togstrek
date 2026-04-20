# Togstrek — project todo

## Next up (actionable)

- [ ] **R2 mirroring for canonical media prefixes (as needed)**:
  - If you change any `media.togstrek.com/<prefix>/...` paths in MDX, mirror objects in R2 so the new keys exist (copy scripts live in `scripts/`).
  - Latest: `python3 scripts/r2_copy_photography_consolidation.py --dry-run` then run without `--dry-run` when ready.
- [ ] **Deploy checklist**: choose host, set prod env, verify image/bandwidth limits.

## Backlog / later

- [ ] **Image alt/caption cleanup**: policy is implemented; remaining work is content edits. Use `npm run media:audit-image-alt` → `migration/image-alt-manual-review.jsonl`, then update MDX alts.
- [ ] **Country hub quotes migration**: original Squarespace country headers had quotes; write a script to extract and add them to the new pages (or decide to drop the feature).
- [ ] **Backup health**: re-copy problematic HTTrack folders off exFAT if filenames continue to be unreadable.
- [ ] **Design tooling (paused)**: Storybook + Figma/Code Connect — revisit after `htmltodesign` experiments.
- [ ] **Replace remote hero images**: optionally move key heroes under `public/media/` when you want tighter control over caching/availability.

## Recently completed (Apr 2026)

- **Remote image hosts:** dropped `images.squarespace-cdn.com` / `static1.squarespace.com` from `togstrek-remote-image-hosts.ts` after grep showed no matches under `content/` or `public/` (only migration scripts reference those hosts).
- **Canonical place URLs**: App Router uses **`[division]/page.tsx`** (one segment after country) and **`[division]/[...place]/page.tsx`** (deeper paths); the first slug is always the `division` param (Next.js disallows sibling `[place]` + `[division]`). Public paths unchanged (`buildTogstrekPlacePublicPath`). Shared logic: `src/lib/togstrek-place-app-route.tsx`.
- **“Jump to…” TOC**: `remark-togstrek-jump-to` strips legacy `Jump to…` + ordered `#` lists, fills opt-in `<TogstrekJumpTo />`, and auto-injects after the first paragraph when there are **≥2** outline entries and no nav yet (max **24** items; uses `##` when any exist, else `###`).
- **No-hero fallback header**: `TogstrekPageHeroFallbackHeader` replaces duplicated muted-band `<header>` markup across templates.
- **Photography consolidation**: unified astro + avalon content paths, updated hub/featured links, and added 301s + `scripts/r2_copy_photography_consolidation.py` for R2 rekeys.
- **Adventure featured `imageSrc` (Squarespace → `media.togstrek.com`)**: remaining `images.squarespace-cdn.com` URLs in `content/adventures/*.mdx` were rewritten to existing CDN keys (place / hiking / adventure paths); verified with HTTP `HEAD` where ambiguous.
- **RSS 2.0**: `/feed.xml` and `/rss.xml` (same payload; `atom:link rel="self"` matches each URL). Query filters: `?section=adventures|places|hiking|photography|other-work`, `?continent=<hub-slug>` (places-only; if `section` omitted with `continent`, treats as places). Footer link + `metadata.alternates.types` on `feed.xml`.