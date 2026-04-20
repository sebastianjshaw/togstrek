/**
 * ## Canonical place URLs (single source of truth)
 *
 * - **Routing (App Router):** under `/{continent}/{country}/` the first extra segment
 *   is always the **`[division]`** param (Next.js requires one name for that slot):
 *   - **Leaf / single tier:** `app/[continent]/[country]/[division]/page.tsx` — exactly
 *     one segment after the country (UK nation hubs, US state hubs, Swedish län hubs,
 *     or a place MDX file directly under the country folder).
 *   - **Division + nested places:** `app/[continent]/[country]/[division]/[...place]/page.tsx` —
 *     two or more segments after the country: same `division` param, then the catch-all
 *     for the remaining MDX path segments. **Public URLs are unchanged**
 *     (`/{continent}/{country}/{segment1}/{segment2}/…`).
 * - **Content / filesystem:** still `content/places/<continent>/<country>/…/*.mdx`;
 *   join all segments under the country with {@link togstrekPlacePathFromSegments} for
 *   `placeSlug` and file resolution.
 * - **Frontmatter:** `continentSlug`, `countrySlug`, and `placeSlug` must match the URL
 *   tail (full path after `/{continent}/{country}/`). Optional `divisionSlug` should
 *   align with the first segment when a division tier exists (same meaning as the
 *   `[division]` route param for multi-segment paths).
 * - **Redirects:** build destinations with {@link buildTogstrekPlacePublicPath} so they
 *   stay aligned with this module.
 *
 * **Admin tier (same level, pick what fits the country):** state = county = district = län
 * — modeled as the **`[division]`** URL segment when the path is two or more segments deep.
 *
 * Examples (segment lists under country): `["copenhagen"]`, `["california","los-angeles"]`,
 * `["new-jersey","scotch-plains"]`.
 */

/** Join URL path segments for a place (e.g. `california/los-angeles`). */
export function togstrekPlacePathFromSegments(placeSegments: string[]): string {
  return placeSegments.join("/");
}

/**
 * Path only (leading `/`, no origin): country hub or a place page under
 * `/{continent}/{country}/…`.
 */
export function buildTogstrekPlacePublicPath(
  continent: string,
  country: string,
  placeSegments: string[],
): string {
  const tail = togstrekPlacePathFromSegments(placeSegments);
  if (!tail) return `/${continent}/${country}`;
  return `/${continent}/${country}/${tail}`;
}

/** Leaf segment for labels (hero eyebrow, etc.). */
export function togstrekPlaceLeafSegment(placeSegments: string[]): string {
  const n = placeSegments.length;
  return n > 0 ? placeSegments[n - 1]! : "";
}
