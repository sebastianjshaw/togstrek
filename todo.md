

## SEO / discovery (SEOptimer audit, Apr 2026)

- [ ] **DNS — SPF + DMARC**: add SPF and DMARC (and align DKIM if you send mail) for `togstrek.com` at your DNS provider. Audit flagged both; this is deliverability / anti-spoofing, not Next.js code.
- [ ] **Homepage lab pass**: audit reports heavy **image download weight** (~7MB+), **multiple redirects**, and **JS errors** on load — profile `/` in production (Network tab, Lighthouse, console), then tighten hero/region imagery (`sizes` / dimensions / CDN variants) and fix any real client errors (ignore one-off audit false positives).
- [ ] **`NEXT_PUBLIC_AUTHOR_SAMEAS` + visible socials**: JSON-LD already supports `sameAs` via env (`src/lib/togstrek-author.ts`); set URLs in Vercel and optionally mirror them as normal footer links so humans and tools both see profiles.


## Backlog / later

- [ ] **Image alt/caption cleanup**: policy is implemented; remaining work is content edits. Use `npm run media:audit-image-alt` → `migration/image-alt-manual-review.jsonl`, then update MDX alts.
- [ ] **Country hub quotes migration**: original Squarespace country headers had quotes; write a script to extract and add them to the new pages (or decide to drop the feature).
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