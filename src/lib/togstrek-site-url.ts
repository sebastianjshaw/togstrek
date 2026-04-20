/**
 * Canonical site origin for sitemap, robots, and absolute URLs at build time.
 * Must match `metadataBase` in `app/layout.tsx` unless you override via env.
 *
 * Does **not** fall back to `VERCEL_URL` (random preview hostnames → sitemap 401s
 * under deployment protection). Default is the stable Vercel project URL; set
 * `NEXT_PUBLIC_SITE_URL=https://togstrek.com` when the custom domain is live.
 */
const DEFAULT_SITE_ORIGIN = "https://togstrek.vercel.app";

export function getTogstrekSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    try {
      const u = new URL(explicit);
      if (u.protocol !== "https:" && u.protocol !== "http:") {
        return DEFAULT_SITE_ORIGIN;
      }
      return explicit.replace(/\/+$/, "");
    } catch {
      return DEFAULT_SITE_ORIGIN;
    }
  }
  return DEFAULT_SITE_ORIGIN;
}
