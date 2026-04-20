import { describe, expect, it } from "vitest";

import { remarkTogstrekJumpTo } from "@/lib/remark-togstrek-jump-to";

/**
 * These tests build minimal mdast-like trees by hand. The remark plugin operates on
 * mdast + MDX nodes, but the upstream `mdast` `RootContent` typing does not include
 * MDX JSX nodes (`mdxJsxFlowElement`), so we keep fixtures loosely typed for `tsc`.
 */
type TestRoot = {
  type: "root";
  children: any[];
};

describe("remarkTogstrekJumpTo", () => {
  it("replaces Jump to block with TogstrekJumpTo using h2-derived ids", () => {
    const plugin = remarkTogstrekJumpTo();
    const tree: TestRoot = {
      type: "root",
      children: [
        {
          type: "paragraph" as const,
          children: [{ type: "text" as const, value: "Jump to..." }],
        },
        {
          type: "list" as const,
          ordered: true,
          start: 1,
          spread: false,
          children: [
            {
              type: "listItem" as const,
              spread: false,
              children: [
                {
                  type: "paragraph" as const,
                  children: [
                    {
                      type: "link" as const,
                      url: "#sights---culture",
                      title: null,
                      children: [
                        { type: "text" as const, value: "Sights & Culture" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "heading" as const,
          depth: 2 as const,
          spread: false,
          children: [
            { type: "text" as const, value: "Sights & Culture" },
          ],
        },
      ],
    };
    plugin(tree as any);
    expect(tree.children).toHaveLength(2);
    const first = tree.children[0];
    expect(first?.type).toBe("mdxJsxFlowElement");
    if (first?.type !== "mdxJsxFlowElement") return;
    expect(first.name).toBe("TogstrekJumpTo");
    const payloadAttr = (first.attributes as any[]).find(
      (a: any) => a?.name === "payload",
    );
    expect(payloadAttr?.type).toBe("mdxJsxAttribute");
    if (payloadAttr?.type !== "mdxJsxAttribute" || typeof payloadAttr.value !== "string") {
      throw new Error("expected payload string");
    }
    const decoded = JSON.parse(
      Buffer.from(payloadAttr.value, "base64").toString("utf8"),
    ) as { id: string; label: string }[];
    expect(decoded).toEqual([
      { id: "sights--culture", depth: 2, label: "Sights & Culture" },
    ]);
  });

  it("strips Jump to block without inserting when there are no headings", () => {
    const plugin = remarkTogstrekJumpTo();
    const tree: TestRoot = {
      type: "root",
      children: [
        {
          type: "paragraph" as const,
          children: [{ type: "text" as const, value: "Jump to..." }],
        },
        {
          type: "list" as const,
          ordered: true,
          start: 1,
          spread: false,
          children: [
            {
              type: "listItem" as const,
              spread: false,
              children: [
                {
                  type: "paragraph" as const,
                  children: [
                    {
                      type: "link" as const,
                      url: "#x",
                      title: null,
                      children: [{ type: "text" as const, value: "X" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    plugin(tree as any);
    expect(tree.children).toHaveLength(0);
  });

  it("auto-injects TogstrekJumpTo after first paragraph when ≥2 headings and no legacy block", () => {
    const plugin = remarkTogstrekJumpTo();
    const tree: TestRoot = {
      type: "root",
      children: [
        {
          type: "paragraph" as const,
          children: [{ type: "text" as const, value: "Intro." }],
        },
        {
          type: "heading" as const,
          depth: 2 as const,
          spread: false,
          children: [{ type: "text" as const, value: "First" }],
        },
        {
          type: "heading" as const,
          depth: 2 as const,
          spread: false,
          children: [{ type: "text" as const, value: "Second" }],
        },
      ],
    };
    plugin(tree as any);
    expect(tree.children).toHaveLength(4);
    expect(tree.children[0]?.type).toBe("paragraph");
    expect(tree.children[1]?.type).toBe("mdxJsxFlowElement");
    const jump = tree.children[1];
    if (jump?.type !== "mdxJsxFlowElement") return;
    expect(jump.name).toBe("TogstrekJumpTo");
  });

  it("does not auto-inject when only one heading", () => {
    const plugin = remarkTogstrekJumpTo();
    const tree: TestRoot = {
      type: "root",
      children: [
        {
          type: "paragraph" as const,
          children: [{ type: "text" as const, value: "Intro." }],
        },
        {
          type: "heading" as const,
          depth: 2 as const,
          spread: false,
          children: [{ type: "text" as const, value: "Only" }],
        },
      ],
    };
    plugin(tree as any);
    expect(tree.children).toHaveLength(2);
    expect(tree.children.every((c) => c.type !== "mdxJsxFlowElement")).toBe(true);
  });

  it("fills opt-in TogstrekJumpTo in place and does not auto-inject a second nav", () => {
    const plugin = remarkTogstrekJumpTo();
    const tree: TestRoot = {
      type: "root",
      children: [
        {
          type: "paragraph" as const,
          children: [{ type: "text" as const, value: "Intro." }],
        },
        {
          type: "mdxJsxFlowElement" as const,
          name: "TogstrekJumpTo",
          attributes: [],
          children: [],
        },
        {
          type: "heading" as const,
          depth: 2 as const,
          spread: false,
          children: [{ type: "text" as const, value: "First" }],
        },
        {
          type: "heading" as const,
          depth: 2 as const,
          spread: false,
          children: [{ type: "text" as const, value: "Second" }],
        },
      ],
    };
    plugin(tree as any);
    expect(tree.children).toHaveLength(4);
    expect(tree.children[0]?.type).toBe("paragraph");
    const jump = tree.children[1];
    expect(jump?.type).toBe("mdxJsxFlowElement");
    if (jump?.type !== "mdxJsxFlowElement") return;
    expect(jump.name).toBe("TogstrekJumpTo");
    const payloadAttr = (jump.attributes as any[]).find(
      (a: any) => a?.name === "payload",
    );
    expect(payloadAttr?.type).toBe("mdxJsxAttribute");
    expect(tree.children.filter((c) => c.type === "mdxJsxFlowElement")).toHaveLength(1);
  });
});
