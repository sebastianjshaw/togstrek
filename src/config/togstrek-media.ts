/**
 * Large photography (multi‑GB) should live on **object storage + CDN**, not in Git.
 *
 * Typical stack: **Cloudflare R2** (no egress to CF CDN) or **S3 + CloudFront**,
 * **Backblaze B2**, **Cloudinary**, **Bunny Storage**. Vercel/Git LFS are poor fits
 * for 2–4 GB+ of originals at low cost.
 *
 * Content references **full HTTPS URLs** or paths resolved with
 * `togstrekMediaUrl()` so MDX/frontmatter stay portable.
 */

const DEFAULT_MEDIA_BASE = "https://media.togstrek.com";

/** Public origin for your image CDN (no trailing slash). */
export function getTogstrekMediaBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (!raw?.trim()) return DEFAULT_MEDIA_BASE;
  return raw.replace(/\/+$/, "");
}

/** Hostname for `next.config` `images.remotePatterns` (derived from base URL). */
export function getTogstrekMediaHostname(): string {
  const raw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (raw?.trim()) {
    try {
      return new URL(raw).hostname;
    } catch {
      /* fall through */
    }
  }
  try {
    return new URL(DEFAULT_MEDIA_BASE).hostname;
  } catch {
    return "media.togstrek.com";
  }
}

/**
 * Join base + path. Path may be `north-america/mexico/tulum/photo.jpg` or
 * `/north-america/...`.
 */
export function togstrekMediaUrl(path: string): string {
  const base = getTogstrekMediaBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Example stub paths for **Tulum** (one city). Replace host via
 * `NEXT_PUBLIC_MEDIA_BASE_URL` or swap filenames when files exist on CDN.
 * Convention: `{continent}/{country}/{place}/{basename}-{variant}.jpg`
 */
export const TOGSTREK_MEDIA_STUB_PATHS_TULUM = {
  hero: "north-america/mexico/tulum/Castillo-20221223-0001.jpg",
  essayBeach: "north-america/mexico/tulum/Beach-20221223-0001.jpg",
} as const;

export function togstrekMediaStubUrlsTulum(): Record<
  keyof typeof TOGSTREK_MEDIA_STUB_PATHS_TULUM,
  string
> {
  return {
    hero: togstrekMediaUrl(TOGSTREK_MEDIA_STUB_PATHS_TULUM.hero),
    essayBeach: togstrekMediaUrl(TOGSTREK_MEDIA_STUB_PATHS_TULUM.essayBeach),
  };
}
