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

/**
 * Root-level `content/hiking/<slug>.mdx` trail reports (not folders with stages).
 * Shown on `/hiking` alongside multi-day trek hubs.
 * Omits `…/index.mdx` hubs (same single segment as a multi-day group, e.g. `bohusleden`).
 */
export function getTogstrekHikingHubStandalonePostEntries(): TogstrekHikingHubEntry[] {
  const groupSlugKeys = new Set(
    discoverTogstrekHikingGroupSegmentLists().map((g) => g.join("/")),
  );
  const lists = discoverTogstrekHikingSlugLists().filter((s) => {
    if (s.length !== 1) return false;
    return !groupSlugKeys.has(s[0]!);
  });
  const entries: TogstrekHikingHubEntry[] = [];

  for (const slugSegments of lists) {
    const fm = loadTogstrekHikingFrontmatterOnly(slugSegments);
    entries.push({
      href: `/hiking/${slugSegments.join("/")}`,
      slugSegments,
      title: fm.title,
      description: fm.description,
      published: fm.published,
      categoryLabel: undefined,
      heroImage: fm.heroImage,
    });
  }

  entries.sort((a, b) => a.title.localeCompare(b.title));
  return entries;
}

/** `etapp-01-…`, `etapp01-…`, `etapp_02-…` → stage number for trail order */
const ETAPP_STAGE_RE = /^etapp[-_]?(\d+)/i;
/** `route7`, `route13` (Höga Kusten, etc.) */
const ROUTE_STAGE_RE = /^route(\d+)$/i;
/** `trail-01-trollkyrkerundan`, `trail-3-…` (Tiveden, etc.) */
const TRAIL_STAGE_RE = /^trail[-_]?(\d+)/i;

/**
 * Numeric trail order from the **last** URL segment (`etapp-04-…`, `route11`, `trail-01-…`, …).
 * Unnumbered slugs sort after all numbered stages.
 */
function parsedTrailStage(slugSegments: string[]): { n: number; slug: string } {
  const last = slugSegments[slugSegments.length - 1] ?? "";
  const et = ETAPP_STAGE_RE.exec(last);
  if (et) {
    return { n: parseInt(et[1], 10), slug: slugSegments.join("/") };
  }
  const rt = ROUTE_STAGE_RE.exec(last);
  if (rt) {
    return { n: parseInt(rt[1], 10), slug: slugSegments.join("/") };
  }
  const tr = TRAIL_STAGE_RE.exec(last);
  if (tr) {
    return { n: parseInt(tr[1], 10), slug: slugSegments.join("/") };
  }
  return { n: Number.MAX_SAFE_INTEGER, slug: slugSegments.join("/") };
}

function trailOrderDescending(groupSegments: string[]): boolean {
  return (
    groupSegments.length === 1 && groupSegments[0] === "hoga-kusten"
  );
}

/**
 * Trail order for two post slug paths under the same hike folder (hub list, map pins).
 */
export function compareTogstrekHikingPostSlugSegmentsForGroup(
  a: string[],
  b: string[],
  groupSegments: string[],
): number {
  const ka = parsedTrailStage(a);
  const kb = parsedTrailStage(b);
  const desc = trailOrderDescending(groupSegments);
  if (ka.n !== kb.n) {
    const delta = ka.n - kb.n;
    return desc ? -delta : delta;
  }
  return ka.slug.localeCompare(kb.slug);
}

/**
 * Individual trail posts under a hike folder (e.g. all Bohusleden stages).
 * Sorted by stage number from the filename (`etapp-01-…`, `route7`, `trail-01-…`, …), then slug.
 * **Höga Kusten** uses descending route order (13 → 7) to match trail direction on site.
 * Posts without a numeric prefix sort last, by slug.
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

  entries.sort((a, b) =>
    compareTogstrekHikingPostSlugSegmentsForGroup(
      a.slugSegments,
      b.slugSegments,
      groupSegments,
    ),
  );

  return entries;
}

export type TogstrekHikingPostSeriesNeighbor = {
  href: string;
  title: string;
};

/**
 * Previous / next trail post in the same hike folder, using the same order as
 * the hub list (`getTogstrekHikingPostsInGroup`). Omitted for root-level
 * single-segment posts (no parent folder).
 */
export function getTogstrekHikingPostSequentialNeighbors(
  postSlugSegments: string[],
): {
  prev?: TogstrekHikingPostSeriesNeighbor;
  next?: TogstrekHikingPostSeriesNeighbor;
} {
  if (postSlugSegments.length < 2) return {};
  const groupSegments = postSlugSegments.slice(0, -1);
  const posts = getTogstrekHikingPostsInGroup(groupSegments);
  const idx = posts.findIndex(
    (e) =>
      e.slugSegments.length === postSlugSegments.length &&
      e.slugSegments.every((s, i) => s === postSlugSegments[i]),
  );
  if (idx === -1) return {};
  const prev = idx > 0 ? posts[idx - 1] : undefined;
  const next = idx < posts.length - 1 ? posts[idx + 1] : undefined;
  return {
    prev: prev ? { href: prev.href, title: prev.title } : undefined,
    next: next ? { href: next.href, title: next.title } : undefined,
  };
}

export function buildSyntheticGroupFrontmatter(
  groupSegments: string[],
): { title: string; description: string } {
  return syntheticGroupCopy(groupSegments);
}
