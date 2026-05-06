import { describe, expect, it } from "vitest";

import {
  parseTogstrekRssQuery,
  togstrekRssCanonicalFeedUrl,
  togstrekRssShouldRedirectToCanonicalFeedUrl,
} from "@/lib/togstrek-rss-feed";

describe("parseTogstrekRssQuery", () => {
  it("parses section and continent", () => {
    const q = parseTogstrekRssQuery(
      new URL("https://example.com/feed.xml?section=places&continent=europe"),
    );
    expect(q).toEqual({ section: "places", continent: "europe" });
  });

  it("rejects invalid section", () => {
    const q = parseTogstrekRssQuery(
      new URL("https://example.com/feed.xml?section=nope"),
    );
    expect(q).toEqual({ section: undefined, continent: undefined });
  });

  it("rejects invalid continent", () => {
    const q = parseTogstrekRssQuery(
      new URL("https://example.com/feed.xml?continent=atlantis"),
    );
    expect(q).toEqual({ section: undefined, continent: undefined });
  });
});

describe("togstrekRssCanonicalFeedUrl / togstrekRssShouldRedirectToCanonicalFeedUrl", () => {
  it("does not redirect a clean URL", () => {
    const u = new URL("https://example.com/feed.xml");
    expect(togstrekRssShouldRedirectToCanonicalFeedUrl(u)).toBe(false);
  });

  it("does not redirect valid section+continent in canonical order", () => {
    const u = new URL(
      "https://example.com/feed.xml?section=places&continent=europe",
    );
    expect(togstrekRssShouldRedirectToCanonicalFeedUrl(u)).toBe(false);
  });

  it("redirects when utm params are present", () => {
    const u = new URL(
      "https://example.com/feed.xml?section=places&utm_source=twitter",
    );
    expect(togstrekRssShouldRedirectToCanonicalFeedUrl(u)).toBe(true);
    expect(togstrekRssCanonicalFeedUrl(u).toString()).toBe(
      "https://example.com/feed.xml?section=places",
    );
  });

  it("redirects to stable param order", () => {
    const u = new URL(
      "https://example.com/feed.xml?continent=europe&section=places",
    );
    expect(togstrekRssShouldRedirectToCanonicalFeedUrl(u)).toBe(true);
    expect(togstrekRssCanonicalFeedUrl(u).search).toBe(
      "?section=places&continent=europe",
    );
  });

  it("redirects invalid section raw value", () => {
    const u = new URL("https://example.com/rss.xml?section=nope");
    expect(togstrekRssShouldRedirectToCanonicalFeedUrl(u)).toBe(true);
    expect(togstrekRssCanonicalFeedUrl(u).search).toBe("");
  });
});
