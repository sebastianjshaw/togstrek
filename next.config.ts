/**
 * Place URL policy (App Router: `[division]/page.tsx` vs `[division]/[...place]`; same
 * public paths as `buildTogstrekPlacePublicPath` in `src/lib/togstrek-place-path.ts`).
 * When adding place-related redirects, prefer building destinations with that helper
 * (see `togstrek-north-america-legacy-place-redirects`).
 */
import type { NextConfig } from "next";

import { TOGSTREK_REMOTE_IMAGE_PATTERNS } from "./src/config/togstrek-remote-image-hosts";
import { TOGSTREK_EUROPE_LEGACY_FLAT_HUB_SLUGS } from "./src/data/togstrek-country-hub-paths";
import { togstrekNorthAmericaLegacyPlaceRedirects } from "./src/data/togstrek-north-america-legacy-place-redirects";

const DEFAULT_MEDIA_ORIGIN = "https://media.togstrek.com";

/** Hostname for `images.remotePatterns` — keep in sync with `getTogstrekMediaHostname()` in `src/config/togstrek-media.ts`. */
function getMediaHostnameForNextConfig(): string {
  const raw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw).hostname;
    } catch {
      /* fall through */
    }
  }
  try {
    return new URL(DEFAULT_MEDIA_ORIGIN).hostname;
  } catch {
    return "media.togstrek.com";
  }
}

