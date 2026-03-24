import type { ReactNode } from "react";

import {
  TogstrekPlacePoiSections,
  TogstrekPlacePoiToc,
} from "@/components/togstrek-place/togstrek-place-poi-sections";
import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
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
  const poiGroups = frontmatter.poiGroups ?? [];

  const breadcrumbItems = [
    {
      href: `/${continent}`,
      label: continent.replace(/-/g, " "),
    },
    {
      href: `/${continent}/${country}`,
      label: country.replace(/-/g, " "),
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
          imagePriority={frontmatter.heroImage.priority}
          eyebrow={place.replace(/-/g, " ")}
          title={frontmatter.title}
          titleId="togstrek-place-hero-title"
        />
      ) : (
        <header className="togstrek-place-header border-b border-tt-border-muted bg-tt-surface-muted">
          <TogstrekContentWidth className="py-tt-12">
            <TogstrekPageTitle id="togstrek-place-title">
              {frontmatter.title}
            </TogstrekPageTitle>
          </TogstrekContentWidth>
        </header>
      )}

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb items={breadcrumbItems} />

        <p className="togstrek-place-lead mt-tt-8 max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-lead leading-tt-relaxed text-tt-text-secondary">
          {frontmatter.description}
        </p>

        {frontmatter.published ? (
          <p className="mt-tt-4 font-tt-body text-tt-small text-tt-text-tertiary">
            Published {frontmatter.published}
            {frontmatter.modified
              ? ` · Updated ${frontmatter.modified}`
              : ""}
          </p>
        ) : null}

        {poiGroups.length > 0 ? (
          <div className="mt-tt-10 max-w-[var(--tt-layout-max-prose)]">
            <TogstrekPlacePoiToc groups={poiGroups} />
          </div>
        ) : null}

        <article className="togstrek-prose togstrek-place-mdx-root mt-tt-12">
          {mdxContent}
        </article>

        {poiGroups.length > 0 ? (
          <TogstrekPlacePoiSections groups={poiGroups} />
        ) : null}
      </TogstrekContentWidth>
    </main>
  );
}
