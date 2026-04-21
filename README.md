# A Tog’s Trek

Next.js 16 app: travel guides, places, hiking stages, photography, and adventures — content in `content/` as MDX.

## Requirements

- Node.js 20+ (match `.nvmrc` if present)
- `npm install`

## Daily commands

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server (webpack) |
| `npm run dev:fresh` | Clear `.next` then dev |
| `npm run dev:turbo` | Dev with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |

## Content & migration (selected)

| Script | Purpose |
|--------|---------|
| `npm run inventory:squarespace` | Inventory HTTrack / Squarespace HTML → `migration/` |
| `npm run import:wxr -- --input <file.xml> --out <dir>` | WordPress WXR → MDX |
| `npm run normalize:adventure-mdx` | Normalize adventure MDX featured blocks |
| `npm run fix:adventure-mdx-attrs` | Rewrite adventure JSX attrs for `next-mdx-remote` RSC |
| `npm run migrate:adventures` | Squarespace adventures → MDX (see script header) |
| `npm run migrate:hiking` | Hiking HTML migration |
| `npm run migrate:places:*` | Per-region place migration |
| `npm run media:restructure` | Prepare images for CDN tree |

Full list: **`package.json` → `scripts`**.

## Deploy (production)

**Host:** [Vercel](https://vercel.com/) — default for this repo (`@vercel/analytics` and `@vercel/speed-insights` in `src/app/layout.tsx`). Canonical URLs use `src/lib/togstrek-site-url.ts` (defaults to **`https://www.togstrek.com`** when `NEXT_PUBLIC_SITE_URL` is unset; set **`NEXT_PUBLIC_SITE_URL=https://www.togstrek.com`** in production, and set a staging origin explicitly for preview/staging). Connect the Git repo, use the **Production** branch, and keep the default **Next.js** framework preset (`npm run build` runs `next build` plus Pagefind).

**Production environment variables** (Vercel → Project → Settings → Environment Variables):

| Variable | Typical production value | Notes |
|----------|-------------------------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.togstrek.com` | No trailing slash. Canonical `metadataBase`, sitemap, feeds. If unset, defaults to **`https://www.togstrek.com`**. Preview deployments do **not** use `VERCEL_URL` (avoids random preview hosts in the sitemap). |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | `https://media.togstrek.com` | Must match the HTTPS origin serving R2 (or other CDN) objects referenced in MDX. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Your GA4 id, or empty | Empty string disables GA; see `src/lib/togstrek-google-analytics.ts`. |
| `NEXT_PUBLIC_ROBOTS_NOINDEX` | omit | Set to `true` only on staging/preview to block crawlers (`src/app/robots.ts`). |
| `R2_*` | omit on Vercel | Needed locally for `scripts/r2_upload.py` and copy scripts, not for the running app. |

**Images and bandwidth**

- `next.config.ts` sets **`images.unoptimized: true`**, so images are **not** proxied through Vercel Image Optimization (`/_next/image`). That avoids [metered image optimization](https://vercel.com/docs/image-optimization/limits-and-pricing) and 402 responses when quota is exceeded; large media should stay on your CDN origin.
- Visitor photo bytes are served from **`NEXT_PUBLIC_MEDIA_BASE_URL`** (e.g. Cloudflare in front of R2). [R2 ↔ Cloudflare edge](https://developers.cloudflare.com/r2/pricing/) has no egress charge; use a custom domain and cache rules so repeat views hit the edge, not origin every time.

## Site URL at build time

- **`NEXT_PUBLIC_SITE_URL`** — Canonical origin for `metadataBase`, sitemap, and robots (no trailing slash). Defaults to **`https://www.togstrek.com`** when unset; set explicitly for staging/preview domains.
- Staging: set **`NEXT_PUBLIC_ROBOTS_NOINDEX=true`** to disallow crawlers (`app/robots.ts`). For a staging domain, set **`NEXT_PUBLIC_SITE_URL`** to that origin explicitly.

## Analytics (GA4)

- **`NEXT_PUBLIC_GA_MEASUREMENT_ID`** — optional. Defaults to **`G-WFPJ519GNZ`** in **production** builds only (`src/lib/togstrek-google-analytics.ts`). Set to an empty string to turn GA off. In development, GA is off unless you set this variable (avoids noise in reports while you work locally).

## Docs

- Design tokens: `src/styles/tokens.css`
- Brand / tone notes: `docs/brand-tone-of-voice.md`
- Quick a11y checklist: `docs/accessibility-spot-check.md`

## Next.js

This project uses a newer Next.js stack than classic tutorials; see `AGENTS.md` and `node_modules/next/dist/docs/` when APIs differ from older docs.
