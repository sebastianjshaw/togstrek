/**
 * Content-Security-Policy for `next.config.ts` `headers()`.
 *
 * Inline scripts (require `script-src 'unsafe-inline'` unless nonces are added):
 * - {@link TogstrekThemeInitScript} — `beforeInteractive` theme bootstrap
 * - {@link TogstrekGoogleAnalytics} — `gtag` init
 * - {@link TogstrekJsonLd} — `application/ld+json`
 * - Next.js runtime chunks in dev (`'unsafe-eval'` when `isDev`)
 *
 * `'wasm-unsafe-eval'` (always on, not just dev) — Pagefind's search index
 * loads a WASM module client-side (`togstrek-pagefind-ui.tsx`); without this,
 * `WebAssembly.instantiate` is blocked by CSP and search silently returns no
 * results in production, with no network request to show why.
 */
export type TogstrekContentSecurityPolicyOptions = {
  /** Hostnames allowed for `img-src` (CDN) — keep in sync with `images.remotePatterns`. */
  mediaImageHosts: readonly string[];
  /** When true, allow Google Tag Manager / Analytics endpoints. */
  allowGoogleAnalytics: boolean;
  isDev: boolean;
};

function hostToImgSrc(hostname: string): string {
  return `https://${hostname}`;
}

export function buildTogstrekContentSecurityPolicy(
  options: TogstrekContentSecurityPolicyOptions,
): string {
  const { mediaImageHosts, allowGoogleAnalytics, isDev } = options;

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'wasm-unsafe-eval'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://va.vercel-scripts.com",
    ...(allowGoogleAnalytics ? ["https://www.googletagmanager.com"] : []),
  ];

  const connectSrc = [
    "'self'",
    "https://vitals.vercel-insights.com",
    /** MapLibre vector tiles/style/fonts/sprites + country overlay GeoJSON (`togstrek-explore-map.tsx`). */
    "https://tiles.openfreemap.org",
    "https://raw.githubusercontent.com",
    ...(allowGoogleAnalytics
      ? [
          "https://www.google-analytics.com",
          "https://*.google-analytics.com",
          "https://analytics.google.com",
          "https://www.googletagmanager.com",
        ]
      : []),
  ];

  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    ...mediaImageHosts.map(hostToImgSrc),
    "https://images.unsplash.com",
    "https://tiles.openfreemap.org",
    ...(allowGoogleAnalytics
      ? [
          "https://www.google-analytics.com",
          "https://www.googletagmanager.com",
        ]
      : []),
  ];

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
    /** `TogstrekMdxYouTubeEmbed` — YouTube video embeds in place/hiking MDX content. */
    "frame-src": [
      "'self'",
      "https://www.youtube.com",
      "https://www.youtube-nocookie.com",
    ],
    "object-src": ["'none'"],
    "script-src": scriptSrc,
    "style-src": ["'self'", "'unsafe-inline'"],
    "font-src": ["'self'", "data:"],
    "img-src": imgSrc,
    "connect-src": connectSrc,
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
  };

  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}
