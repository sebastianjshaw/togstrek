# Togstrek — project todo

URL Crawl




# Try re-encoding the reference to the opposite form and see if it resolves
python3 -c "import unicodedata,urllib.parse; print(urllib.parse.quote(unicodedata.normalize('NFC', 'Centro Cultural de Belém-20211202-048.jpg')))"
python3 -c "import unicodedata,urllib.parse; print(urllib.parse.quote(unicodedata.normalize('NFD', 'Centro Cultural de Belém-20211202-048.jpg')))"
Then curl each variant against the bucket. If one works, you've found your fix (normalise everything to that form at the boundary). If neither works, the files genuinely aren't uploaded.
Longer-term fix regardless: strip accents from all filenames at ingest. Belém → belem, Snæfellsnes → snaefellsnes. You lose nothing a reader sees, you gain bulletproof URLs.

6. Smart quotes leaked into an href
https://app.fabrik.io/%E2%80%9D
https://app.fabrik.io/%E2%80%9Dhttp://www.shawsolution.com/blogs/sunset-sunrise%E2%80%9D
%E2%80%9D is " (right double quotation mark). You've got a piece of content where smart quotes were auto-applied inside an href attribute, concatenating a quote into the URL itself. The second one has wrapped an entire URL in smart quotes and glued it to the fabrik.io domain. Grep your content files for fabrik.io" and similar.
7. External link rot (low priority)

57 Edinburgh Fringe ticket pages: expected, shows age out. You could leave them, or run a script that converts any tickets.edfringe.com/whats-on/* link into plain text.
12 fabrik.io: old portfolio host, same story.
A dozen miscellaneous dead third-party links: IMDb redirects (the 202s), TripAdvisor (403, probably bot detection not a real error), mayaruins.com, a few Swedish council sites, gofundme.

For a photography/travel blog with a 10+ year archive, this level of external rot is normal. Not worth hand-fixing each one. Worth doing: a scheduled lychee/muffet run that emails you a diff so you catch newly-broken externals rather than letting them accumulate.


## Backlog / later

- [ ] **Image alt/caption cleanup**: policy is implemented; remaining work is content edits. Use `npm run media:audit-image-alt` → `migration/image-alt-manual-review.jsonl`, then update MDX alts.
- [ ] **Country hub quotes migration**: original Squarespace country headers had quotes; write a script to extract and add them to the new pages (or decide to drop the feature).
- [ ] **Backup health**: re-copy problematic HTTrack folders off exFAT if filenames continue to be unreadable.
- [ ] **Replace remote hero images**: optionally move key heroes under `public/media/` when you want tighter control over caching/availability.

## Recently completed (Apr 2026)

- **Deploy checklist**: chose **Vercel** as production host (matches `@vercel/*` usage). Documented production env vars + image/bandwidth strategy (`images.unoptimized`, CDN on `media.togstrek.com`) in `README.md` and `.env.example`. Verified `npm run build` succeeds (Apr 2026).
- **R2 photography consolidation mirrors**: ran `.venv/bin/python scripts/r2_copy_photography_consolidation.py` (dry-run then live); 23 server-side copies into canonical `photography/astrophotography/...` and `photography/avalon/...` keys, 0 errors. For future MDX prefix changes, mirror with the matching script under `scripts/`.
- **Remote image hosts:** dropped `images.squarespace-cdn.com` / `static1.squarespace.com` from `togstrek-remote-image-hosts.ts` after grep showed no matches under `content/` or `public/` (only migration scripts reference those hosts).
- **Canonical place URLs**: App Router uses **`[division]/page.tsx`** (one segment after country) and **`[division]/[...place]/page.tsx`** (deeper paths); the first slug is always the `division` param (Next.js disallows sibling `[place]` + `[division]`). Public paths unchanged (`buildTogstrekPlacePublicPath`). Shared logic: `src/lib/togstrek-place-app-route.tsx`.
- **“Jump to…” TOC**: `remark-togstrek-jump-to` strips legacy `Jump to…` + ordered `#` lists, fills opt-in `<TogstrekJumpTo />`, and auto-injects after the first paragraph when there are **≥2** outline entries and no nav yet (max **24** items; uses `##` when any exist, else `###`).
- **No-hero fallback header**: `TogstrekPageHeroFallbackHeader` replaces duplicated muted-band `<header>` markup across templates.
- **Photography consolidation**: unified astro + avalon content paths, updated hub/featured links, and added 301s + `scripts/r2_copy_photography_consolidation.py` for R2 rekeys.
- **Adventure featured `imageSrc` (Squarespace → `media.togstrek.com`)**: remaining `images.squarespace-cdn.com` URLs in `content/adventures/*.mdx` were rewritten to existing CDN keys (place / hiking / adventure paths); verified with HTTP `HEAD` where ambiguous.
- **RSS 2.0**: `/feed.xml` and `/rss.xml` (same payload; `atom:link rel="self"` matches each URL). Query filters: `?section=adventures|places|hiking|photography|other-work`, `?continent=<hub-slug>` (places-only; if `section` omitted with `continent`, treats as places). Footer link + `metadata.alternates.types` on `feed.xml`.