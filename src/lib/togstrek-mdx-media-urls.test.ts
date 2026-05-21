import { describe, expect, it } from "vitest";

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

  it("dedupes repeated URLs", () => {
    const text =
      "![](https://media.togstrek.com/a/x.jpg)\n![](https://media.togstrek.com/a/x.jpg)";
    expect(extractTogstrekMdxMediaUrls(text)).toEqual([
      "https://media.togstrek.com/a/x.jpg",
    ]);
  });
});
