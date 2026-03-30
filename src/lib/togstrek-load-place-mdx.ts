import fs from "node:fs";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import { getTogstrekPlaceMdxComponents } from "@/components/togstrek-place/togstrek-place-mdx-components";
import { shouldOmitVisibleDescriptionLead } from "@/lib/togstrek-mdx-description-lead-dedupe";
import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";
import { togstrekUnCountryNameToUrlSlug } from "@/lib/togstrek-geo-labels";
import {
  discoverTogstrekCountryHubParams,
  discoverTogstrekPlaceSlugs,
  listTogstrekPlaceSlugsForCountry,
  loadTogstrekPlaceFrontmatterOnly,
  togstrekPlaceMdxExists,
  togstrekPlaceMdxFilePath,
  type TogstrekPlaceSlugParams,
} from "@/lib/togstrek-place-mdx-fs";
import {
  parseTogstrekPlaceFrontmatter,
  type TogstrekPlaceMdxFrontmatter,
} from "@/lib/togstrek-place-frontmatter";
import { togstrekPlacePathFromSegments } from "@/lib/togstrek-place-path";

export {
  discoverTogstrekCountryHubParams,
  discoverTogstrekPlaceSlugs,
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

  const places = listTogstrekPlaceSlugsForCountry(
    contentContinent,
    countrySlug,
  );
  for (const { place } of places) {
    const fm = loadTogstrekPlaceFrontmatterOnly(
      contentContinent,
      countrySlug,
      place,
    );
    if (fm.heroImage?.src) {
      return { src: fm.heroImage.src, alt: fm.heroImage.alt };
    }
  }
  return undefined;
}
