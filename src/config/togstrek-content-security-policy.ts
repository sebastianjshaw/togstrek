/**
 * Content-Security-Policy for `next.config.ts` `headers()`.
 *
 * Inline scripts (require `script-src 'unsafe-inline'` unless nonces are added):
 * - {@link TogstrekThemeInitScript} — `beforeInteractive` theme bootstrap
 * - {@link TogstrekGoogleAnalytics} — `gtag` init
 * - {@link TogstrekJsonLd} — `application/ld+json`
 * - Next.js runtime chunks in dev (`'unsafe-eval'` when `isDev`)
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
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://va.vercel-scripts.com",
    ...(allowGoogleAnalytics ? ["https://www.googletagmanager.com"] : []),
  ];

  const connectSrc = [
    "'self'",
    "https://vitals.vercel-insights.com",
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
    "https://*.basemaps.cartocdn.com",
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
