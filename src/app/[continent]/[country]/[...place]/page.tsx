import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekEnglandCountyHubContent } from "@/components/togstrek-hub/togstrek-england-county-hub-content";
import { TogstrekUkNationHubContent } from "@/components/togstrek-hub/togstrek-uk-nation-hub-content";
import { TogstrekPlacePageTemplate } from "@/components/togstrek-place/togstrek-place-page-template";
import {
  buildTogstrekDefaultOpenGraphTitle,
  buildTogstrekMetadata,
} from "@/lib/togstrek-metadata";
import {
  discoverTogstrekPlaceSlugs,
  loadTogstrekPlaceFrontmatterOnly,
  loadTogstrekPlaceMdx,
  togstrekPlaceMdxExists,
  type TogstrekPlaceSlugParams,
} from "@/lib/togstrek-load-place-mdx";
import { togstrekPlacePathFromSegments } from "@/lib/togstrek-place-path";
import {
  discoverTogstrekUkNationHubParams,
  getUkNationLabel,
  isUkNationHubRoute,
  type UkNationSlug,
} from "@/lib/togstrek-uk-nations";
import {
  discoverEnglandCountyHubParams,
  isEnglandCountyHubRoute,
} from "@/lib/togstrek-england-counties";
import { formatSlugLabel, truncateDescription } from "@/lib/togstrek-geo-labels";

type PageParams = TogstrekPlaceSlugParams;

/** Only prebuilt place paths — blocks traversal attempts on dynamic hosts. */
export const dynamicParams = false;

export async function generateStaticParams(): Promise<PageParams[]> {
  return [
    ...discoverTogstrekPlaceSlugs(),
    ...discoverTogstrekUkNationHubParams(),
    ...discoverEnglandCountyHubParams(),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { continent, country, place } = await params;
  if (place.length === 0) {
    return { title: "Place" };
  }

  if (isEnglandCountyHubRoute(continent, country, place)) {
    const countySlug = place[1]!;
    const countyLabel = formatSlugLabel(countySlug);
    const path = `/${continent}/${country}/england/${countySlug}`;
    const description = truncateDescription(
      `Place guides in ${countyLabel}, England — part of A Tog's Trek.`,
      165,
    );
    return buildTogstrekMetadata({
      title: `${countyLabel} · England`,
      description,
      path,
      type: "website",
      openGraphTitle: buildTogstrekDefaultOpenGraphTitle(
        `${countyLabel} · England`,
      ),
      openGraphDescription: description,
    });
  }

  if (isUkNationHubRoute(continent, country, place)) {
    const nation = place[0] as UkNationSlug;
    const nationLabel = getUkNationLabel(nation);
    const path = `/${continent}/${country}/${nation}`;
    const description = truncateDescription(
      `Place guides and photography in ${nationLabel} — part of the United Kingdom collection on A Tog's Trek.`,
      165,
    );
    return buildTogstrekMetadata({
      title: nationLabel,
      description,
      path,
      type: "website",
      openGraphTitle: buildTogstrekDefaultOpenGraphTitle(nationLabel),
      openGraphDescription: description,
    });
  }

  if (!togstrekPlaceMdxExists(continent, country, place)) {
    return { title: "Place" };
  }
  const fm = loadTogstrekPlaceFrontmatterOnly(continent, country, place);
  const path = `/${continent}/${country}/${togstrekPlacePathFromSegments(place)}`;

  return buildTogstrekMetadata({
    title: fm.title,
    description: fm.description,
    path,
    type: "article",
    openGraphDescription: fm.description,
    openGraphImages: fm.heroImage
      ? [
          {
            url: fm.heroImage.src,
            width: fm.heroImage.width,
            height: fm.heroImage.height,
            alt: fm.heroImage.alt,
          },
        ]
      : undefined,
    ...(fm.draft
      ? { robots: { index: false, follow: true } }
      : {}),
  });
}

export default async function TogstrekPlacePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { continent, country, place } = await params;
  if (place.length === 0) {
    notFound();
  }

  if (isEnglandCountyHubRoute(continent, country, place)) {
    return (
      <TogstrekEnglandCountyHubContent countySlug={place[1]!} />
    );
  }

  if (isUkNationHubRoute(continent, country, place)) {
    return <TogstrekUkNationHubContent nation={place[0] as UkNationSlug} />;
  }

  if (!togstrekPlaceMdxExists(continent, country, place)) {
    notFound();
  }

  const { frontmatter, content, omitDescriptionLead } =
    await loadTogstrekPlaceMdx(continent, country, place);

  return (
    <TogstrekPlacePageTemplate
      frontmatter={frontmatter}
      mdxContent={content}
      path={{ continent, country, placeSegments: place }}
      omitDescriptionLead={omitDescriptionLead}
    />
  );
}
