import type { MDXComponents } from "mdx/types.js";

import { TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK } from "@/components/togstrek-hub/togstrek-country-hub-template";
import { TogstrekMdxAnchor } from "@/components/togstrek-ui/togstrek-mdx-anchor";
import { TogstrekJumpTo } from "@/components/togstrek-ui/togstrek-jump-to";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekMdxImageLightbox } from "@/components/togstrek-ui/togstrek-mdx-image-lightbox";
import { TogstrekMdxParagraph } from "@/components/togstrek-ui/togstrek-mdx-paragraph";
import { TogstrekMdxPhotoGallery } from "@/components/togstrek-ui/togstrek-mdx-photo-gallery";
import { TogstrekMdxYouTubeEmbed } from "@/components/togstrek-ui/togstrek-mdx-youtube-embed";

/**
 * MDX map for prose + travel content: place pages, hiking, photography, and
 * other-work posts (same remark pipeline as `togstrek-mdx-remark-plugins`).
 */
export function getTogstrekPlaceMdxComponents(): MDXComponents {
  return {
    /**
     * Page templates already provide the single document `<h1>`.
     * Treat MDX `# Heading` as a section heading to avoid multiple H1s.
     */
    h1: (props) => (
      <h2
        {...props}
        className="togstrek-place-mdx-h1-as-h2 mt-[var(--tt-space-12)] scroll-mt-[calc(var(--tt-layout-header-height)+var(--tt-space-6))] font-tt-display text-[length:var(--tt-text-title)] font-bold text-tt-text-primary first:mt-0"
      />
    ),
    h2: (props) => (
      <h2
        {...props}
        className="togstrek-place-mdx-h2 mt-[var(--tt-space-12)] scroll-mt-[calc(var(--tt-layout-header-height)+var(--tt-space-6))] font-tt-display text-[length:var(--tt-text-title)] font-bold text-tt-text-primary first:mt-0"
      />
    ),
    h3: (props) => (
      <h3
        {...props}
        className="togstrek-place-mdx-h3 mt-[var(--tt-space-12)] scroll-mt-[calc(var(--tt-layout-header-height)+var(--tt-space-6))] border-t border-tt-border-muted pt-[var(--tt-space-6)] font-tt-display text-[length:var(--tt-text-lead)] font-bold text-tt-text-primary"
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
    a: (props) => <TogstrekMdxAnchor {...props} />,
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
    TogstrekJumpTo: (props: { payload?: string }) =>
      props.payload ? <TogstrekJumpTo payload={props.payload} /> : null,
    /** Responsive image grid + lightbox; wrap consecutive `![alt](url)` blocks. */
    PhotoGallery: (props) => <TogstrekMdxPhotoGallery {...props} />,
    TogstrekMdxPhotoGallery: (props) => <TogstrekMdxPhotoGallery {...props} />,
    TogstrekYouTube: (props) => <TogstrekMdxYouTubeEmbed {...props} />,
    TogstrekMdxCardGrid: ({ className, ...rest }) => (
      <div
        {...rest}
        className={[
          "togstrek-place-mdx-card-grid mt-[var(--tt-space-6)] grid max-w-[min(58rem,100%)] grid-cols-1 gap-4 sm:grid-cols-2",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    ),
    TogstrekMdxPlaceCard: ({
      href,
      title,
      description,
      imageSrc,
      imageAlt,
    }: {
      href?: string;
      title?: string;
      description?: string;
      imageSrc?: string;
      imageAlt?: string;
    }) => {
      if (!href || !title || !description) return null;
      return (
        <TogstrekLinkCard
          variant="region"
          href={href}
          title={title}
          description={description}
          gradient={TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
        />
      );
    },
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
