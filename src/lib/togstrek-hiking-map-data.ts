import type { TogstrekMapPlace } from "@/components/togstrek-explore-map/types";
import {
  discoverTogstrekHikingSlugLists,
  loadTogstrekHikingFrontmatterOnly,
} from "@/lib/togstrek-load-hiking-mdx";

function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Map pins for every hiking MDX post that has `lat` / `lng` in frontmatter.
 */
export function buildTogstrekHikingMapPlaces(): TogstrekMapPlace[] {
  const out: TogstrekMapPlace[] = [];

  for (const segments of discoverTogstrekHikingSlugLists()) {
    if (segments.length === 0) continue;

    const fm = loadTogstrekHikingFrontmatterOnly(segments);
    if (typeof fm.lat !== "number" || typeof fm.lng !== "number") continue;
    if (!isValidCoord(fm.lat, fm.lng)) continue;

    const href = `/hiking/${segments.join("/")}`;
    out.push({
      id: href,
      href,
      title: fm.title,
      excerpt: fm.description,
      latitude: fm.lat,
      longitude: fm.lng,
      thumbnailSrc: fm.heroImage?.src,
      thumbnailAlt: fm.heroImage?.alt,
    });
  }

  return out;
}

/**
 * Pins for posts under a hike folder (e.g. Bohusleden stages only).
 */
export function buildTogstrekHikingMapPlacesForGroup(
  groupSegments: string[],
): TogstrekMapPlace[] {
  if (groupSegments.length === 0) return [];

  const prefix = `/hiking/${groupSegments.join("/")}`;
  return buildTogstrekHikingMapPlaces().filter(
    (p) => p.href.startsWith(`${prefix}/`),
  );
}
