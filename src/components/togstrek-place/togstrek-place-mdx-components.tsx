import Image from "next/image";
import type { MDXComponents } from "mdx/types.js";
import { Children, isValidElement, type ReactNode } from "react";

/** Paragraphs must not wrap block-level custom components (e.g. figure). */
function togstrekMdxUnwrapParagraphIfBlockFigure(
  children: ReactNode,
): ReactNode | null {
  const nodes = Children.toArray(children).filter((node) => {
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
 * MDX elements for place pages — semantic HTML, lazy images, design tokens.
 */
export function getTogstrekPlaceMdxComponents(): MDXComponents {
  return {
    h2: (props) => (
      <h2
        {...props}
        className="togstrek-place-mdx-h2 mt-[var(--tt-space-12)] scroll-mt-[calc(var(--tt-layout-header-height)+var(--tt-space-6))] font-tt-display text-[length:var(--tt-text-title)] font-bold text-tt-text-primary first:mt-0"
      />
    ),
    h3: (props) => (
      <h3
        {...props}
        className="togstrek-place-mdx-h3 mt-[var(--tt-space-8)] font-tt-display text-[length:var(--tt-text-lead)] font-semibold text-tt-text-primary"
      />
    ),
    p: ({ children, ...rest }) => {
      const unwrapped = togstrekMdxUnwrapParagraphIfBlockFigure(children);
      if (unwrapped) return unwrapped;
      return (
        <p
          {...rest}
          className="togstrek-place-mdx-p mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary first:mt-0"
        >
          {children}
        </p>
      );
    },
    ul: (props) => (
      <ul
        {...props}
        className="togstrek-place-mdx-ul mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] list-disc pl-[var(--tt-space-6)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary marker:text-tt-accent"
      />
    ),
    ol: (props) => (
      <ol
        {...props}
        className="togstrek-place-mdx-ol mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] list-decimal pl-[var(--tt-space-6)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary"
      />
    ),
    li: (props) => <li {...props} className="togstrek-place-mdx-li mt-2" />,
    a: ({ href, children, ...rest }) => {
      const external = href?.startsWith("http");
      return (
        <a
          href={href}
          {...rest}
          className="togstrek-place-mdx-a text-tt-accent underline decoration-tt-accent/30 underline-offset-2 transition-colors hover:decoration-tt-accent"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
    blockquote: (props) => (
      <blockquote
        {...props}
        className="togstrek-place-mdx-blockquote my-[var(--tt-space-8)] border-l-[3px] border-tt-accent pl-[var(--tt-space-6)] font-tt-body italic text-tt-text-secondary"
      />
    ),
    hr: (props) => (
      <hr
        {...props}
        className="togstrek-place-mdx-hr my-[var(--tt-space-12)] border-tt-border-muted"
      />
    ),
    img: (props) => {
      const { src, alt, width, height, className } = props;
      if (!src || typeof src !== "string") return null;
      const w =
        typeof width === "number" ? width : Number.parseInt(String(width), 10);
      const h =
        typeof height === "number"
          ? height
          : Number.parseInt(String(height), 10);
      const safeW = Number.isFinite(w) && w > 0 ? w : 1200;
      const safeH = Number.isFinite(h) && h > 0 ? h : 800;
      return (
        <figure className="togstrek-place-mdx-figure my-[var(--tt-space-10)] w-full">
          <span className="relative block overflow-hidden rounded-[var(--tt-radius-sm)] border border-tt-border-muted bg-tt-surface-muted">
            <Image
              src={src}
              alt={typeof alt === "string" ? alt : ""}
              width={safeW}
              height={safeH}
              sizes="(max-width: 768px) 100vw, min(56rem, 92vw)"
              loading="lazy"
              className={`h-auto w-full object-cover ${className ?? ""}`}
            />
          </span>
          {alt ? (
            <figcaption className="mt-[var(--tt-space-3)] text-center font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary">
              {alt}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  };
}
