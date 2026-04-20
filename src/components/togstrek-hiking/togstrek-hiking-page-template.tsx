import type { ReactNode } from "react";

import { TogstrekHikingHubGroupList } from "@/components/togstrek-hiking/togstrek-hiking-hub-group-list";
import { TogstrekHikingHubHero } from "@/components/togstrek-hiking/togstrek-hiking-hub-hero";
import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekDescriptionLead } from "@/components/togstrek-ui/togstrek-description-lead";
import { TogstrekPublishedDate } from "@/components/togstrek-ui/togstrek-published-date";
import { TogstrekPageHeroFallbackHeader } from "@/components/togstrek-ui/togstrek-page-hero-fallback-header";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import { TogstrekHikingMapSection } from "@/components/togstrek-hiking/togstrek-hiking-map-section";
import { TogstrekHikingPostSeriesNav } from "@/components/togstrek-hiking/togstrek-hiking-post-series-nav";
import { TogstrekJsonLd } from "@/components/togstrek-seo/togstrek-json-ld";
import { TogstrekMdxLightboxScope } from "@/components/togstrek-ui/togstrek-mdx-lightbox-scope";
import {
  getTogstrekHikingHubGroupEntries,
  getTogstrekHikingHubStandalonePostEntries,
  getTogstrekHikingPostSequentialNeighbors,
  getTogstrekHikingPostsInGroup,
} from "@/lib/togstrek-hiking-hub-entries";
import type { TogstrekHikingMdxFrontmatter } from "@/lib/togstrek-hiking-frontmatter";
import {
  buildTogstrekHikingMapPlaces,
  buildTogstrekHikingMapPlacesForGroup,
} from "@/lib/togstrek-hiking-map-data";
import { formatSlugLabel } from "@/lib/togstrek-geo-labels";
import {
  buildTogstrekHikingBreadcrumbItems,
  togstrekHikingHubOrGroupJsonLdGraph,
  togstrekHikingPostRichJsonLdGraph,
} from "@/lib/togstrek-json-ld";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";

export type TogstrekHikingPageVariant = "hub" | "group" | "post";

type TogstrekHikingPageTemplateProps = {
  variant: TogstrekHikingPageVariant;
  frontmatter: TogstrekHikingMdxFrontmatter;
  mdxContent: ReactNode;
  /** URL segments under `/hiking` (empty on `/hiking` index). */
  slugSegments: string[];
  /** Hide YAML `description` lead when it duplicates the MDX body opening. */
  omitDescriptionLead?: boolean;
};

