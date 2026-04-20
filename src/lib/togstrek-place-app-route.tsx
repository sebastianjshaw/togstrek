import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekEnglandCountyHubContent } from "@/components/togstrek-hub/togstrek-england-county-hub-content";
import { TogstrekSwedenLanHubContent } from "@/components/togstrek-hub/togstrek-sweden-lan-hub-content";
import { TogstrekUnitedStatesStateHubContent } from "@/components/togstrek-hub/togstrek-united-states-state-hub-content";
import { TogstrekUkNationHubContent } from "@/components/togstrek-hub/togstrek-uk-nation-hub-content";
import { TogstrekPlacePageTemplate } from "@/components/togstrek-place/togstrek-place-page-template";
import {
  buildTogstrekDefaultOpenGraphTitle,
  buildTogstrekMetadata,
} from "@/lib/togstrek-metadata";
import {
  discoverTogstrekPlaceSlugs,
  listTogstrekDirectChildPlaceSlugsForParent,
  loadTogstrekPlaceFrontmatterOnly,
  loadTogstrekPlaceMdx,
  togstrekPlaceMdxExists,
} from "@/lib/togstrek-load-place-mdx";
import {
  buildTogstrekPlacePublicPath,
  togstrekPlacePathFromSegments,
} from "@/lib/togstrek-place-path";
import { discoverEnglandCountyHubParams } from "@/lib/togstrek-england-counties";
import { discoverSwedenLanHubParams } from "@/lib/togstrek-sweden-lan";
import { discoverUnitedStatesStateHubParams } from "@/lib/togstrek-united-states-state-hubs";
import { discoverTogstrekUkNationHubParams } from "@/lib/togstrek-uk-nations";
import {
  getUkNationLabel,
  isUkNationHubRoute,
  type UkNationSlug,
} from "@/lib/togstrek-uk-nations";
import { isEnglandCountyHubRoute } from "@/lib/togstrek-england-counties";
import { isSwedenLanHubRoute } from "@/lib/togstrek-sweden-lan";
import { isUnitedStatesStateHubRoute } from "@/lib/togstrek-united-states-state-hubs";
import { formatSlugLabel, truncateDescription } from "@/lib/togstrek-geo-labels";

function dedupeStaticParams<T extends Record<string, unknown>>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    const key = JSON.stringify(row);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

/** One segment after country — param name must match `[division]` (Next.js sibling rule). */
export type TogstrekPlaceDivisionLeafStaticParams = {
  continent: string;
  country: string;
  division: string;
};

export function discoverTogstrekPlaceDivisionLeafStaticParams(): TogstrekPlaceDivisionLeafStaticParams[] {
  const fromSlugs = discoverTogstrekPlaceSlugs()
    .filter((s) => s.place.length === 1)
    .map((s) => ({
      continent: s.continent,
      country: s.country,
      division: s.place[0]!,
    }));
  return dedupeStaticParams([
    ...fromSlugs,
    ...discoverTogstrekUkNationHubParams().map((s) => ({
      continent: s.continent,
      country: s.country,
      division: s.place[0]!,
    })),
    ...discoverUnitedStatesStateHubParams().map((s) => ({
      continent: s.continent,
      country: s.country,
      division: s.place[0]!,
    })),
    ...discoverSwedenLanHubParams().map((s) => ({
      continent: s.continent,
      country: s.country,
      division: s.place[0]!,
    })),
  ]);
}

export type TogstrekPlaceDivisionRouteStaticParams = {
  continent: string;
  country: string;
  division: string;
  place: string[];
};

export function discoverTogstrekPlaceDivisionRouteStaticParams(): TogstrekPlaceDivisionRouteStaticParams[] {
  const fromSlugs = discoverTogstrekPlaceSlugs()
    .filter((s) => s.place.length >= 2)
    .map((s) => ({
      continent: s.continent,
      country: s.country,
      division: s.place[0]!,
      place: s.place.slice(1),
    }));
  return dedupeStaticParams([
    ...fromSlugs,
    ...discoverEnglandCountyHubParams().map((s) => ({
      continent: s.continent,
      country: s.country,
      division: s.place[0]!,
      place: s.place.slice(1),
    })),
  ]);
}

