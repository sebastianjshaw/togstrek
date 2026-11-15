import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import type { Root } from "mdast";

import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";

type Block = { type: string; name?: string; children?: Block[] };

function run(markdown: string): Block[] {
  const processor = unified()
    .use(remarkParse)
    .use(togstrekMdxRemarkPlugins as never);
  const tree = processor.runSync(processor.parse(markdown)) as Root;
  return tree.children as unknown as Block[];
}

describe("togstrekMdxRemarkPlugins", () => {
  it("keeps a leading run of photos in one gallery when jump-to auto-injects", () => {
    const blocks = run(
      [
        "![One](https://media.togstrek.com/a.jpg)",
        "",
        "![Two](https://media.togstrek.com/b.jpg)",
        "",
        "Intro paragraph.",
        "",
        "## Sights",
        "",
        "Text.",
        "",
        "## Food",
        "",
        "More text.",
      ].join("\n"),
    );
    const names = blocks.map((b) => b.name ?? b.type);
    expect(names.filter((n) => n === "PhotoGallery")).toHaveLength(1);
    expect(names.indexOf("TogstrekJumpTo")).toBeGreaterThan(
      names.indexOf("PhotoGallery"),
    );
    const gallery = blocks.find((b) => b.name === "PhotoGallery");
    expect(gallery?.children).toHaveLength(2);
  });

  it("injects jump-to after the first prose paragraph, not inside an image run", () => {
    const blocks = run(
      [
        "Intro paragraph.",
        "",
        "![One](https://media.togstrek.com/a.jpg)",
        "",
        "![Two](https://media.togstrek.com/b.jpg)",
        "",
        "## Sights",
        "",
        "## Food",
      ].join("\n"),
    );
    const names = blocks.map((b) => b.name ?? b.type);
    expect(names.slice(0, 3)).toEqual([
      "paragraph",
      "TogstrekJumpTo",
      "PhotoGallery",
    ]);
  });
});
