import type { ReactNode } from "react";

import {
  TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK,
} from "@/components/togstrek-hub/togstrek-country-hub-template";
import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekJsonLd } from "@/components/togstrek-seo/togstrek-json-ld";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekDescriptionLead } from "@/components/togstrek-ui/togstrek-description-lead";
import { TogstrekPublishedDate } from "@/components/togstrek-ui/togstrek-published-date";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekMdxLightboxScope } from "@/components/togstrek-ui/togstrek-mdx-lightbox-scope";
import { TogstrekPageHeroFallbackHeader } from "@/components/togstrek-ui/togstrek-page-hero-fallback-header";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import { formatSlugLabel } from "@/lib/togstrek-geo-labels";
import {
  buildTogstrekPlaceBreadcrumbJsonLdItems,
  buildTogstrekPlaceBreadcrumbUiItems,
} from "@/lib/togstrek-place-breadcrumb";
import { togstrekPlaceLeafSegment, togstrekPlacePathFromSegments } from "@/lib/togstrek-place-path";
import { togstrekPlacePageJsonLdGraph } from "@/lib/togstrek-json-ld";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";
import type { TogstrekPlaceMdxFrontmatter } from "@/lib/togstrek-place-frontmatter";

/** Child place cards for regional hubs (e.g. Svalbard → Longyearbyen); built in `page.tsx`. */
export type TogstrekPlaceRegionChildCard = {
  key: string;
  href: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
};

type TogstrekPlacePageTemplateProps = {
  frontmatter: TogstrekPlaceMdxFrontmatter;
  mdxContent: ReactNode;
  path: { continent: string; country: string; placeSegments: string[] };
  /** Hide YAML `description` lead when it duplicates the MDX body opening. */
  omitDescriptionLead?: boolean;
  /** Direct child place pages one segment below this URL (template grid; same pattern as country hubs). */
  regionChildPlaces?: TogstrekPlaceRegionChildCard[];
};

export function TogstrekPlacePageTemplate({
  frontmatter,
  mdxContent,
  path,
  omitDescriptionLead = false,
  regionChildPlaces,
}: TogstrekPlacePageTemplateProps) {
  const { continent, country, placeSegments } = path;
  const placePathTail = togstrekPlacePathFromSegments(placeSegments);
  const placeLeaf = togstrekPlaceLeafSegment(placeSegments);
  const showDescriptionLead =
    Boolean(frontmatter.description) && !omitDescriptionLead;

  const placePath = `/${continent}/${country}/${placePathTail}`;

  const breadcrumbItems = buildTogstrekPlaceBreadcrumbUiItems(
    continent,
    country,
    placeSegments,
    frontmatter.title,
  );

  const placeBreadcrumbItems = buildTogstrekPlaceBreadcrumbJsonLdItems(
    continent,
    country,
    placeSegments,
    frontmatter.title,
    placePath,
  );

  return (
    <main
      className="togstrek-place-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]"
      {...(frontmatter.draft ? { "data-pagefind-ignore": true } : {})}
    >
      <TogstrekJsonLd
        data={togstrekPlacePageJsonLdGraph({
          name: frontmatter.title,
          description: frontmatter.description,
          urlPath: placePath,
          latitude: frontmatter.lat,
          longitude: frontmatter.lng,
          imageUrl: frontmatter.heroImage?.src,
          breadcrumb: placeBreadcrumbItems,
        })}
      />
      {frontmatter.heroImage ? (
        <TogstrekPageHero
          variant="article"
          imageSrc={frontmatter.heroImage.src}
          imageAlt={frontmatter.heroImage.alt}
          imageWidth={frontmatter.heroImage.width}
          imageHeight={frontmatter.heroImage.height}
          imagePriority={frontmatter.heroImage.priority}
          eyebrow={formatSlugLabel(placeLeaf)}
          title={frontmatter.title}
          titleId="togstrek-place-hero-title"
        />
      ) : (
        <TogstrekPageHeroFallbackHeader
          title={frontmatter.title}
          titleId="togstrek-place-title"
        />
      )}

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb items={breadcrumbItems} />

        {showDescriptionLead ? (
          <TogstrekDescriptionLead>{frontmatter.description}</TogstrekDescriptionLead>
        ) : null}

        <TogstrekPublishedDate
          published={frontmatter.published}
          modified={frontmatter.modified}
          descriptionLeadShown={showDescriptionLead}
        />

        <TogstrekMdxLightboxScope>
          <article className="togstrek-prose togstrek-place-mdx-root mt-[var(--tt-space-12)]">
            {mdxContent}
          </article>
        </TogstrekMdxLightboxScope>

        {regionChildPlaces && regionChildPlaces.length > 0 ? (
          <section
            className="togstrek-place-region-children mt-[var(--tt-space-16)] border-t border-tt-border-muted pt-[var(--tt-space-14)]"
            aria-labelledby="togstrek-place-region-children-heading"
          >
            <TogstrekSectionHeader
              id="togstrek-place-region-children-heading"
              title={`Places in ${frontmatter.title}`}
              description="Open a place for photos, maps, and field notes."
            />
            <ul className="togstrek-place-region-children-grid mt-[var(--tt-space-10)] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {regionChildPlaces.map((c) => (
                <li
                  key={c.key}
                  className="togstrek-place-region-children-item min-h-[var(--tt-region-card-min-height)] min-w-0"
                >
                  <TogstrekLinkCard
                    variant="region"
                    href={c.href}
                    title={c.title}
                    description={c.description}
                    gradient={TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK}
                    imageSrc={c.imageSrc}
                    imageAlt={c.imageAlt}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </TogstrekContentWidth>
    </main>
  );
}
