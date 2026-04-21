import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getTogstrekSiteOrigin } from "./togstrek-site-url";

describe("getTogstrekSiteOrigin", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);
    vi.stubEnv("VERCEL_URL", undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns default production origin when env unset", () => {
    expect(getTogstrekSiteOrigin()).toBe("https://www.togstrek.com");
  });

  it("trims trailing slashes from NEXT_PUBLIC_SITE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.org///");
    expect(getTogstrekSiteOrigin()).toBe("https://example.org");
  });

  it("falls back to default for invalid protocol", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "javascript:alert(1)");
    expect(getTogstrekSiteOrigin()).toBe("https://www.togstrek.com");
  });

  it("ignores VERCEL_URL when NEXT_PUBLIC_SITE_URL unset (avoids random preview host in sitemap)", () => {
    vi.stubEnv("VERCEL_URL", "my-app.vercel.app");
    expect(getTogstrekSiteOrigin()).toBe("https://www.togstrek.com");
  });

  it("still prefers NEXT_PUBLIC_SITE_URL when both are set", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.example.org");
    vi.stubEnv("VERCEL_URL", "my-app.vercel.app");
    expect(getTogstrekSiteOrigin()).toBe("https://staging.example.org");
  });
});
