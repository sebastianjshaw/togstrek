import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { loadTogstrekAdventureMdx } from "@/lib/togstrek-load-adventure-mdx";

describe("loadTogstrekAdventureMdx", () => {
  it("renders featured place cards for Egypt adventure", async () => {
    const { content } = await loadTogstrekAdventureMdx("2025-the-book-of-the-dead");
    expect(React.isValidElement(content)).toBe(true);
    const html = renderToStaticMarkup(content);
    expect(html).toContain("togstrek-adventure-featured-place-card");
    expect(html).toContain("Cairo");
    expect(html).toContain("/africa/egypt/cairo");
    expect(html).toContain("togstrek-adventure-mdx-intro");
  });
});
