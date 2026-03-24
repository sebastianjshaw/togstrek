import type { NextConfig } from "next";
import { getTogstrekMediaHostname } from "./src/config/togstrek-media";
import { TOGSTREK_REMOTE_IMAGE_PATTERNS } from "./src/config/togstrek-remote-image-hosts";

const mediaHost = getTogstrekMediaHostname();

const nextConfig: NextConfig = {
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
