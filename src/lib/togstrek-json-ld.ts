import {
  getTogstrekAboutPathAbsolute,
  getTogstrekAuthorPersonId,
  getTogstrekAuthorSameAs,
  TOGSTREK_AUTHOR_NAME,
} from "@/lib/togstrek-author";
import { formatSlugLabel } from "@/lib/togstrek-geo-labels";
import { getTogstrekSiteOrigin } from "@/lib/togstrek-site-url";

const SITE_NAME = "A Tog's Trek";

const SITE_DESCRIPTION =
  "Curious travel guides and photo essays — countries, places, hikes, and the stories behind the frame.";

function buildTogstrekWebSiteNode(): Record<string, unknown> {
  const origin = getTogstrekSiteOrigin().replace(/\/+$/, "");
  const personId = getTogstrekAuthorPersonId();
  return {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: SITE_NAME,
    url: `${origin}/`,
    description: SITE_DESCRIPTION,
    author: { "@id": personId },
    publisher: {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: SITE_NAME,
      url: `${origin}/`,
    },
  };
}

function buildTogstrekPersonNode(): Record<string, unknown> {
  const personId = getTogstrekAuthorPersonId();
  const node: Record<string, unknown> = {
    "@type": "Person",
    "@id": personId,
    name: TOGSTREK_AUTHOR_NAME,
    url: getTogstrekAboutPathAbsolute(),
    jobTitle: "Travel photographer and writer",
    homeLocation: {
      "@type": "Place",
      name: "Gothenburg",
    },
  };
  const sameAs = getTogstrekAuthorSameAs();
  if (sameAs.length > 0) {
    node.sameAs = sameAs;
  }
  return node;
}

/** Site-wide `WebSite` + `Person` (`@id` …/about#person) for layout. */
export function togstrekLayoutJsonLdGraph(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [buildTogstrekWebSiteNode(), buildTogstrekPersonNode()],
  };
}

/** @deprecated Prefer `togstrekLayoutJsonLdGraph` (includes Person). */
export function togstrekWebSiteJsonLd(): Record<string, unknown> {
  const origin = getTogstrekSiteOrigin().replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${origin}/`,
    description: SITE_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: `${origin}/`,
    },
  };
}

function togstrekAbsoluteUrl(path: string): string {
  const origin = getTogstrekSiteOrigin().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

function togstrekBreadcrumbListSchema(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: togstrekAbsoluteUrl(item.path),
    })),
  };
}

/** URL segments under `/hiking` plus page title — matches visible breadcrumbs. */
export function buildTogstrekHikingBreadcrumbItems(
  slugSegments: string[],
  pageTitle: string,
): { name: string; path: string }[] {
  if (slugSegments.length === 0) {
    return [{ name: pageTitle, path: "/hiking" }];
  }
  const items: { name: string; path: string }[] = [
    { name: "Hiking", path: "/hiking" },
  ];
  for (let i = 0; i < slugSegments.length - 1; i++) {
    items.push({
      name: formatSlugLabel(slugSegments[i]!),
      path: `/hiking/${slugSegments.slice(0, i + 1).join("/")}`,
    });
  }
  items.push({
    name: pageTitle,
    path: `/hiking/${slugSegments.join("/")}`,
  });
  return items;
}

export function togstrekPlaceJsonLd(input: {
  name: string;
  description: string;
  urlPath: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}): Record<string, unknown> {
  const url = togstrekAbsoluteUrl(input.urlPath);
  const o: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: input.name,
    description: input.description,
    url,
    isAccessibleForFree: true,
  };
  if (
    typeof input.latitude === "number" &&
    typeof input.longitude === "number"
  ) {
    o.geo = {
      "@type": "GeoCoordinates",
      latitude: input.latitude,
      longitude: input.longitude,
    };
  }
  if (input.imageUrl) {
    o.image = [input.imageUrl];
  }
  return o;
}

/** Tourist attraction + BreadcrumbList in one `@graph` (place detail pages). */
export function togstrekPlacePageJsonLdGraph(input: {
  name: string;
  description: string;
  urlPath: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  breadcrumb: { name: string; path: string }[];
}): Record<string, unknown> {
  const url = togstrekAbsoluteUrl(input.urlPath);
  const tourist: Record<string, unknown> = {
    "@type": "TouristAttraction",
    "@id": `${url}#place`,
    name: input.name,
    description: input.description,
    url,
    isAccessibleForFree: true,
  };
  if (
    typeof input.latitude === "number" &&
    typeof input.longitude === "number"
  ) {
    tourist.geo = {
      "@type": "GeoCoordinates",
      latitude: input.latitude,
      longitude: input.longitude,
    };
  }
  if (input.imageUrl) {
    tourist.image = [input.imageUrl];
  }
  return {
    "@context": "https://schema.org",
    "@graph": [tourist, togstrekBreadcrumbListSchema(input.breadcrumb)],
  };
}

export function togstrekHikingArticleJsonLd(input: {
  headline: string;
  description: string;
  urlPath: string;
  datePublished?: string;
  dateModified?: string;
  imageUrl?: string;
}): Record<string, unknown> {
  const url = togstrekAbsoluteUrl(input.urlPath);
  const origin = getTogstrekSiteOrigin().replace(/\/+$/, "");
  const o: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url,
    author: {
      "@id": getTogstrekAuthorPersonId(),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: `${origin}/`,
    },
  };
  if (input.datePublished) o.datePublished = input.datePublished;
  if (input.dateModified) o.dateModified = input.dateModified;
  if (input.imageUrl) o.image = [input.imageUrl];
  return o;
}