export function TogstrekHikingPageTemplate({
  variant,
  frontmatter,
  mdxContent,
  slugSegments,
  omitDescriptionLead = false,
}: TogstrekHikingPageTemplateProps) {
  const isHub = variant === "hub";
  const isGroup = variant === "group";
  const isPost = variant === "post";
  const showDescriptionLead =
    Boolean(frontmatter.description) && !omitDescriptionLead;

  const hubGroupEntries = isHub ? getTogstrekHikingHubGroupEntries() : [];
  const hubStandaloneEntries = isHub
    ? getTogstrekHikingHubStandalonePostEntries()
    : [];
  const groupPostEntries =
    isGroup && slugSegments.length > 0
      ? getTogstrekHikingPostsInGroup(slugSegments)
      : [];

  const hubMapPlaces = isHub ? buildTogstrekHikingMapPlaces() : [];
  const groupMapPlaces =
    isGroup && slugSegments.length > 0
      ? buildTogstrekHikingMapPlacesForGroup(slugSegments)
      : [];

  const hikingPostSeriesNeighbors =
    isPost && slugSegments.length >= 2
      ? getTogstrekHikingPostSequentialNeighbors(slugSegments)
      : null;
  const showHikingPostSeriesNav =
    hikingPostSeriesNeighbors != null &&
    (hikingPostSeriesNeighbors.prev != null ||
      hikingPostSeriesNeighbors.next != null);

  const breadcrumbItems =
    slugSegments.length === 0
      ? [{ label: frontmatter.title }]
      : (() => {
          const items: { href?: string; label: string }[] = [
            { href: "/hiking", label: "Hiking" },
          ];
          for (let i = 0; i < slugSegments.length - 1; i++) {
            const seg = slugSegments[i]!;
            items.push({
              href: `/hiking/${slugSegments.slice(0, i + 1).join("/")}`,
              label: formatSlugLabel(seg),
            });
          }
          items.push({ label: frontmatter.title });
          return items;
        })();

  const eyebrow =
    slugSegments.length > 0
      ? formatSlugLabel(slugSegments[slugSegments.length - 1]!)
      : "Trails";

  const hikingPostPath =
    isPost && slugSegments.length > 0
      ? `/hiking/${slugSegments.join("/")}`
      : null;

  const hikingPagePath =
    slugSegments.length === 0
      ? "/hiking"
      : `/hiking/${slugSegments.join("/")}`;

  const hikingBreadcrumbItems = buildTogstrekHikingBreadcrumbItems(
    slugSegments,
    frontmatter.title,
  );

  return (
    <main className="togstrek-hiking-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      {isPost && hikingPostPath ? (
        <TogstrekJsonLd
          data={togstrekHikingPostRichJsonLdGraph({
            headline: frontmatter.title,
            description: frontmatter.description,
            urlPath: hikingPostPath,
            datePublished: frontmatter.published,
            dateModified: frontmatter.modified,
            imageUrl: frontmatter.heroImage?.src,
            lat: frontmatter.lat,
            lng: frontmatter.lng,
            trailDistanceKm: frontmatter.trailDistanceKm,
            trailDifficulty: frontmatter.trailDifficulty,
            trailTransport: frontmatter.trailTransport,
            breadcrumb: hikingBreadcrumbItems,
          })}
        />
      ) : (
        <TogstrekJsonLd
          data={togstrekHikingHubOrGroupJsonLdGraph({
            name: frontmatter.title,
            description: frontmatter.description,
            urlPath: hikingPagePath,
            breadcrumb: hikingBreadcrumbItems,
          })}
        />
      )}
      {isHub && frontmatter.heroImage ? (
        <TogstrekHikingHubHero
          heroImage={frontmatter.heroImage}
          pageTitle={frontmatter.title}
        />
      ) : null}

      {(isGroup || isPost) && frontmatter.heroImage ? (
        <TogstrekPageHero
          variant="article"
          imageSrc={frontmatter.heroImage.src}
          imageAlt={frontmatter.heroImage.alt}
          imageWidth={frontmatter.heroImage.width}
          imageHeight={frontmatter.heroImage.height}
          imagePriority={frontmatter.heroImage.priority}
          eyebrow={eyebrow}
          title={frontmatter.title}
          titleId="togstrek-hiking-hero-title"
        />
      ) : null}

      {!frontmatter.heroImage && (isHub || isGroup || isPost) ? (
        <TogstrekPageHeroFallbackHeader
          title={frontmatter.title}
          titleId="togstrek-hiking-title"
        />
      ) : null}

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb items={breadcrumbItems} />

        {showDescriptionLead ? (
          <TogstrekDescriptionLead>{frontmatter.description}</TogstrekDescriptionLead>
        ) : null}

        {isPost ? (
          <TogstrekPublishedDate
            published={frontmatter.published}
            modified={frontmatter.modified}
            descriptionLeadShown={showDescriptionLead}
          />
        ) : null}

        {mdxContent ? (
          <>
            <TogstrekMdxLightboxScope>
              <article className="togstrek-prose togstrek-hiking-mdx-root mt-[var(--tt-space-12)]">
                {mdxContent}
              </article>
            </TogstrekMdxLightboxScope>
            {showHikingPostSeriesNav && hikingPostSeriesNeighbors ? (
              <TogstrekHikingPostSeriesNav
                prev={hikingPostSeriesNeighbors.prev}
                next={hikingPostSeriesNeighbors.next}
              />
            ) : null}
          </>
        ) : null}

        {isHub && hubMapPlaces.length > 0 ? (
          <TogstrekHikingMapSection places={hubMapPlaces} variant="hub" />
        ) : null}

        {isGroup && groupMapPlaces.length > 0 ? (
          <TogstrekHikingMapSection places={groupMapPlaces} variant="group" />
        ) : null}

        {isHub && hubGroupEntries.length > 0 ? (
          <section
            className="togstrek-hiking-hub-multi-day mt-[var(--tt-space-16)] border-t border-tt-border-muted pt-[var(--tt-space-14)]"
            aria-labelledby="togstrek-hiking-multi-day-heading"
          >
            <TogstrekSectionHeader
              id="togstrek-hiking-multi-day-heading"
              title="Multi-day trails"
              description="Collections of stages — open a trail for the full list and map."
            />
            <div className="mt-[var(--tt-space-10)]">
              <TogstrekHikingHubGroupList entries={hubGroupEntries} />
            </div>
          </section>
        ) : null}

        {isHub && hubStandaloneEntries.length > 0 ? (
          <section
            className="togstrek-hiking-hub-standalone-reports mt-[var(--tt-space-16)] border-t border-tt-border-muted pt-[var(--tt-space-14)]"
            aria-labelledby="togstrek-hiking-standalone-heading"
          >
            <TogstrekSectionHeader
              id="togstrek-hiking-standalone-heading"
              title="Trail reports"
              description="Single outings and shorter write-ups — each its own URL, outside the multi-day stage collections."
            />
            <div className="mt-[var(--tt-space-10)]">
              <TogstrekHikingHubGroupList
                entries={hubStandaloneEntries}
                ctaLabel="Read report →"
              />
            </div>
          </section>
        ) : null}

        {isGroup && groupPostEntries.length > 0 ? (
          <section
            className="togstrek-hiking-group-stages mt-[var(--tt-space-16)] border-t border-tt-border-muted pt-[var(--tt-space-14)]"
            aria-labelledby="togstrek-hiking-group-stages-heading"
          >
            <TogstrekSectionHeader
              id="togstrek-hiking-group-stages-heading"
              title="Stages"
              description="Each stage has its own page — photos, map, and notes from the trail."
            />
            <div className="mt-[var(--tt-space-10)]">
              <TogstrekHikingHubGroupList
                entries={groupPostEntries}
                ctaLabel="Read stage →"
                showPublished
              />
            </div>
          </section>
        ) : null}
      </TogstrekContentWidth>
    </main>
  );
}
