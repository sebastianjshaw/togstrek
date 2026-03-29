import type { MDXComponents } from "mdx/types.js";

import { TOGSTREK_BODY_LINK_CLASSNAME } from "@/components/togstrek-ui/togstrek-body-link";
import { TogstrekMdxImageLightbox } from "@/components/togstrek-ui/togstrek-mdx-image-lightbox";
import { TogstrekMdxParagraph } from "@/components/togstrek-ui/togstrek-mdx-paragraph";
import { TogstrekMdxPhotoGallery } from "@/components/togstrek-ui/togstrek-mdx-photo-gallery";

/**
 * MDX map for prose + travel content: place pages, hiking, photography, and
 * other-work posts (same remark pipeline as `togstrek-mdx-remark-plugins`).
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
    p: (props) => <TogstrekMdxParagraph {...props} />,
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
          className={`togstrek-place-mdx-a ${TOGSTREK_BODY_LINK_CLASSNAME}`}
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
    /** Responsive image grid + lightbox; wrap consecutive `![alt](url)` blocks. */
    PhotoGallery: (props) => <TogstrekMdxPhotoGallery {...props} />,
    TogstrekMdxPhotoGallery: (props) => <TogstrekMdxPhotoGallery {...props} />,
    img: ({ className, ...rest }) => (
      <TogstrekMdxImageLightbox
        {...rest}
        className={["togstrek-place-mdx-figure", className]
          .filter(Boolean)
          .join(" ")}
      />
    ),
  };
}
