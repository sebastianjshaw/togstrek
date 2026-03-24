/**
 * Data model for place (e.g. city) pages — structured POI groups, narrative
 * sections, and image assets. Use with MDX frontmatter + body, or JSON
 * compiled from migration.
 *
 * Filtering “all restaurants in Mexico” requires each POI to carry stable
 * taxonomy (group + place refs). A build step can emit `public/index/poi.json`
 * or a SQLite DB for faceted browse; Pagefind can still index narrative text.
 */

/** Anchor-friendly ids — match your Squarespace section slugs where possible. */
export const TOGSTREK_POI_GROUP_IDS = [
  "sights-culture",
  "museums-galleries",
  "parks-gardens",
  "restaurants-bars",
  "shopping",
  "sports-activities",
] as const;

export type TogstrekPoiGroupId = (typeof TOGSTREK_POI_GROUP_IDS)[number];

/** Human labels for UI and TOC — edit in one place. */
export const TOGSTREK_POI_GROUP_LABELS: Record<TogstrekPoiGroupId, string> = {
  "sights-culture": "Sights & Culture",
  "museums-galleries": "Museums & Galleries",
  "parks-gardens": "Parks & Gardens",
  "restaurants-bars": "Restaurants & Bars",
  shopping: "Shopping",
  "sports-activities": "Sports & Activities",
};

/**
 * URL hierarchy for the site (continent → country → optional division → place).
 * Denormalize on each POI so indexes do not need to walk the tree.
 */
export type TogstrekPlaceLocationRef = {
  continentSlug: string;
  countrySlug: string;
  /** State / province / region — optional */
  divisionSlug?: string;
  /** City or town slug */
  placeSlug: string;
};

/**
 * One list item under a POI group (museum, bar, trail, shop…).
 * `groupId` drives “all restaurants in Mexico” style queries.
 */
export type TogstrekPoiEntry = {
  /** Stable id for deduplication and future editing tools */
  id: string;
  name: string;
  groupId: TogstrekPoiGroupId;
  /** Optional finer facet: e.g. "museum" | "gallery" | "wine-bar" */
  kind?: string;
  externalUrl?: string;
  note?: string;
  /** Repeat location on each row so a flat index can filter without joins */
  place: TogstrekPlaceLocationRef;
};

/**
 * Image with required alt — filenames live in `public/media/...` or remote CDN.
 * Use with next/image: `priority` only for LCP hero; everything else lazy by default.
 */
export type TogstrekImageAsset = {
  /** Logical name for authors (e.g. castillo-20221223-0001) */
  basename: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  /** Pass through to next/image — true for hero only */
  priority?: boolean;
  /** Optional credit line */
  credit?: string;
};

/** Long-form prose — not every city page uses grouped POIs. */
export type TogstrekNarrativeSection = {
  type: "narrative";
  /** Optional heading; body can be MDX string */
  title?: string;
  body: string;
};

/** One row in a POI group — `groupId` comes from the parent section */
export type TogstrekPoiListItem = {
  id: string;
  name: string;
  kind?: string;
  externalUrl?: string;
  note?: string;
};

/** Grouped list matching your classic city layout */
export type TogstrekPoiGroupSection = {
  type: "poi_group";
  groupId: TogstrekPoiGroupId;
  /** Override label if needed; default from TOGSTREK_POI_GROUP_LABELS */
  title?: string;
  items: TogstrekPoiListItem[];
};

/** Editorial gallery — layout chosen at render time */
export type TogstrekGallerySection = {
  type: "gallery";
  layout?: "editorial-grid" | "masonry" | "full-bleed";
  images: TogstrekImageAsset[];
};

/** Mixed page: narrative blocks + optional POI groups + galleries in order */
export type TogstrekPlaceSection =
  | TogstrekNarrativeSection
  | TogstrekPoiGroupSection
  | TogstrekGallerySection;

/**
 * Full place page document (v1).
 * - `sections` can start with narrative-only cities; add `poi_group` when ready.
 * - Hydrate `TogstrekPoiEntry.place` from frontmatter when emitting an index.
 */
export type TogstrekPlacePageV1 = {
  schema: "togstrek.place.v1";
  title: string;
  description: string;
  location: TogstrekPlaceLocationRef;
  coordinates?: { lat: number; lng: number };
  published?: string;
  modified?: string;
  heroImage?: TogstrekImageAsset;
  /** Ordered content */
  sections: TogstrekPlaceSection[];
};

/** Flatten POI rows for `poi.json` / SQL / facet UI — run at build time */
export function togstrekFlattenPoisForIndex(
  page: TogstrekPlacePageV1,
): TogstrekPoiEntry[] {
  const place = page.location;
  const out: TogstrekPoiEntry[] = [];
  for (const section of page.sections) {
    if (section.type !== "poi_group") continue;
    for (const item of section.items) {
      out.push({
        id: item.id,
        name: item.name,
        groupId: section.groupId,
        kind: item.kind,
        externalUrl: item.externalUrl,
        note: item.note,
        place,
      });
    }
  }
  return out;
}