function togstrekTrailPropertyValues(input: {
  trailDistanceKm?: number;
  trailDifficulty?: string;
  trailTransport?: string;
}): Record<string, unknown>[] {
  const props: Record<string, unknown>[] = [];
  if (typeof input.trailDistanceKm === "number") {
    props.push({
      "@type": "PropertyValue",
      name: "distance",
      value: input.trailDistanceKm,
      unitText: "km",
    });
  }
  if (input.trailDifficulty?.trim()) {
    props.push({
      "@type": "PropertyValue",
      name: "difficulty",
      value: input.trailDifficulty.trim(),
    });
  }
  if (input.trailTransport?.trim()) {
    props.push({
      "@type": "PropertyValue",
      name: "transport",
      value: input.trailTransport.trim(),
    });
  }
  return props;
}

/** Article + HowTo + TouristTrip + BreadcrumbList for hiking stage / trail posts. */
export function togstrekHikingPostRichJsonLdGraph(input: {
  headline: string;
  description: string;
  urlPath: string;
  datePublished?: string;
  dateModified?: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  trailDistanceKm?: number;
  trailDifficulty?: string;
  trailTransport?: string;
  breadcrumb: { name: string; path: string }[];
}): Record<string, unknown> {
  const pageUrl = togstrekAbsoluteUrl(input.urlPath);
  const origin = getTogstrekSiteOrigin().replace(/\/+$/, "");
  const personId = getTogstrekAuthorPersonId();

  const trailSummaryParts: string[] = [];
  if (typeof input.trailDistanceKm === "number") {
    trailSummaryParts.push(`Approximate distance: ${input.trailDistanceKm} km.`);
  }
  if (input.trailDifficulty?.trim()) {
    trailSummaryParts.push(`Difficulty: ${input.trailDifficulty.trim()}`);
  }
  if (input.trailTransport?.trim()) {
    trailSummaryParts.push(`Transport: ${input.trailTransport.trim()}`);
  }
  const trailSummary =
    trailSummaryParts.length > 0 ? ` ${trailSummaryParts.join(" ")}` : "";

  const article: Record<string, unknown> = {
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: input.headline,
    description: input.description,
    url: pageUrl,
    author: {
      "@id": personId,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: `${origin}/`,
    },
  };
  if (input.datePublished) article.datePublished = input.datePublished;
  if (input.dateModified) article.dateModified = input.dateModified;
  if (input.imageUrl) article.image = [input.imageUrl];

  const intro =
    input.description.length > 280
      ? `${input.description.slice(0, 277)}…`
      : input.description;

  const howTo: Record<string, unknown> = {
    "@type": "HowTo",
    "@id": `${pageUrl}#howto`,
    name: input.headline,
    description: input.description,
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Review trail facts",
        text: `Read the Trail Information section and introduction for distance, terrain, and access.${trailSummary} ${intro}`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Plan on the map",
        text:
          typeof input.lat === "number" && typeof input.lng === "number"
            ? `Use the coordinates (${input.lat}, ${input.lng}) to plan approaches, exits, and bail options before you leave.`
            : "Use coordinates and maps referenced on this page to plan approaches, exits, and bail options before you leave.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Walk the route",
        text: "Follow local waymarking and the field notes in the narrative, adjusting for weather and conditions on the ground.",
      },
    ],
  };
  if (input.imageUrl) howTo.image = [input.imageUrl];

  const trip: Record<string, unknown> = {
    "@type": "TouristTrip",
    "@id": `${pageUrl}#trip`,
    name: input.headline,
    description: input.description,
    touristType: "Hiker",
    url: pageUrl,
    itinerary: {
      "@type": "ItemList",
      numberOfItems: 1,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Trail stage narrative",
          item: pageUrl,
        },
      ],
    },
  };
  if (input.imageUrl) trip.image = input.imageUrl;

  const trailProps = togstrekTrailPropertyValues({
    trailDistanceKm: input.trailDistanceKm,
    trailDifficulty: input.trailDifficulty,
    trailTransport: input.trailTransport,
  });
  if (trailProps.length > 0) {
    trip.additionalProperty = trailProps;
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      article,
      howTo,
      trip,
      togstrekBreadcrumbListSchema(input.breadcrumb),
    ],
  };
}

/** CollectionPage + BreadcrumbList for `/hiking` hub and trail group landing pages. */
export function togstrekHikingHubOrGroupJsonLdGraph(input: {
  name: string;
  description: string;
  urlPath: string;
  breadcrumb: { name: string; path: string }[];
}): Record<string, unknown> {
  const pageUrl = togstrekAbsoluteUrl(input.urlPath);
  const collection: Record<string, unknown> = {
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collection`,
    name: input.name,
    description: input.description,
    url: pageUrl,
  };
  return {
    "@context": "https://schema.org",
    "@graph": [collection, togstrekBreadcrumbListSchema(input.breadcrumb)],
  };
}

export function togstrekAboutPersonJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    ...buildTogstrekPersonNode(),
  };
}
