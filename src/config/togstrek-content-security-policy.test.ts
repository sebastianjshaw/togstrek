import { describe, expect, it } from "vitest";

import { buildTogstrekContentSecurityPolicy } from "@/config/togstrek-content-security-policy";

describe("buildTogstrekContentSecurityPolicy", () => {
  it("allows inline scripts and Google Analytics when enabled", () => {
    const csp = buildTogstrekContentSecurityPolicy({
      mediaImageHosts: ["media.togstrek.com"],
      allowGoogleAnalytics: true,
      isDev: false,
    });

    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).toContain("connect-src");
    expect(csp).toContain("https://*.basemaps.cartocdn.com");
    expect(csp).toContain("https://raw.githubusercontent.com");
    expect(csp).toContain("https://www.google-analytics.com");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("adds unsafe-eval in development for Next.js", () => {
    const csp = buildTogstrekContentSecurityPolicy({
      mediaImageHosts: [],
      allowGoogleAnalytics: false,
      isDev: true,
    });

    expect(csp).toContain("'unsafe-eval'");
    expect(csp).not.toContain("googletagmanager.com");
  });
});
