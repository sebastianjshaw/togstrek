import type { NextConfig } from "next";
import { getTogstrekMediaHostname } from "./src/config/togstrek-media";
import { TOGSTREK_REMOTE_IMAGE_PATTERNS } from "./src/config/togstrek-remote-image-hosts";

const mediaHost = getTogstrekMediaHostname();

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
