import {
  TOGSTREK_POI_GROUP_IDS,
  type TogstrekImageAsset,
  type TogstrekPoiGroupId,
  type TogstrekPoiListItem,
} from "@/types/togstrek-place-page";

/** Frontmatter for MDX files under content/places — validated at load time */
export type TogstrekPlaceMdxFrontmatter = {
  title: string;
  description: string;
  continentSlug: string;
  countrySlug: string;
  /** Optional; when set, should match the first segment of `placeSlug` when a tier exists (state/county/district/län — same level). */
  divisionSlug?: string;
  /** Full path after `countrySlug` in the URL (e.g. `copenhagen` or `california/los-angeles`). */
  placeSlug: string;
  lat?: number;
  lng?: number;
  published?: string;
  modified?: string;
  heroImage?: TogstrekImageAsset;
  /** Optional POI lists — structured metadata (e.g. future search / JSON-LD); narrative stays in MDX */
  poiGroups?: TogstrekPlaceMdxPoiGroup[];
};

export type TogstrekPlaceMdxPoiGroup = {
  groupId: TogstrekPoiGroupId;
  title?: string;
  items: TogstrekPoiListItem[];
};

function isPoiGroupId(v: unknown): v is TogstrekPoiGroupId {
  return (
    typeof v === "string" &&
    (TOGSTREK_POI_GROUP_IDS as readonly string[]).includes(v)
  );
}

function parseHeroImage(raw: unknown): TogstrekImageAsset | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (
    typeof o.basename !== "string" ||
    typeof o.src !== "string" ||
    typeof o.width !== "number" ||
    typeof o.height !== "number" ||
    typeof o.alt !== "string"
  ) {
    return undefined;
  }
  return {
    basename: o.basename,
    src: o.src,
    width: o.width,
    height: o.height,
    alt: o.alt,
    caption: typeof o.caption === "string" ? o.caption : undefined,
    credit: typeof o.credit === "string" ? o.credit : undefined,
    priority: o.priority === true,
  };
}

function parsePoiItem(raw: unknown): TogstrekPoiListItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.name !== "string") return null;
  return {
    id: o.id,
    name: o.name,
    kind: typeof o.kind === "string" ? o.kind : undefined,
    externalUrl: typeof o.externalUrl === "string" ? o.externalUrl : undefined,
    note: typeof o.note === "string" ? o.note : undefined,
  };
}

function parsePoiGroups(raw: unknown): TogstrekPlaceMdxPoiGroup[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw)) return undefined;
  const groups: TogstrekPlaceMdxPoiGroup[] = [];
  for (const g of raw) {
    if (!g || typeof g !== "object") continue;
    const o = g as Record<string, unknown>;
    if (!isPoiGroupId(o.groupId)) continue;
    const itemsRaw = o.items;
    if (!Array.isArray(itemsRaw)) continue;
    const items: TogstrekPoiListItem[] = [];
    for (const it of itemsRaw) {
      const parsed = parsePoiItem(it);
      if (parsed) items.push(parsed);
    }
    groups.push({
      groupId: o.groupId,
      title: typeof o.title === "string" ? o.title : undefined,
      items,
    });
  }
  return groups.length ? groups : undefined;
}

/**
 * Validate YAML frontmatter from MDX. Throws if required fields are missing
 * or slugs do not match the URL.
 */
export function parseTogstrekPlaceFrontmatter(
  raw: Record<string, unknown>,
  url: { continent: string; country: string; placePath: string },
): TogstrekPlaceMdxFrontmatter {
  const title = raw.title;
  const description = raw.description;
  const continentSlug = raw.continentSlug;
  const countrySlug = raw.countrySlug;
  const placeSlug = raw.placeSlug;

  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Frontmatter: `title` (string) is required");
  }
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Frontmatter: `description` (string) is required");
  }
  if (typeof continentSlug !== "string" || continentSlug !== url.continent) {
    throw new Error(
      `Frontmatter: continentSlug must match URL (${url.continent})`,
    );
  }
  if (typeof countrySlug !== "string" || countrySlug !== url.country) {
    throw new Error(`Frontmatter: countrySlug must match URL (${url.country})`);
  }
  if (typeof placeSlug !== "string" || placeSlug !== url.placePath) {
    throw new Error(`Frontmatter: placeSlug must match URL (${url.placePath})`);
  }

  const divisionSlug =
    typeof raw.divisionSlug === "string" ? raw.divisionSlug : undefined;
  const lat = typeof raw.lat === "number" ? raw.lat : undefined;
  const lng = typeof raw.lng === "number" ? raw.lng : undefined;
  const published =
    typeof raw.published === "string" ? raw.published : undefined;
  const modified = typeof raw.modified === "string" ? raw.modified : undefined;

  return {
    title: title.trim(),
    description: description.trim(),
    continentSlug,
    countrySlug,
    divisionSlug,
    placeSlug,
    lat,
    lng,
    published,
    modified,
    heroImage: parseHeroImage(raw.heroImage),
    poiGroups: parsePoiGroups(raw.poiGroups),
  };
}
