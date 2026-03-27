import type { NextConfig } from "next";
import { getTogstrekMediaHostname } from "./src/config/togstrek-media";
import { TOGSTREK_REMOTE_IMAGE_PATTERNS } from "./src/config/togstrek-remote-image-hosts";

const mediaHost = getTogstrekMediaHostname();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/photography",
        destination: "/other-work",
        permanent: false,
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
      {
        protocol: "https",
        hostname: mediaHost,
        pathname: "/**",
      },
      ...TOGSTREK_REMOTE_IMAGE_PATTERNS.map((p) => ({
        protocol: "https" as const,
        hostname: p.hostname,
        pathname: p.pathname,
      })),
    ],
  },
};

export default nextConfig;
