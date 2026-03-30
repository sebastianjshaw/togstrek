import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { togstrekMediaUrl } from "@/config/togstrek-media";
import { TOGSTREK_ADVENTURE_LEGACY_THUMB_BY_SLUG } from "@/data/togstrek-adventure-legacy-thumbnails";
import { togstrekAdventuresImage } from "@/data/togstrek-adventures-page";
import {
  parseTogstrekAdventureFrontmatter,
  type TogstrekAdventureMdxFrontmatter,
} from "@/lib/togstrek-adventure-frontmatter";

const ADVENTURES_ROOT = path.join(process.cwd(), "content", "adventures");

/** Same basename as `TOGSTREK_ADVENTURES_HERO_IMAGE_FILE` — avoid importing data layer here. */
const FALLBACK_ADVENTURE_CARD_IMAGE_SRC = togstrekMediaUrl(
  "adventures/Gentoo+Penguins-0010.jpg",
);

export type TogstrekAdventureArchiveItem = {
  href: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  published?: string;
};

export function adventureMdxFilePath(slug: string): string {
  return path.join(ADVENTURES_ROOT, `${slug}.mdx`);
}

export function adventureMdxExists(slug: string): boolean {
  try {
    return fs.statSync(adventureMdxFilePath(slug)).isFile();
  } catch {
    return false;
  }
}

export function discoverTogstrekAdventureSlugs(): string[] {
  if (!fs.existsSync(ADVENTURES_ROOT)) return [];
  return fs
    .readdirSync(ADVENTURES_ROOT)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.slice(0, -".mdx".length));
}

export function discoverTogstrekAdventureSlugParams(): { slug: string }[] {
  return discoverTogstrekAdventureSlugs().map((slug) => ({ slug }));
}

export function loadTogstrekAdventureFrontmatterOnly(
  slug: string,
): TogstrekAdventureMdxFrontmatter {
  const fp = adventureMdxFilePath(slug);
  const raw = fs.readFileSync(fp, "utf8");
  const { data } = matter(raw);
  return parseTogstrekAdventureFrontmatter(
    data as Record<string, unknown>,
    slug,
  );
}

function yearFromAdventureHref(href: string): number {
  const m = href.match(/\/adventures\/(\d{4})-/);
  return m ? parseInt(m[1]!, 10) : 0;
}

function resolveAdventureArchiveTileVisuals(
  slug: string,
  fm: TogstrekAdventureMdxFrontmatter,
): { imageSrc: string; imageAlt: string } {
  const hero = fm.heroImage;
  if (hero?.src) {
    return { imageSrc: hero.src, imageAlt: hero.alt };
  }
  const legacy = TOGSTREK_ADVENTURE_LEGACY_THUMB_BY_SLUG[slug];
  if (legacy) {
    return {
      imageSrc: togstrekAdventuresImage(legacy.file),
      imageAlt: legacy.alt,
    };
  }
  return {
    imageSrc: FALLBACK_ADVENTURE_CARD_IMAGE_SRC,
    imageAlt: fm.title,
  };
}

/**
 * Archive tiles for `/adventures` and nav: newest `published` first, then year
 * from href, then discovery order.
 */
export function listSortedTogstrekAdventureArchiveItems(): TogstrekAdventureArchiveItem[] {
  const slugs = discoverTogstrekAdventureSlugs();
  const items = slugs.map((slug) => {
    const fm = loadTogstrekAdventureFrontmatterOnly(slug);
    const { imageSrc, imageAlt } = resolveAdventureArchiveTileVisuals(slug, fm);
    return {
      href: `/adventures/${slug}`,
      title: fm.title,
      imageSrc,
      imageAlt,
      published: fm.published,
    };
  });

  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const pa = a.item.published ?? "";
      const pb = b.item.published ?? "";
      if (pb !== pa) return pb.localeCompare(pa);
      const ya = yearFromAdventureHref(a.item.href);
      const yb = yearFromAdventureHref(b.item.href);
      if (yb !== ya) return yb - ya;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}

export function findTogstrekAdventureArchiveItemByHref(
  href: string,
): TogstrekAdventureArchiveItem | undefined {
  if (!href.startsWith("/adventures/")) return undefined;
  const slug = href.slice("/adventures/".length).replace(/\/+$/, "");
  if (!slug || slug.includes("/") || !adventureMdxExists(slug)) {
    return undefined;
  }
  const fm = loadTogstrekAdventureFrontmatterOnly(slug);
  const { imageSrc, imageAlt } = resolveAdventureArchiveTileVisuals(slug, fm);
  return {
    href,
    title: fm.title,
    imageSrc,
    imageAlt,
    published: fm.published,
  };
}
