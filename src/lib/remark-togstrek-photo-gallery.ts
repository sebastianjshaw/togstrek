import type { Image, Paragraph, Root, RootContent, Text } from "mdast";
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx";

/**
 * Groups **two or more** consecutive standalone markdown images at root into
 * `<PhotoGallery>` so MDX pages get the shared grid + lightbox without manual
 * wrappers on every post. Runs after `remark-unwrap-images` (unwrapped `image`
 * nodes at root).
 *
 * Also splits a single paragraph that contains **multiple** `![alt](url)` on
 * one line (common after migration) into one paragraph per image so they can be
 * grouped into the same gallery instead of staying as one invalid prose block.
 */
export function remarkTogstrekPhotoGallery() {
  return (tree: Root): void => {
    flattenMultiImageParagraphs(tree);
    const children = tree.children;
    const next: RootContent[] = [];
    let i = 0;

    while (i < children.length) {
      const node = children[i]!;
      if (!isStandaloneImageBlock(node)) {
        next.push(node);
        i += 1;
        continue;
      }

      const group: RootContent[] = [];
      while (i < children.length && isStandaloneImageBlock(children[i]!)) {
        group.push(children[i]!);
        i += 1;
      }

      if (group.length >= 2) {
        const images = group.map(extractImage);
        const gallery: MdxJsxFlowElement = {
          type: "mdxJsxFlowElement",
          name: "PhotoGallery",
          attributes: [],
          children: images.map((img) => paragraphWithImage(cloneImage(img))),
        };
        next.push(gallery);
      } else {
        next.push(group[0]!);
      }
    }

    tree.children = next;
  };
}

/** Paragraphs that are only images + whitespace → one `paragraph` per image at root. */
function flattenMultiImageParagraphs(tree: Root): void {
  const out: RootContent[] = [];
  for (const node of tree.children) {
    if (node.type !== "paragraph") {
      out.push(node);
      continue;
    }
    const p = node as Paragraph;
    const imgs = imagesFromImageOnlyParagraph(p);
    if (imgs !== null && imgs.length > 1) {
      for (const img of imgs) {
        out.push(paragraphWithImage(cloneImage(img)));
      }
    } else {
      out.push(node);
    }
  }
  tree.children = out;
}

function imagesFromImageOnlyParagraph(p: Paragraph): Image[] | null {
  const images: Image[] = [];
  for (const c of p.children) {
    if (c.type === "image") {
      images.push(c);
    } else if (c.type === "text") {
      const t = c as Text;
      if (!/^\s*$/.test(t.value)) return null;
    } else {
      return null;
    }
  }
  return images.length > 0 ? images : null;
}

function isStandaloneImageBlock(node: RootContent): boolean {
  if (node.type === "image") return true;
  if (node.type === "paragraph") {
    const p = node as Paragraph;
    return (
      p.children.length === 1 &&
      p.children[0] !== undefined &&
      p.children[0].type === "image"
    );
  }
  return false;
}

function extractImage(node: RootContent): Image {
  if (node.type === "image") return node;
  if (node.type === "paragraph") {
    const first = (node as Paragraph).children[0];
    if (first?.type === "image") return first;
  }
  throw new Error("remark-togstrek-photo-gallery: expected image block");
}

function cloneImage(img: Image): Image {
  return { ...img };
}

function paragraphWithImage(img: Image): Paragraph {
  return {
    type: "paragraph",
    children: [img],
  };
}
