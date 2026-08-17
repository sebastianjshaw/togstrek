/**
 * Place URL policy (App Router: `[division]/page.tsx` vs `[division]/[...place]`; same
 * public paths as `buildTogstrekPlacePublicPath` in `src/lib/togstrek-place-path.ts`).
 * When adding place-related redirects, prefer building destinations with that helper
 * (see `togstrek-north-america-legacy-place-redirects`).
 */
import type { NextConfig } from "next";

import { TOGSTREK_REMOTE_IMAGE_PATTERNS } from "./src/config/togstrek-remote-image-hosts";
import {
  TOGSTREK_EUROPE_LEGACY_FLAT_HUB_SLUGS,
  TOGSTREK_LEGACY_FLAT_COUNTRY_HUB_REDIRECTS,
} from "./src/data/togstrek-country-hub-paths";
import { togstrekNorthAmericaLegacyPlaceRedirects } from "./src/data/togstrek-north-america-legacy-place-redirects";
import { togstrekSeoLegacyRedirects } from "./src/data/togstrek-seo-legacy-redirects";
import { buildTogstrekContentSecurityPolicy } from "./src/config/togstrek-content-security-policy";

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

/** Canonical hostname for apex/www redirects — keep in sync with `src/proxy.ts` feed rules. */
function getCanonicalSiteHostnameForNextConfig(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw).hostname;
    } catch {
      /* fall through */
    }
  }
  return "www.togstrek.com";
}

function togstrekApexWwwHostRedirects(): {
  source: string;
  has: { type: "host"; value: string }[];
  destination: string;
  permanent: true;
}[] {
  const canonical = getCanonicalSiteHostnameForNextConfig();
  if (canonical === "www.togstrek.com") {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "togstrek.com" }],
        destination: "https://www.togstrek.com/:path*",
        permanent: true,
      },
    ];
  }
  if (canonical === "togstrek.com") {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.togstrek.com" }],
        destination: "https://togstrek.com/:path*",
        permanent: true,
      },
    ];
  }
  return [];
}

const mediaHost = getMediaHostnameForNextConfig();
/** Canonical CDN host for MDX/data URLs — always allow even if `NEXT_PUBLIC_MEDIA_BASE_URL` points elsewhere. */
const defaultMediaHostname = new URL(DEFAULT_MEDIA_ORIGIN).hostname;
const mediaImageHosts = Array.from(
  new Set([mediaHost, defaultMediaHostname].filter(Boolean)),
);

const isDev = process.env.NODE_ENV === "development";

