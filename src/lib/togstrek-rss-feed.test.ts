import { describe, expect, it } from "vitest";

import { parseTogstrekRssQuery } from "@/lib/togstrek-rss-feed";

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
