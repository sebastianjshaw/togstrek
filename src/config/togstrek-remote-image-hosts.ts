/**
 * Remote image origins for `next/image` — **must** stay aligned with
 * `next.config.ts` `images.remotePatterns` (`REMOTE_IMAGE_PATTERNS` + media host).
 *
 * Squarespace CDNs: some adventure featured tiles still point at mirrored originals
 * until every asset is on `media.togstrek.com`.
 */
export const TOGSTREK_REMOTE_IMAGE_PATTERNS = [
  {
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
  {
    hostname: "images.squarespace-cdn.com",
    pathname: "/**",
  },
  {
    hostname: "static1.squarespace.com",
    pathname: "/**",
  },
] as const;
