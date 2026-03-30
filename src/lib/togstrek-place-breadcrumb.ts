import { formatSlugLabel } from "@/lib/togstrek-geo-labels";

/** Visible breadcrumb items for place pages (continent → country → optional admin tiers → title). */
export function buildTogstrekPlaceBreadcrumbUiItems(
  continent: string,
  country: string,
  placeSegments: string[],
  pageTitle: string,
): { label: string; href?: string }[] {
  const items: { label: string; href?: string }[] = [
    { href: `/${continent}`, label: formatSlugLabel(continent) },
    { href: `/${continent}/${country}`, label: formatSlugLabel(country) },
  ];
  if (placeSegments.length <= 1) {
    items.push({ label: pageTitle });
    return items;
  }
  const base = `/${continent}/${country}`;
  for (let i = 0; i < placeSegments.length - 1; i++) {
    items.push({
      href: `${base}/${placeSegments.slice(0, i + 1).join("/")}`,
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
    { name: formatSlugLabel(country), path: `/${continent}/${country}` },
  ];
  if (placeSegments.length <= 1) {
    items.push({ name: pageTitle, path: fullPlacePath });
    return items;
  }
  const base = `/${continent}/${country}`;
  for (let i = 0; i < placeSegments.length - 1; i++) {
    items.push({
      name: formatSlugLabel(placeSegments[i]!),
      path: `${base}/${placeSegments.slice(0, i + 1).join("/")}`,
    });
  }
  items.push({ name: pageTitle, path: fullPlacePath });
  return items;
}
