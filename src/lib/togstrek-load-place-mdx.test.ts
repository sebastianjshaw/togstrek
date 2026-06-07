import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { loadTogstrekPlaceMdx } from "@/lib/togstrek-load-place-mdx";

describe("loadTogstrekPlaceMdx", () => {
  it("renders PhotoGallery blocks and jump-to nav on Cairo", async () => {
    const { content } = await loadTogstrekPlaceMdx("africa", "egypt", ["cairo"]);
    expect(React.isValidElement(content)).toBe(true);
    const html = renderToStaticMarkup(content);
    expect(html).toContain("togstrek-mdx-photo-gallery-wrap");
    expect(html).toContain("togstrek-jump-to");
    expect((html.match(/togstrek-place-mdx-figure/g) ?? []).length).toBeGreaterThan(
      40,
    );
  });
});
