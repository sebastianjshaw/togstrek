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

## Site URL at build time

- **`NEXT_PUBLIC_SITE_URL`** — Canonical origin for `metadataBase`, sitemap, and robots (no trailing slash). Defaults to `https://togstrek.com`.
- On Vercel, **`VERCEL_URL`** is used when `NEXT_PUBLIC_SITE_URL` is unset.
- Staging: set **`NEXT_PUBLIC_ROBOTS_NOINDEX=true`** to disallow crawlers (`app/robots.ts`).

## Analytics (GA4)

- **`NEXT_PUBLIC_GA_MEASUREMENT_ID`** — optional. Defaults to **`G-WFPJ519GNZ`** in **production** builds only (`src/lib/togstrek-google-analytics.ts`). Set to an empty string to turn GA off. In development, GA is off unless you set this variable (avoids noise in reports while you work locally).

## Docs

- Design tokens: `src/styles/tokens.css`
- Brand / tone notes: `docs/brand-tone-of-voice.md`
- Quick a11y checklist: `docs/accessibility-spot-check.md`

## Next.js

This project uses a newer Next.js stack than classic tutorials; see `AGENTS.md` and `node_modules/next/dist/docs/` when APIs differ from older docs.
