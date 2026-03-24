import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";

import { getTogstrekPlaceMdxComponents } from "@/components/togstrek-place/togstrek-place-mdx-components";
import {
  parseTogstrekPlaceFrontmatter,
  type TogstrekPlaceMdxFrontmatter,
} from "@/lib/togstrek-place-frontmatter";

const PLACES_ROOT = path.join(process.cwd(), "content", "places");

export type TogstrekPlaceMdxResult = {
  frontmatter: TogstrekPlaceMdxFrontmatter;
  content: ReactNode;
};

function placeFilePath(
  continent: string,
  country: string,
  place: string,
): string {
  return path.join(PLACES_ROOT, continent, country, `${place}.mdx`);
}

export function togstrekPlaceMdxExists(
  continent: string,
  country: string,
  place: string,
): boolean {
  const fp = placeFilePath(continent, country, place);
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
  place: string,
): TogstrekPlaceMdxFrontmatter {
  const fp = placeFilePath(continent, country, place);
  const raw = fs.readFileSync(fp, "utf8");
  const { data } = matter(raw);
  return parseTogstrekPlaceFrontmatter(data as Record<string, unknown>, {
    continent,
    country,
    place,
  });
}

export async function loadTogstrekPlaceMdx(
  continent: string,
  country: string,
  place: string,
): Promise<TogstrekPlaceMdxResult> {
  const fp = placeFilePath(continent, country, place);
  const source = fs.readFileSync(fp, "utf8");

  const { content, frontmatter: rawFm } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkUnwrapImages],
      },
    },
    components: getTogstrekPlaceMdxComponents(),
  });

  const fm = rawFm as Record<string, unknown>;
  const frontmatter = parseTogstrekPlaceFrontmatter(fm, {
    continent,
    country,
    place,
  });

  return { frontmatter, content };
}

/** Discover all `content/places/<continent>/<country>/<place>.mdx` files */
export function discoverTogstrekPlaceSlugs(): {
  continent: string;
  country: string;
  place: string;
}[] {
  if (!fs.existsSync(PLACES_ROOT)) return [];
  const out: { continent: string; country: string; place: string }[] = [];
  for (const continent of fs.readdirSync(PLACES_ROOT)) {
    const cDir = path.join(PLACES_ROOT, continent);
    if (!fs.statSync(cDir).isDirectory()) continue;
    for (const country of fs.readdirSync(cDir)) {
      const coDir = path.join(cDir, country);
      if (!fs.statSync(coDir).isDirectory()) continue;
      for (const file of fs.readdirSync(coDir)) {
        if (!file.endsWith(".mdx")) continue;
        out.push({
          continent,
          country,
          place: file.replace(/\.mdx$/, ""),
        });
      }
    }
  }
  return out;
}
