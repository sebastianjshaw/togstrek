/**
 * Display labels for URL segments (continent, country, place slugs).
 */

const TOGSTREK_COUNTRY_SLUG_DISPLAY: Record<string, string> = {
  turkiye: "Türkiye",
};

export function formatSlugLabel(segment: string): string {
  const lower = segment.toLowerCase();
  if (TOGSTREK_COUNTRY_SLUG_DISPLAY[lower]) {
    return TOGSTREK_COUNTRY_SLUG_DISPLAY[lower];
  }
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** UN-style English country name → `content/places/.../<slug>/` folder (e.g. Ecuador → ecuador). */
export function togstrekUnCountryNameToUrlSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Eyebrow / prose label for a continent route slug (e.g. `north-america` → “North America”). */
export function formatContinentEyebrow(continentSlug: string): string {
  if (continentSlug === "north-america") return "North America";
  if (continentSlug === "south-america") return "South America";
  return continentSlug.charAt(0).toUpperCase() + continentSlug.slice(1);
}

export function truncateDescription(text: string | undefined, max = 140): string {
  const t = (text ?? "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}
