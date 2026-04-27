import fs from "node:fs";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import { getTogstrekPlaceMdxComponents } from "@/components/togstrek-place/togstrek-place-mdx-components";
import { shouldOmitVisibleDescriptionLead } from "@/lib/togstrek-mdx-description-lead-dedupe";
import { togstrekMdxRehypePlugins } from "@/lib/togstrek-mdx-rehype-plugins";
import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";
import {
  isTogstrekContinentHubRouteSlug,
  togstrekContinentHubPageMeta,
} from "@/data/togstrek-continent-hub-meta";
import { TOGSTREK_SWEDEN_COUNTRY_HUB_HERO } from "@/data/togstrek-country-hub-paths";
import { togstrekUnCountryNameToUrlSlug } from "@/lib/togstrek-geo-labels";
import {
  listTogstrekPlaceSlugsForCountry,
  loadTogstrekPlaceFrontmatterOnly,
  togstrekPlaceMdxFilePath,
} from "@/lib/togstrek-place-mdx-fs";
import {
  parseTogstrekPlaceFrontmatter,
  type TogstrekPlaceMdxFrontmatter,
} from "@/lib/togstrek-place-frontmatter";
import { togstrekPlacePathFromSegments } from "@/lib/togstrek-place-path";

export {
  discoverTogstrekCountryHubParams,
  discoverTogstrekPlaceSlugs,
  listTogstrekDirectChildPlaceSlugsForParent,
  listTogstrekPlaceSlugsForCountry,
  loadTogstrekPlaceFrontmatterOnly,
  togstrekPlaceMdxExists,
  togstrekPlaceMdxFilePath,
  type TogstrekPlaceSlugParams,
} from "@/lib/togstrek-place-mdx-fs";

export type TogstrekPlaceMdxResult = {
  frontmatter: TogstrekPlaceMdxFrontmatter;
  content: ReactNode;
  omitDescriptionLead: boolean;
};

export async function loadTogstrekPlaceMdx(
  continent: string,
  country: string,
  placeSegments: string[],
): Promise<TogstrekPlaceMdxResult> {
  const fp = togstrekPlaceMdxFilePath(continent, country, placeSegments);
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
        rehypePlugins: [...togstrekMdxRehypePlugins],
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

/**
 * First non-empty `heroImage` in the given place order — used for country hub headers and continent tiles.
 */
export function pickFirstPlaceHeroFromOrderedPlaces(
  continent: string,
  country: string,
  placeRows: { place: string[] }[],
): { src: string; alt: string } | undefined {
  for (const { place } of placeRows) {
    const fm = loadTogstrekPlaceFrontmatterOnly(continent, country, place);
    const src = fm.heroImage?.src?.trim();
    if (src) {
      return { src, alt: fm.heroImage!.alt };
    }
  }
  return undefined;
}

/** First place hero for a country (paths sorted like the country hub grid). */
export function pickFirstPlaceHeroForCountryHub(
  continent: string,
  country: string,
): { src: string; alt: string } | undefined {
  return pickFirstPlaceHeroFromOrderedPlaces(
    continent,
    country,
    listTogstrekPlaceSlugsForCountry(continent, country),
  );
}

function continentHubHeroFallback(continent: string): {
  src: string;
  alt: string;
} {
  if (isTogstrekContinentHubRouteSlug(continent)) {
    const meta = togstrekContinentHubPageMeta[continent];
    return { src: meta.heroImageSrc, alt: meta.heroImageAlt };
  }
  const eu = togstrekContinentHubPageMeta.europe;
  return { src: eu.heroImageSrc, alt: eu.heroImageAlt };
}

/**
 * Cinematic header image for `/{continent}/{country}` — first place hero, else that continent’s hub hero.
 */
export function resolveTogstrekCountryHubHeaderHero(
  continent: string,
  country: string,
  placeOrder?: { place: string[] }[],
): { src: string; alt: string } {
  if (
    continent === "europe" &&
    country === "sweden" &&
    placeOrder === undefined
  ) {
    return TOGSTREK_SWEDEN_COUNTRY_HUB_HERO;
  }
  const rows =
    placeOrder ?? listTogstrekPlaceSlugsForCountry(continent, country);
  const picked = pickFirstPlaceHeroFromOrderedPlaces(
    continent,
    country,
    rows,
  );
  if (picked) return picked;
  return continentHubHeroFallback(continent);
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

  /** Content folder may differ from the hub’s continent (e.g. TR listed under Asia but stories live under `/europe/turkiye`). */
  let contentContinent = continentSlug;
  let countrySlug = togstrekUnCountryNameToUrlSlug(unCountryName);

  if (hubHref) {
    const parts = hubHref.split("/").filter(Boolean);
    if (parts.length >= 2) {
      contentContinent = parts[0]!;
      countrySlug = parts[1]!;
    } else if (parts.length === 1) {
      countrySlug = parts[0]!;
    }
  }

  if (contentContinent === "europe" && countrySlug === "sweden") {
    return TOGSTREK_SWEDEN_COUNTRY_HUB_HERO;
  }

  return pickFirstPlaceHeroForCountryHub(contentContinent, countrySlug);
}
