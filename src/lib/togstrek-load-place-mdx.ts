import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import { getTogstrekPlaceMdxComponents } from "@/components/togstrek-place/togstrek-place-mdx-components";
import { shouldOmitVisibleDescriptionLead } from "@/lib/togstrek-mdx-description-lead-dedupe";
import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";
import { togstrekUnCountryNameToUrlSlug } from "@/lib/togstrek-geo-labels";
import {
  parseTogstrekPlaceFrontmatter,
  type TogstrekPlaceMdxFrontmatter,
} from "@/lib/togstrek-place-frontmatter";
import { togstrekPlacePathFromSegments } from "@/lib/togstrek-place-path";

const PLACES_ROOT = path.join(process.cwd(), "content", "places");

export type TogstrekPlaceSlugParams = {
  continent: string;
  country: string;
  /**
   * Segments after `/{continent}/{country}/`: optional admin tier + leaf place.
   * Admin tier = state | county | district | län (same level); e.g. `['copenhagen']` or `['california','los-angeles']`.
   */
  place: string[];
};

export type TogstrekPlaceMdxResult = {
  frontmatter: TogstrekPlaceMdxFrontmatter;
  content: ReactNode;
  omitDescriptionLead: boolean;
};

function placeMdxFilePath(
  continent: string,
  country: string,
  placeSegments: string[],
): string {
  return (
    path.join(PLACES_ROOT, continent, country, ...placeSegments) + ".mdx"
  );
}

export function togstrekPlaceMdxExists(
  continent: string,
  country: string,
  placeSegments: string[],
): boolean {
  const fp = placeMdxFilePath(continent, country, placeSegments);
  try {
    return fs.statSync(fp).isFile();
  } catch {
    return false;
  }
}

/** Fast path for `generateMetadata` — YAML only, no MDX compile */
export function loadTogstrekPlaceFrontmatterOnly(
  continent: string,
  country: string,
  placeSegments: string[],
): TogstrekPlaceMdxFrontmatter {
  const fp = placeMdxFilePath(continent, country, placeSegments);
  const raw = fs.readFileSync(fp, "utf8");
  const { data } = matter(raw);
  return parseTogstrekPlaceFrontmatter(data as Record<string, unknown>, {
    continent,
    country,
    placePath: togstrekPlacePathFromSegments(placeSegments),
  });
}

export async function loadTogstrekPlaceMdx(
  continent: string,
  country: string,
  placeSegments: string[],
): Promise<TogstrekPlaceMdxResult> {
  const fp = placeMdxFilePath(continent, country, placeSegments);
  const source = fs.readFileSync(fp, "utf8");

  const parsed = matter(source);
  const placePath = togstrekPlacePathFromSegments(placeSegments);
  const fmDedupe = parseTogstrekPlaceFrontmatter(
    parsed.data as Record<string, unknown>,
    { continent, country, placePath },
  );
  const omitDescriptionLead = shouldOmitVisibleDescriptionLead(
    fmDedupe.description,
    parsed.content,
  );

  const { content, frontmatter: rawFm } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [...togstrekMdxRemarkPlugins],
      },
    },
    components: getTogstrekPlaceMdxComponents(),
  });

  const fm = rawFm as Record<string, unknown>;
  const frontmatter = parseTogstrekPlaceFrontmatter(fm, {
    continent,
    country,
    placePath,
  });

  return { frontmatter, content, omitDescriptionLead };
}

function collectMdxFilesUnderCountryDir(
  countryDir: string,
  continent: string,
  country: string,
  out: TogstrekPlaceSlugParams[],
): void {
  function walk(currentDir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(currentDir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".mdx")) {
        const rel = path.relative(countryDir, full).replace(/\\/g, "/");
        const withoutExt = rel.replace(/\.mdx$/i, "");
        const segments = withoutExt.split("/").filter(Boolean);
        if (segments.length === 0) continue;
        out.push({ continent, country, place: segments });
      }
    }
  }
  walk(countryDir);
}

/** Discover all place MDX files under `content/places/<continent>/<country>/` (any nesting depth). */
export function discoverTogstrekPlaceSlugs(): TogstrekPlaceSlugParams[] {
  if (!fs.existsSync(PLACES_ROOT)) return [];
  const out: TogstrekPlaceSlugParams[] = [];
  for (const continent of fs.readdirSync(PLACES_ROOT)) {
    const cDir = path.join(PLACES_ROOT, continent);
    if (!fs.statSync(cDir).isDirectory()) continue;
    for (const country of fs.readdirSync(cDir)) {
      const coDir = path.join(cDir, country);
      if (!fs.statSync(coDir).isDirectory()) continue;
      collectMdxFilesUnderCountryDir(coDir, continent, country, out);
    }
  }
  return out;
}

/** Distinct `/{continent}/{country}` pairs that have at least one place MDX file. */
export function discoverTogstrekCountryHubParams(): {
  continent: string;
  country: string;
}[] {
  const slugs = discoverTogstrekPlaceSlugs();
  const seen = new Set<string>();
  const result: { continent: string; country: string }[] = [];
  for (const s of slugs) {
    const key = `${s.continent}\0${s.country}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ continent: s.continent, country: s.country });
  }
  return result;
}

/** All place slug lists under `content/places/<continent>/<country>/`, sorted by joined path. */
export function listTogstrekPlaceSlugsForCountry(
  continent: string,
  country: string,
): { place: string[] }[] {
  return discoverTogstrekPlaceSlugs()
    .filter((s) => s.continent === continent && s.country === country)
    .map((s) => ({ place: s.place }))
    .sort((a, b) =>
      a.place.join("/").localeCompare(b.place.join("/"), undefined, {
        sensitivity: "base",
      }),
    );
}

/**
 * Country folder slug from a hub `href` (`/denmark` or `/south-america/ecuador`).
 */
export function parseTogstrekCountryHubHrefToCountrySlug(
  continentSlug: string,
  href: string | undefined,
): string | undefined {
  if (!href) return undefined;
  const parts = href.split("/").filter(Boolean);
  if (parts.length === 1) return parts[0];
  if (parts.length >= 2 && parts[0] === continentSlug) return parts[1];
  return undefined;
}

/**
 * First place hero under the country content folder (sorted by place path) — for continent hub tiles.
 */
export function pickTogstrekCountryHubTileHeroFromPlaces(options: {
  continentSlug: string;
  unCountryName: string;
  hubHref: string | undefined;
}): { src: string; alt: string } | undefined {
  const { continentSlug, unCountryName, hubHref } = options;
  const fromHref = parseTogstrekCountryHubHrefToCountrySlug(
    continentSlug,
    hubHref,
  );
  const countrySlug = fromHref ?? togstrekUnCountryNameToUrlSlug(unCountryName);
  const places = listTogstrekPlaceSlugsForCountry(continentSlug, countrySlug);
  for (const { place } of places) {
    const fm = loadTogstrekPlaceFrontmatterOnly(
      continentSlug,
      countrySlug,
      place,
    );
    if (fm.heroImage?.src) {
      return { src: fm.heroImage.src, alt: fm.heroImage.alt };
    }
  }
  return undefined;
}
