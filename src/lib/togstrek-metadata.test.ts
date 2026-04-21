import { describe, expect, it } from "vitest";

import {
  buildTogstrekMetadata,
  getTogstrekDefaultSocialOgImage,
  togstrekCanonicalSocialImageUrl,
} from "./togstrek-metadata";

describe("togstrekCanonicalSocialImageUrl", () => {
  it("rewrites Cloudflare R2 public bucket hosts to media.togstrek.com", () => {
    expect(
      togstrekCanonicalSocialImageUrl(
        "https://pub-04d195329cf543ef80190cf747454fef.r2.dev/hiking/nepal/x.jpg",
      ),
    ).toBe("https://media.togstrek.com/hiking/nepal/x.jpg");
  });

  it("preserves query on rewrite", () => {
    expect(
      togstrekCanonicalSocialImageUrl(
        "https://example.r2.dev/path/a.jpg?v=1",
      ),
    ).toBe("https://media.togstrek.com/path/a.jpg?v=1");
  });

  it("leaves media.togstrek.com unchanged", () => {
    const u = "https://media.togstrek.com/hiking/nepal/x.jpg";
    expect(togstrekCanonicalSocialImageUrl(u)).toBe(u);
  });
});

describe("buildTogstrekMetadata", () => {
  it("supplies a default OG image when none passed", () => {
    const m = buildTogstrekMetadata({
      title: "Search",
      description: "Find pages on the site.",
      path: "/search",
    });
    expect(m.openGraph?.images).toBeDefined();
    expect(Array.isArray(m.openGraph?.images)).toBe(true);
    expect((m.openGraph?.images as { url: string }[])[0]?.url).toBe(
      getTogstrekDefaultSocialOgImage().url,
    );
  });

  it("passes Twitter image descriptor with alt when available", () => {
    const m = buildTogstrekMetadata({
      title: "T",
      description: "D",
      path: "/x",
      openGraphImages: [
        {
          url: "https://media.togstrek.com/a.jpg",
          alt: "Caption",
          width: 1200,
          height: 630,
        },
      ],
    });
    const tw = m.twitter as {
      images?: { url: string; alt?: string }[];
    };
    expect(tw.images?.[0]?.url).toBe("https://media.togstrek.com/a.jpg");
    expect(tw.images?.[0]?.alt).toBe("Caption");
  });
});
