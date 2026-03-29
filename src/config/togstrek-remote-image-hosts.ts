/**
 * Remote image origins for `next/image` — **must** stay aligned with
 * `next.config.ts` `images.remotePatterns` (`REMOTE_IMAGE_PATTERNS` + media host).
 */
export const TOGSTREK_REMOTE_IMAGE_PATTERNS = [
  {
    hostname: "images.squarespace-cdn.com",
    pathname: "/content/**",
  },
  {
    hostname: "static1.squarespace.com",
    pathname: "/static/**",
  },
  {
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
] as const;
