import { describe, expect, it } from "vitest";
import type { Root } from "mdast";

import { remarkTogstrekJumpTo } from "@/lib/remark-togstrek-jump-to";

type MdxJsxAttr = {
  name?: string;
  type?: string;
  value?: string;
};

function asRoot(tree: unknown): Root {
  return tree as Root;
}

/** After `remarkTogstrekJumpTo` mutates the tree, children may include MDX nodes. */
type LooseBlock = {
  type: string;
  name?: string;
  attributes?: unknown;
  children?: unknown[];
};

function looseChildren(t: { children: unknown[] }): LooseBlock[] {
  return t.children as LooseBlock[];
}

describe("remarkTogstrekJumpTo", () => {
  it("replaces Jump to block with TogstrekJumpTo using h2-derived ids", () => {
    const plugin = remarkTogstrekJumpTo();
    const tree = {
      type: "root" as const,
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
    plugin(asRoot(tree));
    const kids = looseChildren(tree);
    expect(kids).toHaveLength(2);
    const first = kids[0]!;
    expect(first.type).toBe("mdxJsxFlowElement");
    if (first.type !== "mdxJsxFlowElement") return;
    expect(first.name).toBe("TogstrekJumpTo");
    const payloadAttr = (first.attributes as MdxJsxAttr[]).find(
      (a) => a.name === "payload",
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
    const tree = {
      type: "root" as const,
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
    plugin(asRoot(tree));
    expect(looseChildren(tree)).toHaveLength(0);
  });

  it("auto-injects TogstrekJumpTo after first paragraph when ≥2 headings and no legacy block", () => {
    const plugin = remarkTogstrekJumpTo();
    const tree = {
      type: "root" as const,
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
    plugin(asRoot(tree));
    const k = looseChildren(tree);
    expect(k).toHaveLength(4);
    expect(k[0]?.type).toBe("paragraph");
    expect(k[1]?.type).toBe("mdxJsxFlowElement");
    const jump = k[1]!;
    if (jump.type !== "mdxJsxFlowElement") return;
    expect(jump.name).toBe("TogstrekJumpTo");
  });

  it("does not auto-inject when only one heading", () => {
    const plugin = remarkTogstrekJumpTo();
    const tree = {
      type: "root" as const,
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
    plugin(asRoot(tree));
    const k1 = looseChildren(tree);
    expect(k1).toHaveLength(2);
    expect(k1.every((c) => c.type !== "mdxJsxFlowElement")).toBe(true);
  });

  it("fills opt-in TogstrekJumpTo in place and does not auto-inject a second nav", () => {
    const plugin = remarkTogstrekJumpTo();
    const tree = {
      type: "root" as const,
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
    plugin(asRoot(tree));
    const k2 = looseChildren(tree);
    expect(k2).toHaveLength(4);
    expect(k2[0]?.type).toBe("paragraph");
    const jump = k2[1]!;
    expect(jump.type).toBe("mdxJsxFlowElement");
    if (jump.type !== "mdxJsxFlowElement") return;
    expect(jump.name).toBe("TogstrekJumpTo");
    const payloadAttr = (jump.attributes as MdxJsxAttr[]).find(
      (a) => a.name === "payload",
    );
    expect(payloadAttr?.type).toBe("mdxJsxAttribute");
    expect(k2.filter((c) => c.type === "mdxJsxFlowElement")).toHaveLength(1);
  });
});
