/**
 * Canonical site origin for sitemap, robots, and absolute URLs at build time.
 * Must match `metadataBase` in `app/layout.tsx` unless you override via env.
 *
 * Does **not** fall back to `VERCEL_URL` (random preview hostnames → sitemap 401s
 * under deployment protection). Default is the production custom domain; set
 * `NEXT_PUBLIC_SITE_URL` explicitly for staging/preview environments.
 */
const DEFAULT_SITE_ORIGIN = "https://www.togstrek.com";

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
