import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { loadTogstrekHikingMdx } from "@/lib/togstrek-load-hiking-mdx";

describe("loadTogstrekHikingMdx", () => {
  it("renders PhotoGallery on Bohusleden etapp 04", async () => {
    const { content } = await loadTogstrekHikingMdx([
      "bohusleden",
      "etapp-04-kasjon-to-jonsered",
    ]);
    expect(React.isValidElement(content)).toBe(true);
    const html = renderToStaticMarkup(content);
    expect(html).toContain("togstrek-mdx-photo-gallery-wrap");
  });
});
