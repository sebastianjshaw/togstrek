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
 * - **Content / filesystem:** `content/places/<continent>/<country>/…/*.mdx`; Antarctic
 *   place files also live as `content/places/antarctica/<place>.mdx` (flat) while
 *   `countrySlug` in frontmatter stays `antarctic` for the internal model.
 *   Join all segments under the country with {@link togstrekPlacePathFromSegments} for
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

/**
 * Subfolder under `content/places/antarctica/…` for the Antarctic “country”
 * model (not a URL segment — public place URLs are `/antarctica/<place>`).
 */
export const TOGSTREK_ANTARCTICA_COUNTRY_SLUG = "antarctic";

/** Join URL path segments for a place (e.g. `california/los-angeles`). */
export function togstrekPlacePathFromSegments(placeSegments: string[]): string {
  return placeSegments.join("/");
}

/**
 * Path only (leading `/`, no origin): country hub or a place page under
 * `/{continent}/{country}/…`. Antarctic place pages are flat: `/antarctica/<place>`.
 */
export function buildTogstrekPlacePublicPath(
  continent: string,
  country: string,
  placeSegments: string[],
): string {
  if (
    continent === "antarctica" &&
    country === TOGSTREK_ANTARCTICA_COUNTRY_SLUG &&
    placeSegments.length === 1
  ) {
    return `/${continent}/${placeSegments[0]}`;
  }
  const tail = togstrekPlacePathFromSegments(placeSegments);
  if (!tail) return `/${continent}/${country}`;
  return `/${continent}/${country}/${tail}`;
}

/** Leaf segment for labels (hero eyebrow, etc.). */
export function togstrekPlaceLeafSegment(placeSegments: string[]): string {
  const n = placeSegments.length;
  return n > 0 ? placeSegments[n - 1]! : "";
}
