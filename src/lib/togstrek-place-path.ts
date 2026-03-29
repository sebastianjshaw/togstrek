/**
 * Place URL helpers. Paths are `/{continent}/{country}/{…placeSegments}` where
 * `placeSegments` is one or more slugs: optional **admin tier** (see below) + leaf place.
 *
 * **Admin tier (same level, pick what fits the country):** state = county = district = län
 * — all denote the subdivision between country and the final place slug in URLs and content.
 *
 * Examples: `["copenhagen"]`, `["california","los-angeles"]`, `["new-jersey","scotch-plains"]`.
 */
/** Join URL path segments for a place (e.g. `california/los-angeles`). */
export function togstrekPlacePathFromSegments(placeSegments: string[]): string {
  return placeSegments.join("/");
}

/** Leaf segment for labels (hero eyebrow, etc.). */
export function togstrekPlaceLeafSegment(placeSegments: string[]): string {
  const n = placeSegments.length;
  return n > 0 ? placeSegments[n - 1]! : "";
}
