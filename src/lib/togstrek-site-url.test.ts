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
    expect(getTogstrekSiteOrigin()).toBe("https://togstrek.com");
  });

  it("trims trailing slashes from NEXT_PUBLIC_SITE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.org///");
    expect(getTogstrekSiteOrigin()).toBe("https://example.org");
  });

  it("falls back to default for invalid protocol", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "javascript:alert(1)");
    expect(getTogstrekSiteOrigin()).toBe("https://togstrek.com");
  });

  it("uses VERCEL_URL when site URL unset", () => {
    vi.stubEnv("VERCEL_URL", "my-app.vercel.app");
    expect(getTogstrekSiteOrigin()).toBe("https://my-app.vercel.app");
  });

  it("strips scheme from VERCEL_URL if present", () => {
    vi.stubEnv("VERCEL_URL", "https://preview.vercel.app");
    expect(getTogstrekSiteOrigin()).toBe("https://preview.vercel.app");
  });
});
