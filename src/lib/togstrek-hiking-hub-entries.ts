import fs from "node:fs";
import path from "node:path";

import type { TogstrekImageAsset } from "@/types/togstrek-place-page";

import { discoverTogstrekHikingGroupSegmentLists } from "@/lib/togstrek-hiking-groups";
import {
  discoverTogstrekHikingSlugLists,
  loadTogstrekHikingFrontmatterOnly,
} from "@/lib/togstrek-load-hiking-mdx";

const HIKING_ROOT = path.join(process.cwd(), "content", "hiking");

export type TogstrekHikingHubEntry = {
  href: string;
  slugSegments: string[];
  title: string;
  description: string;
  published?: string;
  categoryLabel?: string;
  heroImage?: TogstrekImageAsset;
};

function titleCaseSegment(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function categoryFromSlugSegments(segments: string[]): string | undefined {
  if (segments.length < 2) return undefined;
  return titleCaseSegment(segments[0]!);
}

function parsePublishedMs(published?: string): number {
  if (!published) return 0;
  const t = Date.parse(published);
  return Number.isNaN(t) ? 0 : t;
}

export function formatTogstrekHikingHubDate(published?: string): string | undefined {
  if (!published) return undefined;
  const d = new Date(published);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function syntheticGroupCopy(groupSegments: string[]): {
  title: string;
  description: string;
} {
  const last = groupSegments[groupSegments.length - 1]!;
  const title = titleCaseSegment(last);
  return {
    title,
    description: `Trail stages and reports for ${title}.`,
  };
}

/**
 * Cover image for a hike hub card when `…/index.mdx` has no `heroImage`:
 * use the most recently published stage post in that folder that declares `heroImage`.
 */
function findHeroImageForGroup(
  groupSegments: string[],
  allSlugs: string[][],
): TogstrekImageAsset | undefined {
  const candidates = allSlugs.filter((s) => {
    if (s.length <= groupSegments.length) return false;
    for (let i = 0; i < groupSegments.length; i++) {
      if (s[i] !== groupSegments[i]) return false;
    }
    return true;
  });

  const withHero = candidates
    .map((slug) => {
      const fm = loadTogstrekHikingFrontmatterOnly(slug);
      return {
        fm,
        ms: parsePublishedMs(fm.published),
      };
    })
    .filter((x) => x.fm.heroImage != null)
    .sort((a, b) => b.ms - a.ms);

  return withHero[0]?.fm.heroImage;
}

/**
 * One card per hike / trail system (e.g. Bohusleden, Kungsleden, Annapurna).
 */
export function getTogstrekHikingHubGroupEntries(): TogstrekHikingHubEntry[] {
  const groups = discoverTogstrekHikingGroupSegmentLists();
  const allSlugs = discoverTogstrekHikingSlugLists();
  const entries: TogstrekHikingHubEntry[] = [];

  for (const g of groups) {
    const href = `/hiking/${g.join("/")}`;
    const folderIndex = path.join(HIKING_ROOT, ...g, "index.mdx");
    const fallbackHero = findHeroImageForGroup(g, allSlugs);

    if (fs.existsSync(folderIndex)) {
      const fm = loadTogstrekHikingFrontmatterOnly(g);
      entries.push({
        href,
        slugSegments: g,
        title: fm.title,
        description: fm.description,
        published: fm.published,
        heroImage: fm.heroImage ?? fallbackHero,
        categoryLabel: undefined,
      });
    } else {
      const copy = syntheticGroupCopy(g);
      entries.push({
        href,
        slugSegments: g,
        title: copy.title,
        description: copy.description,
        heroImage: fallbackHero,
      });
    }
  }

  entries.sort((a, b) => a.title.localeCompare(b.title));
  return entries;
}

/** `etapp-01-…`, `etapp01-…`, `etapp_02-…` → stage number for trail order */
const ETAPP_STAGE_RE = /^etapp[-_]?(\d+)/i;

function stageOrderKey(slugSegments: string[]): { n: number; slug: string } {
  const last = slugSegments[slugSegments.length - 1] ?? "";
  const m = ETAPP_STAGE_RE.exec(last);
  const n = m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
  return { n, slug: slugSegments.join("/") };
}

/**
 * Individual trail posts under a hike folder (e.g. all Bohusleden stages).
 * Sorted by **stage number** parsed from the filename (`etapp-01-…`, `etapp03-…`), then slug.
 * Posts without an `etappNN` prefix sort after numbered stages, by slug.
 */
export function getTogstrekHikingPostsInGroup(
  groupSegments: string[],
): TogstrekHikingHubEntry[] {
  const lists = discoverTogstrekHikingSlugLists().filter((s) => {
    if (s.length <= groupSegments.length) return false;
    for (let i = 0; i < groupSegments.length; i++) {
      if (s[i] !== groupSegments[i]) return false;
    }
    return true;
  });

  const entries: TogstrekHikingHubEntry[] = [];

  for (const slugSegments of lists) {
    const fm = loadTogstrekHikingFrontmatterOnly(slugSegments);
    const href = `/hiking/${slugSegments.join("/")}`;
    entries.push({
      href,
      slugSegments,
      title: fm.title,
      description: fm.description,
      published: fm.published,
      categoryLabel: categoryFromSlugSegments(slugSegments),
      heroImage: fm.heroImage,
    });
  }

  entries.sort((a, b) => {
    const ka = stageOrderKey(a.slugSegments);
    const kb = stageOrderKey(b.slugSegments);
    if (ka.n !== kb.n) return ka.n - kb.n;
    return ka.slug.localeCompare(kb.slug);
  });

  return entries;
}

export function buildSyntheticGroupFrontmatter(
  groupSegments: string[],
): { title: string; description: string } {
  return syntheticGroupCopy(groupSegments);
}
