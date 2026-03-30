"use client";

import {
  Children,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

import { useTogstrekMdxPhotoGallery } from "@/components/togstrek-ui/togstrek-mdx-photo-gallery";

const MDX_P_CLASS =
  "togstrek-place-mdx-p mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary first:mt-0";

/** Paragraphs must not wrap block-level custom components (e.g. figure). */
function unwrapIfSingleBlockFigure(children: ReactNode): ReactNode | null {
  const nodes = Children.toArray(children).filter((node) => {
    if (node == null) return false;
    if (typeof node === "string") return node.trim() !== "";
    return true;
  });
  if (nodes.length !== 1 || !isValidElement(nodes[0])) return null;
  const el = nodes[0];
  const props = el.props as { className?: string };
  const cn = props.className;
  if (typeof cn === "string" && cn.includes("togstrek-place-mdx-figure")) {
    return el;
  }
  return null;
}

/**
 * MDX `p` — uses a `div` instead of `p` inside {@link TogstrekMdxPhotoGallery} so
 * `figure` / `figcaption` from {@link TogstrekMdxImageLightbox} are not invalid HTML.
 */
export function TogstrekMdxParagraph(
  props: ComponentProps<"p">,
): ReactElement {
  const { children, ...rest } = props;
  const unwrapped = unwrapIfSingleBlockFigure(children);
  if (unwrapped) return <>{unwrapped}</>;

  const inGallery = useTogstrekMdxPhotoGallery();
  if (inGallery) {
    return (
      <div {...rest} className={MDX_P_CLASS}>
        {children}
      </div>
    );
  }

  return (
    <p {...rest} className={MDX_P_CLASS}>
      {children}
    </p>
  );
}
