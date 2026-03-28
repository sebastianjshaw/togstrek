import type { ReactNode } from "react";

import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekMdxLightboxScope } from "@/components/togstrek-ui/togstrek-mdx-lightbox-scope";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { formatSlugLabel } from "@/lib/togstrek-geo-labels";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";
import type { TogstrekPlaceMdxFrontmatter } from "@/lib/togstrek-place-frontmatter";

type TogstrekPlacePageTemplateProps = {
  frontmatter: TogstrekPlaceMdxFrontmatter;
  mdxContent: ReactNode;
  path: { continent: string; country: string; place: string };
};

export function TogstrekPlacePageTemplate({
  frontmatter,
  mdxContent,
  path,
}: TogstrekPlacePageTemplateProps) {
  const { continent, country, place } = path;

  const breadcrumbItems = [
    {
      href: `/${continent}`,
      label: formatSlugLabel(continent),
    },
    {
      href: `/${continent}/${country}`,
      label: formatSlugLabel(country),
    },
    { label: frontmatter.title },
  ];

  return (
    <main className="togstrek-place-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      {frontmatter.heroImage ? (
        <TogstrekPageHero
          variant="article"
          imageSrc={frontmatter.heroImage.src}
          imageAlt={frontmatter.heroImage.alt}
          imageWidth={frontmatter.heroImage.width}
          imageHeight={frontmatter.heroImage.height}
          imagePriority={frontmatter.heroImage.priority}
          eyebrow={formatSlugLabel(place)}
          title={frontmatter.title}
          titleId="togstrek-place-hero-title"
        />
      ) : (
        <header className="togstrek-place-header border-b border-tt-border-muted bg-tt-surface-muted">
          <TogstrekContentWidth className="py-[var(--tt-space-12)]">
            <TogstrekPageTitle id="togstrek-place-title">
              {frontmatter.title}
            </TogstrekPageTitle>
          </TogstrekContentWidth>
        </header>
      )}

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb items={breadcrumbItems} />

        <p className="togstrek-place-lead mt-[var(--tt-space-8)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          {frontmatter.description}
        </p>

        {frontmatter.published ? (
          <p className="mt-[var(--tt-space-4)] font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary">
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
