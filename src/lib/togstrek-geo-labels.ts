/**
 * Display labels for URL segments (continent, country, place slugs).
 */

export function formatSlugLabel(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Eyebrow / prose label for a continent route slug (e.g. `north-america` → “North America”). */
export function formatContinentEyebrow(continentSlug: string): string {
  if (continentSlug === "north-america") return "North America";
  if (continentSlug === "south-america") return "South America";
  return continentSlug.charAt(0).toUpperCase() + continentSlug.slice(1);
}

export function truncateDescription(text: string, max = 140): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}