const contentSecurityPolicy = buildTogstrekContentSecurityPolicy({
  mediaImageHosts: mediaImageHosts,
  allowGoogleAnalytics: true,
  isDev,
});

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
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
      ...togstrekApexWwwHostRedirects(),
      {
        source: "/map-demo",
        destination: "/visited-map",
        permanent: true,
      },
      // GA not-found cleanups (legacy Squarespace taxonomy + short links).
      {
        source: "/kilimanjaro",
        destination: "/hiking/mt-kilimanjaro",
        permanent: true,
      },
      {
        source: "/bohusleden",
        destination: "/hiking/bohusleden",
        permanent: true,
      },
      {
        source: "/kungsleden",
        destination: "/hiking/kungsleden",
        permanent: true,
      },
      {
        source: "/turkiye",
        destination: "/europe/turkiye",
        permanent: true,
      },
      {
        source: "/turkiye/:path*",
        destination: "/europe/turkiye/:path*",
        permanent: true,
      },
      {
        source: "/norbotten",
        destination: "/europe/sweden/norbotten",
        permanent: true,
      },
      {
        source: "/norrbotten",
        destination: "/europe/sweden/norbotten",
        permanent: true,
      },
      {
        source: "/orebro",
        destination: "/europe/sweden/orebro",
        permanent: true,
      },
      {
        source: "/blekinge",
        destination: "/europe/sweden/blekinge",
        permanent: true,
      },
      {
        source: "/gotland",
        destination: "/europe/sweden/gotland",
        permanent: true,
      },
      {
        source: "/norfolk",
        destination: "/europe/united-kingdom/england/norfolk",
        permanent: true,
      },
      {
        source: "/isle-of-wight",
        destination: "/europe/united-kingdom/england/isle-of-wight",
        permanent: true,
      },
      {
        source: "/portfolio/halland",
        destination: "/europe/sweden/halland",
        permanent: true,
      },
      {
        source: "/portfolio/2018-bedouin-stars",
        destination: "/adventures/2018-bedouin-stars",
        permanent: true,
      },
      {
        source: "/south-america/ecuador/adventures/2010-i-left-my-stock-in-sacramento",
        destination: "/adventures/2010-i-left-my-stock-in-sacramento",
        permanent: true,
      },
      {
        source: "/photography/category/Art\\+Nude",
        destination: "/other-work/art-nude",
        permanent: true,
      },
      {
        source: "/photography/category/Fetish",
        destination: "/other-work/fetish",
        permanent: true,
      },
      {
        source: "/photography/category/Astrophotography",
        destination: "/other-work/astrophotography",
        permanent: true,
      },
      {
        source: "/africa/category/Tanzania",
        destination: "/africa/tanzania",
        permanent: true,
      },
      {
        source: "/north-america/category/Guatemala",
        destination: "/north-america/guatemala",
        permanent: true,
      },
      {
        source: "/europe/category/France",
        destination: "/europe/france",
        permanent: true,
      },
      {
        source: "/europe/category/Germany",
        destination: "/europe/germany",
        permanent: true,
      },
      {
        source: "/europe/category/Sweden",
        destination: "/europe/sweden",
        permanent: true,
      },
      {
        source: "/europe/category/Bosnia\\+and\\+Herzegovina",
        destination: "/europe/bosnia-and-herzegovina",
        permanent: true,
      },
      {
        source: "/europe/category/Italy",
        destination: "/europe/italy",
        permanent: true,
      },
      {
        source: "/asia/category/Israel",
        destination: "/asia/israel",
        permanent: true,
      },
      {
        source: "/asia/category/Turkey",
        destination: "/europe/turkiye",
        permanent: true,
      },
      {
        source: "/asia/isreal/jerusalem",
        destination: "/asia/israel/jerusalem",
        permanent: true,
      },
      {
        source: "/europe/Malta",
        destination: "/europe/malta",
        permanent: true,
      },
      {
        source: "/europe/Netherlands",
        destination: "/europe/netherlands",
        permanent: true,
      },
      {
        source: "/europe/brans",
        destination: "/europe/sweden/brans",
        permanent: true,
      },
      {
        source: "/blog/neko-harbour",
        destination: "/antarctica/neko-harbour",
        permanent: true,
      },
      {
        source: "/blog/oslo",
        destination: "/europe/norway/oslo",
        permanent: true,
      },
      {
        source: "/blog/returning-to-vilnius",
        destination: "/europe/lithuania/vilnius",
        permanent: true,
      },
      {
        source: "/blog/blackheath-fireworks-2010",
        destination: "/photography/events/blackheath-fireworks-2010",
        permanent: true,
      },
      {
        source: "/blog/shibari-rope-bondage",
        destination: "/photography/fetish/shibari-rope-bondage",
        permanent: true,
      },
      {
        source: "/blog/on-the-edge-richmond-world-music-festival",
        destination: "/photography/music/on-the-edge",
        permanent: true,
      },
      {
        source: "/blog/playa-vista-los-angeles",
        destination: "/north-america/united-states-of-america/california/los-angeles",
        permanent: true,
      },
      {
        source: "/blog/horseback-riding",
        destination: "/search",
        permanent: false,
      },
      // Legacy tag/category routes that don’t map 1:1 to modern pages.
      // (We keep these non-permanent so we can tighten destinations later without cache pain.)
      {
        source: "/photography/tag/:path*",
        destination: "/search",
        permanent: false,
      },
      {
        source: "/blog/tagged/:path*",
        destination: "/search",
        permanent: false,
      },
      {
        source: "/europe/aalta",
        destination: "/europe/malta",
        permanent: true,
      },
      {
        source: "/europe/tag/Mont\\+Blanc",
        destination: "/europe/france/chamonix",
        permanent: true,
      },
      {
        source: "/europe/tag/:path*",
        destination: "/search",
        permanent: false,
      },
      {
        source: "/north-america/tag/:path*",
        destination: "/search",
        permanent: false,
      },
      {
        source: "/hiking/tag/:path*",
        destination: "/search",
        permanent: false,
      },
      {
        source: "/hiking/tag/Stella\\+Point",
        destination: "/hiking/mt-kilimanjaro/05-barafu-camp-mweka-camp",
        permanent: true,
      },
      {
        source: "/antarctica/tag/South\\+of\\+the\\+Circle",
        destination: "/antarctica/south-of-the-circle",
        permanent: true,
      },
      {
        source: "/antarctica/tag/:path*",
        destination: "/search",
        permanent: false,
      },
      {
        source: "/cart",
        destination: "/",
        permanent: false,
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
      ...TOGSTREK_EUROPE_LEGACY_FLAT_HUB_SLUGS.flatMap((slug) => [
        {
          source: `/${slug}`,
          destination: `/europe/${slug}`,
          permanent: true as const,
        },
        {
          source: `/${slug}/:path*`,
          destination: `/europe/${slug}/:path*`,
          permanent: true as const,
        },
      ]),
      ...TOGSTREK_LEGACY_FLAT_COUNTRY_HUB_REDIRECTS.flatMap(
        ({ slug, continent }) => [
          {
            source: `/${slug}`,
            destination: `/${continent}/${slug}`,
            permanent: true as const,
          },
          {
            source: `/${slug}/:path*`,
            destination: `/${continent}/${slug}/:path*`,
            permanent: true as const,
          },
        ],
      ),
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
      ...togstrekSeoLegacyRedirects.map((r) => ({
        source: r.source,
        destination: r.destination,
        permanent: true as const,
      })),
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
