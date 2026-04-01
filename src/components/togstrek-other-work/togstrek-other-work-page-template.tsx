import type { ReactNode } from "react";

import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekMdxLightboxScope } from "@/components/togstrek-ui/togstrek-mdx-lightbox-scope";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";
import type { TogstrekPageHeroQuote } from "@/components/togstrek-page-hero";
import type { TogstrekOtherWorkMdxFrontmatter } from "@/lib/togstrek-other-work-frontmatter";

type TogstrekOtherWorkPageTemplateProps = {
  frontmatter: TogstrekOtherWorkMdxFrontmatter;
  mdxContent: ReactNode;
  /** URL segments under `/other-work` (empty on the hub). */
  slugSegments: string[];
  /** Hide YAML `description` lead on article pages when it duplicates the body opening. */
  omitDescriptionLead?: boolean;
};

export function TogstrekOtherWorkPageTemplate({
  frontmatter,
  mdxContent,
  slugSegments,
  omitDescriptionLead = false,
}: TogstrekOtherWorkPageTemplateProps) {
  const isHub = slugSegments.length === 0;
  const showDescriptionLead =
    !isHub && Boolean(frontmatter.description) && !omitDescriptionLead;

  const hubHeroQuote: TogstrekPageHeroQuote | undefined =
    isHub && frontmatter.heroQuote
      ? {
          children: frontmatter.heroQuote,
          ...(frontmatter.heroQuoteAttribution
            ? { attribution: frontmatter.heroQuoteAttribution }
            : {}),
        }
      : undefined;

  const breadcrumbItems =
    isHub
      ? [{ label: frontmatter.title }]
      : [
          { href: "/other-work", label: "Other work" },
          { label: frontmatter.title },
        ];

  return (
    <main className="togstrek-other-work-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      {frontmatter.heroImage ? (
        <TogstrekPageHero
          variant="article"
          imageSrc={frontmatter.heroImage.src}
          imageAlt={frontmatter.heroImage.alt}
          imageWidth={frontmatter.heroImage.width}
          imageHeight={frontmatter.heroImage.height}
          imagePriority={frontmatter.heroImage.priority}
          eyebrow={isHub ? "Portfolio" : "Other work"}
          title={frontmatter.title}
          titleId="togstrek-other-work-hero-title"
          quote={hubHeroQuote}
        />
      ) : (
        <header className="togstrek-other-work-header border-b border-tt-border-muted bg-tt-surface-muted">
          <TogstrekContentWidth className="py-[var(--tt-space-12)]">
            <TogstrekPageTitle id="togstrek-other-work-title">
              {frontmatter.title}
            </TogstrekPageTitle>
          </TogstrekContentWidth>
        </header>
      )}

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb items={breadcrumbItems} />

        {showDescriptionLead ? (
          <p className="togstrek-place-lead mt-[var(--tt-space-8)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
            {frontmatter.description}
          </p>
        ) : null}

        {!isHub && frontmatter.published ? (
          <p
            className={`font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary ${
              showDescriptionLead
                ? "mt-[var(--tt-space-4)]"
                : "mt-[var(--tt-space-8)]"
            }`}
          >
            Published {frontmatter.published}
            {frontmatter.modified
              ? ` · Updated ${frontmatter.modified}`
              : ""}
          </p>
        ) : null}

        <TogstrekMdxLightboxScope>
          <article
            className={
              isHub
                ? "togstrek-prose togstrek-place-mdx-root mt-[var(--tt-space-8)] max-w-none"
                : "togstrek-prose togstrek-place-mdx-root mt-[var(--tt-space-12)]"
            }
          >
            {mdxContent}
          </article>
        </TogstrekMdxLightboxScope>
      </TogstrekContentWidth>
    </main>
  );
}
