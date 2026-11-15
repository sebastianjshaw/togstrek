import { describe, expect, it } from "vitest";

import { parseTogstrekHeroImage } from "@/lib/togstrek-frontmatter-hero-image";

const valid = {
  basename: "a.jpg",
  src: "https://media.togstrek.com/a.jpg",
  width: 1200,
  height: 800,
  alt: "A",
};

describe("parseTogstrekHeroImage", () => {
  it("returns undefined when the hero is absent", () => {
    expect(parseTogstrekHeroImage(undefined)).toBeUndefined();
    expect(parseTogstrekHeroImage(null)).toBeUndefined();
  });

  it("parses a complete hero and normalises optional fields", () => {
    expect(parseTogstrekHeroImage({ ...valid, priority: true, caption: "c" })).toEqual({
      ...valid,
      caption: "c",
      credit: undefined,
      priority: true,
    });
  });

  it("throws, naming the source and the bad fields, when malformed", () => {
    expect(() =>
      parseTogstrekHeroImage({ ...valid, width: "1200", alt: undefined }, "europe/x.mdx"),
    ).toThrow(/europe\/x\.mdx: heroImage needs width \(number\), alt \(string\)/);
    expect(() => parseTogstrekHeroImage("nope")).toThrow(/must be an object/);
  });
});
