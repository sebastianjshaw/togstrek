import GithubSlugger from "github-slugger";
import type {
  Heading,
  Link,
  List,
  ListItem,
  Paragraph,
  Root,
  RootContent,
} from "mdast";
import type {
  MdxJsxAttribute,
  MdxJsxFlowElement,
} from "mdast-util-mdx-jsx";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import type { Node } from "unist";

export type TogstrekJumpToItem = {
  id: string;
  depth: 2 | 3;
  label: string;
};

/** Avoid 50+ item jump lists on `###`-only pages; still covers typical long guides. */
const MAX_JUMP_TO_ITEMS = 24;

/** Auto-insert TOC only when there are at least this many outline entries. */
const MIN_HEADINGS_FOR_AUTO_JUMP_TO = 2;

/**
 * Replaces legacy “Jump to…” manual `<ol>` blocks with `<TogstrekJumpTo />`.
 * Heading `id`s are computed with `github-slugger` (same as `rehype-slug`) so
 * anchors stay in sync with `##` / `###` titles.
 *
 * **Outline source:** if the document has any **`##`** headings, the TOC lists
 * those only (chapter-level). Otherwise it lists **`###`** headings. At most
 * {@link MAX_JUMP_TO_ITEMS} entries — on huge `###`-only pages, add **`##`**
 * section buckets so the outline rolls up instead of truncating mid-page.
 *
 * **Auto TOC:** when there is no legacy block and no `<TogstrekJumpTo />` yet, but
 * the outline has at least {@link MIN_HEADINGS_FOR_AUTO_JUMP_TO} entries, a jump
 * nav is inserted after the first root-level paragraph (or at the top if none).
 *
 * **Optional `<TogstrekJumpTo />`:** a literal component in MDX (no `payload`, or
 * empty) is filled with the same heading-derived payload and **suppresses** the
 * auto-insert, so the nav renders exactly where you placed it in the source order.
 */
export function remarkTogstrekJumpTo() {
  return (tree: Root): void => {
    const items = collectJumpToItems(tree);
    tree.children = transformChildren(tree.children, items);
    fillOptInJumpToComponents(tree, items);
    maybeAutoInjectJumpTo(tree, items);
  };
}

function collectJumpToItems(tree: Root): TogstrekJumpToItem[] {
  const slugger = new GithubSlugger();
  const h2: Heading[] = [];
  const h3: Heading[] = [];
  visit(tree, "heading", (node: Heading) => {
    if (node.depth === 2) h2.push(node);
    else if (node.depth === 3) h3.push(node);
  });
  const source: Heading[] = h2.length > 0 ? h2 : h3;
  const out: TogstrekJumpToItem[] = [];
  for (const h of source) {
    const label = toString(h).trim();
    if (!label) continue;
    const id = slugger.slug(label);
    out.push({ id, depth: h.depth as 2 | 3, label });
    if (out.length >= MAX_JUMP_TO_ITEMS) break;
  }
  return out;
}

function transformChildren(
  children: RootContent[],
  items: TogstrekJumpToItem[],
): RootContent[] {
  const out: RootContent[] = [];
  let i = 0;
  while (i < children.length) {
    const block = matchJumpToBlock(children, i);
    if (block) {
      if (items.length > 0) {
        out.push(makeJumpToElement(items));
      }
      i = block.end;
      continue;
    }
    out.push(children[i]!);
    i += 1;
  }
  return out;
}

function matchJumpToBlock(
  children: RootContent[],
  start: number,
): { end: number } | null {
  if (!isJumpToParagraph(children[start])) return null;
  const listIdx = start + 1;
  if (listIdx >= children.length) return null;
  const listNode = children[listIdx];
  if (!listNode || !isJumpToOrderedHashList(listNode)) return null;
  return { end: listIdx + 1 };
}

function isJumpToParagraph(node: RootContent | undefined): boolean {
  if (!node || node.type !== "paragraph") return false;
  const t = toString(node as Paragraph).trim();
  return /^jump to\.{0,3}\s*$/i.test(t);
}

function isJumpToOrderedHashList(node: RootContent): boolean {
  if (node.type !== "list") return false;
  const list = node as List;
  if (!list.ordered || list.children.length === 0) return false;
  for (const item of list.children) {
    if (!listItemHasHashLink(item)) return false;
  }
  return true;
}

function listItemHasHashLink(item: ListItem): boolean {
  let found = false;
  visit(item as Node, "link", (node: Link) => {
    if (node.url.startsWith("#")) found = true;
  });
  return found;
}

function makeJumpToElement(items: TogstrekJumpToItem[]): MdxJsxFlowElement {
  const payload = encodeJumpToPayload(items);
  const attr: MdxJsxAttribute = {
    type: "mdxJsxAttribute",
    name: "payload",
    value: payload,
  };
  return {
    type: "mdxJsxFlowElement",
    name: "TogstrekJumpTo",
    attributes: [attr],
    children: [],
  };
}

function encodeJumpToPayload(items: TogstrekJumpToItem[]): string {
  return Buffer.from(JSON.stringify(items), "utf8").toString("base64");
}

function fillOptInJumpToComponents(
  tree: Root,
  items: TogstrekJumpToItem[],
): void {
  if (items.length === 0) return;
  visit(tree, "mdxJsxFlowElement", (node: MdxJsxFlowElement) => {
    if (node.name !== "TogstrekJumpTo") return;
    const hasPayload = node.attributes.some(
      (a) =>
        a.type === "mdxJsxAttribute" &&
        a.name === "payload" &&
        a.value !== null &&
        a.value !== undefined,
    );
    if (hasPayload) return;
    node.attributes = [
      {
        type: "mdxJsxAttribute",
        name: "payload",
        value: encodeJumpToPayload(items),
      },
    ];
  });
}

/** Any `<TogstrekJumpTo />` in the tree (legacy replacement, opt-in, or prior pass). */
function hasTogstrekJumpToElement(tree: Root): boolean {
  let found = false;
  visit(tree, "mdxJsxFlowElement", (node: MdxJsxFlowElement) => {
    if (node.name === "TogstrekJumpTo") found = true;
  });
  return found;
}

/**
 * First paragraph end — skip `mdxjsEsm` (import) nodes at the top of the file.
 */
function insertIndexAfterFirstParagraph(children: RootContent[]): number {
  for (let i = 0; i < children.length; i++) {
    const n = children[i]!;
    if ((n as { type?: string }).type === "mdxjsEsm") continue;
    if (n.type === "paragraph") return i + 1;
  }
  return 0;
}

function maybeAutoInjectJumpTo(tree: Root, items: TogstrekJumpToItem[]): void {
  if (items.length < MIN_HEADINGS_FOR_AUTO_JUMP_TO) return;
  if (hasTogstrekJumpToElement(tree)) return;
  const insertAt = insertIndexAfterFirstParagraph(tree.children);
  tree.children.splice(insertAt, 0, makeJumpToElement(items));
}
