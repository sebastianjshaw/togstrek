import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isTogstrekExternalHref,
  resolveTogstrekInternalPathname,
} from "@/lib/togstrek-same-origin-href";

describe("resolveTogstrekInternalPathname", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts root-relative paths", () => {
    expect(resolveTogstrekInternalPathname("/africa/egypt/cairo")).toBe(
      "/africa/egypt/cairo",
    );
    expect(resolveTogstrekInternalPathname("/search?q=trail")).toBe(
      "/search?q=trail",
    );
  });

  it("maps absolute same-origin URLs to pathname", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.togstrek.com");
    expect(
      resolveTogstrekInternalPathname(
        "https://www.togstrek.com/europe/turkiye/istanbul",
      ),
    ).toBe("/europe/turkiye/istanbul");
    expect(
      resolveTogstrekInternalPathname("https://togstrek.com/hiking"),
    ).toBe("/hiking");
  });

  it("rejects external origins", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.togstrek.com");
    expect(
      resolveTogstrekInternalPathname("https://example.com/foo"),
    ).toBeNull();
  });

  it("rejects special schemes", () => {
    expect(resolveTogstrekInternalPathname("mailto:a@b.com")).toBeNull();
    expect(resolveTogstrekInternalPathname("#section")).toBeNull();
  });
});

describe("isTogstrekExternalHref", () => {
  it("detects http(s) links", () => {
    expect(isTogstrekExternalHref("https://example.com")).toBe(true);
    expect(isTogstrekExternalHref("/local")).toBe(false);
  });
});
