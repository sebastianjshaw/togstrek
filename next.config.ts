import type { NextConfig } from "next";

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

/** Keep in sync with `src/config/togstrek-remote-image-hosts.ts`. */
const REMOTE_IMAGE_PATTERNS: readonly {
  hostname: string;
  pathname: string;
}[] = [
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
];

const mediaHost = getMediaHostnameForNextConfig();
/** Canonical CDN host for MDX/data URLs — always allow even if `NEXT_PUBLIC_MEDIA_BASE_URL` points elsewhere. */
const defaultMediaHostname = new URL(DEFAULT_MEDIA_ORIGIN).hostname;
const mediaImageHosts = Array.from(
  new Set([mediaHost, defaultMediaHostname].filter(Boolean)),
);

const nextConfig: NextConfig = {
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
      ...togstrekNorthAmericaLegacyPlaceRedirects.map((r) => ({
        source: r.source,
        destination: r.destination,
        permanent: true as const,
      })),
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
    remotePatterns: [
      ...mediaImageHosts.map((hostname) => ({
        protocol: "https" as const,
        hostname,
        pathname: "/**" as const,
      })),
      ...REMOTE_IMAGE_PATTERNS.map((p) => ({
        protocol: "https" as const,
        hostname: p.hostname,
        pathname: p.pathname,
      })),
    ],
  },
};

export default nextConfig;
