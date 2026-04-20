import { formatSlugLabel } from "@/lib/togstrek-geo-labels";
import { buildTogstrekPlacePublicPath } from "@/lib/togstrek-place-path";

/** Visible breadcrumb items for place pages (continent → country → optional admin tiers → title). */
export function buildTogstrekPlaceBreadcrumbUiItems(
  continent: string,
  country: string,
  placeSegments: string[],
  pageTitle: string,
): { label: string; href?: string }[] {
  const items: { label: string; href?: string }[] = [
    { href: `/${continent}`, label: formatSlugLabel(continent) },
    {
      href: buildTogstrekPlacePublicPath(continent, country, []),
      label: formatSlugLabel(country),
    },
  ];
  if (placeSegments.length <= 1) {
    items.push({ label: pageTitle });
    return items;
  }
  for (let i = 0; i < placeSegments.length - 1; i++) {
    items.push({
      href: buildTogstrekPlacePublicPath(
        continent,
        country,
        placeSegments.slice(0, i + 1),
      ),
      label: formatSlugLabel(placeSegments[i]!),
    });
  }
  items.push({ label: pageTitle });
  return items;
}

/** JSON-LD BreadcrumbList items — same hierarchy as {@link buildTogstrekPlaceBreadcrumbUiItems}. */
export function buildTogstrekPlaceBreadcrumbJsonLdItems(
  continent: string,
  country: string,
  placeSegments: string[],
  pageTitle: string,
  fullPlacePath: string,
): { name: string; path: string }[] {
  const items: { name: string; path: string }[] = [
    { name: formatSlugLabel(continent), path: `/${continent}` },
    {
      name: formatSlugLabel(country),
      path: buildTogstrekPlacePublicPath(continent, country, []),
    },
  ];
  if (placeSegments.length <= 1) {
    items.push({ name: pageTitle, path: fullPlacePath });
    return items;
  }
  for (let i = 0; i < placeSegments.length - 1; i++) {
    items.push({
      name: formatSlugLabel(placeSegments[i]!),
      path: buildTogstrekPlacePublicPath(
        continent,
        country,
        placeSegments.slice(0, i + 1),
      ),
    });
  }
  items.push({ name: pageTitle, path: fullPlacePath });
  return items;
}
