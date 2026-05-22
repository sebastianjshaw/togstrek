import { describe, expect, it } from "vitest";

import { buildTogstrekMediaUrlVariants } from "@/lib/togstrek-mdx-media-url-variants";
import { extractTogstrekMdxMediaUrls } from "@/lib/togstrek-mdx-media-urls";

describe("extractTogstrekMdxMediaUrls", () => {
  it("collects markdown, YAML, and JSX CDN URLs", () => {
    const text = `
heroImage:
  src: https://media.togstrek.com/hiking/demo/hero.jpg
![lake](https://media.togstrek.com/hiking/demo/lake.jpg)
imageSrc="https://media.togstrek.com/hiking/demo/card.jpg"
`;
    const urls = extractTogstrekMdxMediaUrls(text);
    expect(urls).toEqual([
      "https://media.togstrek.com/hiking/demo/card.jpg",
      "https://media.togstrek.com/hiking/demo/hero.jpg",
      "https://media.togstrek.com/hiking/demo/lake.jpg",
    ]);
  });

  it("includes parentheses before the extension", () => {
    const text = `![](https://media.togstrek.com/a/b-001+(2019-04-25T18_27_49.843).jpg)`;
    expect(extractTogstrekMdxMediaUrls(text)).toEqual([
      "https://media.togstrek.com/a/b-001+(2019-04-25T18_27_49.843).jpg",
    ]);
  });

  it("ignores prose placeholders without an image extension", () => {
    const text =
      "Use `https://media.togstrek.com/asia/indonesia/overview/…` after upload.";
    expect(extractTogstrekMdxMediaUrls(text)).toEqual([]);
  });
});

describe("buildTogstrekMediaUrlVariants", () => {
  it("includes apostrophe encoding alternatives", () => {
    const url =
      "https://media.togstrek.com/africa/tanzania/serengeti-national-park/Grant's+Gazelle-20220315-0001.jpg";
    const variants = buildTogstrekMediaUrlVariants(url);
    expect(variants.some((v) => v.includes("%E2%80%99"))).toBe(true);
    expect(variants.some((v) => v.includes("Grant's"))).toBe(true);
  });
});
