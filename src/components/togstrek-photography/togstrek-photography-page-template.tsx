import type { ReactNode } from "react";

import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekMdxLightboxScope } from "@/components/togstrek-ui/togstrek-mdx-lightbox-scope";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";
import type { TogstrekOtherWorkMdxFrontmatter } from "@/lib/togstrek-other-work-frontmatter";

function formatSectionLabel(segment: string): string {
  return segment
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type TogstrekPhotographyPageTemplateProps = {
  frontmatter: TogstrekOtherWorkMdxFrontmatter;
  mdxContent: ReactNode;
  slugSegments: string[];
  /** Hide YAML `description` above the article when it duplicates the body opening. */
  omitDescriptionLead?: boolean;
};

export function TogstrekPhotographyPageTemplate({
  frontmatter,
  mdxContent,
  slugSegments,
  omitDescriptionLead = false,
}: TogstrekPhotographyPageTemplateProps) {
  const showDescriptionLead =
    Boolean(frontmatter.description) && !omitDescriptionLead;

  const breadcrumbItems: { href?: string; label: string }[] = [
    { href: "/other-work", label: "Other work" },
  ];
  if (slugSegments.length >= 2) {
    breadcrumbItems.push({
      href: `/other-work/${slugSegments[0]}`,
      label: formatSectionLabel(slugSegments[0]!),
    });
  }
  breadcrumbItems.push({ label: frontmatter.title });

  return (
    <main className="togstrek-photography-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      {frontmatter.heroImage ? (
        <TogstrekPageHero
          variant="article"
          imageSrc={frontmatter.heroImage.src}
          imageAlt={frontmatter.heroImage.alt}
          imageWidth={frontmatter.heroImage.width}
          imageHeight={frontmatter.heroImage.height}
          imagePriority={frontmatter.heroImage.priority}
          eyebrow="Photography"
          title={frontmatter.title}
          titleId="togstrek-photography-hero-title"
        />
      ) : (
        <header className="togstrek-photography-header border-b border-tt-border-muted bg-tt-surface-muted">
          <TogstrekContentWidth className="py-[var(--tt-space-12)]">
            <TogstrekPageTitle id="togstrek-photography-title">
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

        {frontmatter.published ? (
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
          <article className="togstrek-prose togstrek-place-mdx-root mt-[var(--tt-space-12)]">
            {mdxContent}
          </article>
        </TogstrekMdxLightboxScope>
      </TogstrekContentWidth>
    </main>
  );
}
