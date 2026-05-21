import type { Element, Root } from "hast";
import { describe, expect, it } from "vitest";
import { sanitize } from "hast-util-sanitize";

import { togstrekMdxSanitizeSchema } from "@/lib/togstrek-mdx-sanitize-schema";

function el(
  tagName: string,
  properties: Element["properties"] = {},
  children: Element["children"] = [],
): Element {
  return { type: "element", tagName, properties, children };
}

function root(children: Root["children"]): Root {
  return { type: "root", children };
}

describe("togstrekMdxSanitizeSchema", () => {
  it("strips script elements", () => {
    const tree = root([
      el("script", {}, [{ type: "text", value: "alert(1)" }]),
      el("p", {}, [{ type: "text", value: "ok" }]),
    ]);
    const out = sanitize(tree, togstrekMdxSanitizeSchema) as Root;
    expect(out.children.map((c) => (c as Element).tagName)).toEqual(["p"]);
  });

  it("keeps heading id from rehype-slug for jump-to anchors", () => {
    const tree = el("h2", { id: "my-section" }, [
      { type: "text", value: "Section" },
    ]);
    const out = sanitize(tree, togstrekMdxSanitizeSchema) as Element;
    expect(out.properties?.id).toBe("my-section");
  });

  it("keeps adventure intro div className", () => {
    const tree = el("div", { className: "togstrek-adventure-mdx-intro" }, [
      { type: "text", value: "Hello" },
    ]);
    const out = sanitize(tree, togstrekMdxSanitizeSchema) as Element;
    expect(out.tagName).toBe("div");
    expect(out.properties?.className).toBe("togstrek-adventure-mdx-intro");
  });

  it("keeps TogstrekAdventureFeaturedPlace attributes", () => {
    const tree = el(
      "TogstrekAdventureFeaturedPlace",
      {
        href: "/africa/egypt/cairo",
        title: "Cairo",
        date: "2025",
        excerpt: "Pyramids",
      },
      [],
    );
    const out = sanitize(tree, togstrekMdxSanitizeSchema) as Element;
    expect(out.tagName).toBe("TogstrekAdventureFeaturedPlace");
    expect(out.properties?.href).toBe("/africa/egypt/cairo");
    expect(out.properties?.title).toBe("Cairo");
  });

  it("strips javascript: links", () => {
    const tree = el("a", { href: "javascript:alert(1)" }, [
      { type: "text", value: "click" },
    ]);
    const out = sanitize(tree, togstrekMdxSanitizeSchema) as Element;
    expect(out.properties?.href).toBeUndefined();
  });
});