const mediaHost = getMediaHostnameForNextConfig();
/** Canonical CDN host for MDX/data URLs — always allow even if `NEXT_PUBLIC_MEDIA_BASE_URL` points elsewhere. */
const defaultMediaHostname = new URL(DEFAULT_MEDIA_ORIGIN).hostname;
const mediaImageHosts = Array.from(
  new Set([mediaHost, defaultMediaHostname].filter(Boolean)),
);

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
] as const;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders],
      },
    ];
  },
  /**
   * Prevent @vercel/nft from following huge local-only trees (HTTrack mirror, CDN staging).
   * Key `*` attaches to the main server trace (`next-server`); see Next `collect-build-traces`.
   */
  outputFileTracingExcludes: {
    "*": [
      "**/TogsTrekBackup/**",
      "**/migration/**",
      "**/.claude/**",
    ],
  },
  async redirects() {
    return [
      {
        source: "/map-demo",
        destination: "/visited-map",
        permanent: true,
      },
      {
        source: "/europe/sweden/vastra-gotland/gothenburg",
        destination: "/europe/sweden/vastra-gotaland/gothenburg",
        permanent: true,
      },
      {
        source: "/europe/sweden/vastra-gotland/mellerud",
        destination: "/europe/sweden/vastra-gotaland/mellerud",
        permanent: true,
      },
      {
        source: "/europe/united-kingdom/england/lymingtom",
        destination: "/europe/united-kingdom/england/lymington",
        permanent: true,
      },
      {
        source: "/europe/united-kingdom/devon/okehampson",
        destination: "/europe/united-kingdom/devon/okehampton",
        permanent: true,
      },
      {
        source: "/europe/united-kingdom/england/cheshire/elsemere-port",
        destination: "/europe/united-kingdom/england/cheshire/ellesmere-port",
        permanent: true,
      },
      {
        source: "/europe/sweden/sodermanland/katerineholm",
        destination: "/europe/sweden/sodermanland/katrineholm",
        permanent: true,
      },
      {
        source: "/europe/sweden/vastra-gotaland/halland",
        destination: "/europe/sweden/vastra-gotaland/saro",
        permanent: true,
      },
      ...togstrekNorthAmericaLegacyPlaceRedirects.map((r) => ({
        source: r.source,
        destination: r.destination,
        permanent: true as const,
      })),
      ...TOGSTREK_EUROPE_LEGACY_FLAT_HUB_SLUGS.map((slug) => ({
        source: `/${slug}`,
        destination: `/europe/${slug}`,
        permanent: true as const,
      })),
      {
        source: "/svalbard",
        destination: "/europe/norway/svalbard/longyearbyen",
        permanent: true,
      },
      {
        source: "/hong-kong",
        destination: "/asia/hong-kong",
        permanent: true,
      },
      {
        source: "/europe/talinn",
        destination: "/europe/estonia/tallinn",
        permanent: true,
      },
      {
        source: "/europe/estonia/talinn",
        destination: "/europe/estonia/tallinn",
        permanent: true,
      },
      {
        source: "/europe/helsinki",
        destination: "/europe/finland/helsinki",
        permanent: true,
      },
      {
        source: "/europe/reykjavik",
        destination: "/europe/iceland/reykjavik",
        permanent: true,
      },
      {
        source: "/europe/split",
        destination: "/europe/croatia/split",
        permanent: true,
      },
      {
        source: "/europe/belgrade",
        destination: "/europe/serbia/belgrade",
        permanent: true,
      },
      {
        source: "/europe/orebro/tiveds",
        destination: "/europe/sweden/orebro/tiveds",
        permanent: true,
      },
      {
        source: "/europe/ostergotland/lindkoping",
        destination: "/europe/sweden/ostergotland/linkoping",
        permanent: true,
      },
      {
        source: "/europe/sweden/ostergotland/lindkoping",
        destination: "/europe/sweden/ostergotland/linkoping",
        permanent: true,
      },
      {
        source: "/europe/vasterbotten/hemavan",
        destination: "/europe/sweden/vasterbotten/hemavan",
        permanent: true,
      },
      {
        source: "/europe/gavleborg/gavle",
        destination: "/europe/sweden/gavleborg/gavle",
        permanent: true,
      },
      {
        source: "/europe/vastmanland/vasteras",
        destination: "/europe/sweden/vastmanland/vasteras",
        permanent: true,
      },
      {
        source: "/north-america/mexico/merida.html",
        destination: "/north-america/mexico/merida",
        permanent: true,
      },
      {
        source: "/portfolio/2011-travelling-through-nepal",
        destination: "/hiking/nepal/annapurna",
        permanent: true,
      },
      {
        source: "/liechtenstein",
        destination: "/europe/liechtenstein",
        permanent: true,
      },
      {
        source: "/europe/lichtenstein",
        destination: "/europe/liechtenstein",
        permanent: true,
      },
      {
        source: "/europe/lichtenstein/:path*",
        destination: "/europe/liechtenstein/:path*",
        permanent: true,
      },
      {
        source: "/europe/turkey/galata-tower",
        destination: "/europe/turkiye/istanbul",
        permanent: true,
      },
      {
        source: "/europe/turkey",
        destination: "/europe/turkiye",
        permanent: true,
      },
      {
        source: "/europe/turkey/:path*",
        destination: "/europe/turkiye/:path*",
        permanent: true,
      },
      {
        source: "/asia/turkey",
        destination: "/europe/turkiye",
        permanent: true,
      },
      {
        source: "/asia/turkey/:path*",
        destination: "/europe/turkiye/:path*",
        permanent: true,
      },
      {
        source: "/asia/turkiye",
        destination: "/europe/turkiye",
        permanent: true,
      },
      {
        source: "/asia/turkiye/:path*",
        destination: "/europe/turkiye/:path*",
        permanent: true,
      },
      {
        source: "/asia/kyrgyzstan/overview",
        destination: "/asia/kyrgyzstan",
        permanent: true,
      },
      {
        source: "/asia/uzbekistan/overview",
        destination: "/asia/uzbekistan",
        permanent: true,
      },
      {
        source: "/asia/tajikistan/overview",
        destination: "/asia/tajikistan",
        permanent: true,
      },
      {
        source: "/north-america/canada/overview",
        destination: "/north-america/canada",
        permanent: true,
      },
      {
        source: "/oceania/australia/overview",
        destination: "/oceania/australia/ballarat",
        permanent: true,
      },
      {
        source: "/photography/asptrophotography/gothenburgs-moon",
        destination: "/photography/astrophotography/gothenburgs-moon",
        permanent: true,
      },
      {
        source: "/photography/astrophotographer/perseids-meteor-shower",
        destination: "/photography/astrophotography/perseids-meteor-shower",
        permanent: true,
      },
      {
        source: "/photography/avalon-visit-2",
        destination: "/photography/avalon/avalon-visit-2",
        permanent: true,
      },
      {
        source: "/photography/avalon-family-tour",
        destination: "/photography/avalon/avalon-family-tour",
        permanent: true,
      },
      {
        source: "/photography",
        destination: "/other-work",
        permanent: false,
      },
      {
        source: "/hiking/bohusleden/etapp-2-stensjn-skats",
        destination: "/hiking/bohusleden/etapp-02-stensjon-to-skatas",
        permanent: true,
      },
      {
        source: "/hiking/bohusleden/etapp03-skatas-to-kasjon",
        destination: "/hiking/bohusleden/etapp-03-skatas-to-kasjon",
        permanent: true,
      },
      {
        source: "/hiking/bohuslden/:path*",
        destination: "/hiking/bohusleden/:path*",
        permanent: true,
      },
      {
        source: "/hiking/kungleden/:path*",
        destination: "/hiking/kungsleden/:path*",
        permanent: true,
      },
      {
        source: "/hiking/sweden",
        destination: "/hiking/utvandrarleden",
        permanent: true,
      },
      {
        source: "/hiking/sweden/utvandraleden",
        destination: "/hiking/utvandrarleden/utvandraleden",
        permanent: true,
      },
      {
        source: "/hiking/annapurna",
        destination: "/hiking/nepal/annapurna",
        permanent: true,
      },
      {
        source: "/hiking/kilimanjaro",
        destination: "/hiking/mt-kilimanjaro",
        permanent: true,
      },
      {
        source: "/hiking/utvandraleden",
        destination: "/hiking/utvandrarleden",
        permanent: true,
      },
      {
        source: "/antarctica/antarctic/:place",
        destination: "/antarctica/:place",
        permanent: true,
      },
      {
        source: "/other-work/guides",
        destination: "/other-work/photography-guides",
        permanent: true,
      },
      {
        source: "/other-work/model",
        destination: "/other-work/models",
        permanent: true,
      },
      {
        source: "/other-work/street",
        destination: "/other-work/street-photography",
        permanent: true,
      },
    ];
  },
  images: {
    /**
     * Do not proxy remote images through Vercel Image Optimization (`/_next/image`).
     * That API is metered and returns 402 when the quota is exceeded; media already
     * sits behind Cloudflare on `media.togstrek.com`, so load originals (or CF
     * transformations) directly from the CDN URL instead.
     */
    unoptimized: true,
    remotePatterns: [
      ...mediaImageHosts.map((hostname) => ({
        protocol: "https" as const,
        hostname,
        pathname: "/**" as const,
      })),
      ...TOGSTREK_REMOTE_IMAGE_PATTERNS.map((p) => ({
        protocol: "https" as const,
        hostname: p.hostname,
        pathname: p.pathname,
      })),
    ],
  },
};

export default nextConfig;