export async function generateTogstrekPlaceRouteMetadata(
  continent: string,
  country: string,
  place: string[],
): Promise<Metadata> {
  if (place.length === 0) {
    return { title: "Place" };
  }

  if (isEnglandCountyHubRoute(continent, country, place)) {
    const countySlug = place[1]!;
    const countyLabel = formatSlugLabel(countySlug);
    const path = buildTogstrekPlacePublicPath(continent, country, [
      "england",
      countySlug,
    ]);
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
    const path = buildTogstrekPlacePublicPath(continent, country, [nation]);
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

  if (isUnitedStatesStateHubRoute(continent, country, place)) {
    const stateSlug = place[0]!;
    const stateLabel = formatSlugLabel(stateSlug);
    const path = buildTogstrekPlacePublicPath(continent, country, [stateSlug]);
    const description = truncateDescription(
      `Place guides in ${stateLabel} — United States — part of A Tog's Trek.`,
      165,
    );
    return buildTogstrekMetadata({
      title: `${stateLabel} · United States`,
      description,
      path,
      type: "website",
      openGraphTitle: buildTogstrekDefaultOpenGraphTitle(
        `${stateLabel} · United States`,
      ),
      openGraphDescription: description,
    });
  }

  if (isSwedenLanHubRoute(continent, country, place)) {
    const lanSlug = place[0]!;
    const lanLabel = formatSlugLabel(lanSlug);
    const path = buildTogstrekPlacePublicPath(continent, country, [lanSlug]);
    const description = truncateDescription(
      `Place guides in ${lanLabel}, Sweden — part of A Tog's Trek.`,
      165,
    );
    return buildTogstrekMetadata({
      title: `${lanLabel} · Sweden`,
      description,
      path,
      type: "website",
      openGraphTitle: buildTogstrekDefaultOpenGraphTitle(`${lanLabel} · Sweden`),
      openGraphDescription: description,
    });
  }

  if (!togstrekPlaceMdxExists(continent, country, place)) {
    return { title: "Place" };
  }
  const fm = loadTogstrekPlaceFrontmatterOnly(continent, country, place);
  const path = buildTogstrekPlacePublicPath(continent, country, place);

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

export async function TogstrekPlaceAppRoute({
  continent,
  country,
  place,
}: {
  continent: string;
  country: string;
  place: string[];
}) {
  if (place.length === 0) {
    notFound();
  }

  if (isEnglandCountyHubRoute(continent, country, place)) {
    return <TogstrekEnglandCountyHubContent countySlug={place[1]!} />;
  }

  if (isUkNationHubRoute(continent, country, place)) {
    return <TogstrekUkNationHubContent nation={place[0] as UkNationSlug} />;
  }

  if (isUnitedStatesStateHubRoute(continent, country, place)) {
    return <TogstrekUnitedStatesStateHubContent stateSlug={place[0]!} />;
  }

  if (isSwedenLanHubRoute(continent, country, place)) {
    return <TogstrekSwedenLanHubContent lanSlug={place[0]!} />;
  }

  if (!togstrekPlaceMdxExists(continent, country, place)) {
    notFound();
  }

  const { frontmatter, content, omitDescriptionLead } =
    await loadTogstrekPlaceMdx(continent, country, place);

  const childRows = listTogstrekDirectChildPlaceSlugsForParent(
    continent,
    country,
    place,
  );
  const regionChildPlaces = childRows.map(({ place: segs }) => {
    const fm = loadTogstrekPlaceFrontmatterOnly(continent, country, segs);
    const tail = togstrekPlacePathFromSegments(segs);
    return {
      key: tail,
      href: buildTogstrekPlacePublicPath(continent, country, segs),
      title: fm.title,
      description: truncateDescription(fm.description),
      imageSrc: fm.heroImage?.src,
      imageAlt: fm.heroImage?.alt,
    };
  });

  return (
    <TogstrekPlacePageTemplate
      frontmatter={frontmatter}
      mdxContent={content}
      path={{ continent, country, placeSegments: place }}
      omitDescriptionLead={omitDescriptionLead}
      regionChildPlaces={regionChildPlaces}
    />
  );
}
