/**
 * Remote image origins allowed for `next/image` — **must** stay aligned with
 * `next.config.ts` `images.remotePatterns` (`REMOTE_IMAGE_PATTERNS` + media host).
 * (Optimization is off globally; patterns still gate which hosts may appear in `src`.)
 *
 * Squarespace CDNs were removed after confirming no `content/` or shipped `src/`
 * references still hotlink them (migration scripts may still mention those hosts).
 */
export const TOGSTREK_REMOTE_IMAGE_PATTERNS = [
  {
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
] as const;
