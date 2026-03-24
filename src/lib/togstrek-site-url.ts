/**
 * Canonical site origin for sitemap, robots, and absolute URLs at build time.
 * Must match `metadataBase` in `app/layout.tsx` unless you override via env.
 */
const DEFAULT_SITE_ORIGIN = "https://togstrek.com";

export function getTogstrekSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "");
    return `https://${host}`;
  }
  return DEFAULT_SITE_ORIGIN;
}
