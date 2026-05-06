import {
  listSortedTogstrekAdventureArchiveItems,
  loadTogstrekAdventureFrontmatterOnly,
} from "@/lib/togstrek-adventure-content-fs";
import { isTogstrekContinentHubRouteSlug } from "@/data/togstrek-continent-hub-meta";
import {
  discoverTogstrekHikingSlugLists,
  loadTogstrekHikingFrontmatterOnly,
  resolveTogstrekHikingRoute,
} from "@/lib/togstrek-hiking-content-fs";
import {
  discoverTogstrekOtherWorkSlugLists,
  loadTogstrekOtherWorkFrontmatterOnly,
} from "@/lib/togstrek-load-other-work-mdx";
import {
  discoverTogstrekPhotographySlugLists,
  loadTogstrekPhotographyFrontmatterOnly,
} from "@/lib/togstrek-load-photography-mdx";
import {
  discoverTogstrekPlaceSlugs,
  loadTogstrekPlaceFrontmatterOnly,
} from "@/lib/togstrek-load-place-mdx";
import { buildTogstrekPlacePublicPath } from "@/lib/togstrek-place-path";
import {
  togstrekSitemapLastModifiedForPlace,
} from "@/lib/togstrek-sitemap-last-modified";
import { getTogstrekSiteOrigin } from "@/lib/togstrek-site-url";

export type TogstrekRssSection =
  | "adventures"
  | "places"
  | "hiking"
  | "photography"
  | "other-work";

export type TogstrekRssFeedBuildOptions = {
  /** Path only, e.g. `/feed.xml` — used for `<atom:link rel="self" />`. */
  selfPath: string;
  /** When set, only that content type (places + `continent` narrows further). */
  section?: TogstrekRssSection;
  /** When set with `section=places` (or all), only place pages under this continent slug. */
  continent?: string;
  /** Max `<item>` rows after merge + sort (newest first). */
  maxItems?: number;
};

export type TogstrekRssItem = {
  title: string;
  link: string;
  guid: string;
  pubDate: Date;
  description: string;
  category?: string;
};

const RSS_NS =
  'xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/"';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(text: string): string {
  return `<![CDATA[${text.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function parseIsoDate(value: string | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(value.trim());
  return Number.isFinite(d.getTime()) ? d : undefined;
}

function pubDateForContent(
  published: string | undefined,
  modified: string | undefined,
  fileMtime?: Date,
): Date {
  return (
    parseIsoDate(published) ??
    parseIsoDate(modified) ??
    fileMtime ??
    new Date(0)
  );
}

function rfc822(d: Date): string {
  return d.toUTCString();
}

function normalizeSection(raw: string | null): TogstrekRssSection | undefined {
  if (!raw) return undefined;
  const s = raw.trim().toLowerCase();
  if (
    s === "adventures" ||
    s === "places" ||
    s === "hiking" ||
    s === "photography" ||
    s === "other-work"
  ) {
    return s;
  }
  return undefined;
}

function normalizeContinent(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const c = raw.trim().toLowerCase();
  return isTogstrekContinentHubRouteSlug(c) ? c : undefined;
}

export function parseTogstrekRssQuery(url: URL): {
  section?: TogstrekRssSection;
  continent?: string;
} {
  const section = normalizeSection(url.searchParams.get("section"));
  const continent = normalizeContinent(url.searchParams.get("continent"));
  return { section, continent };
}

/**
 * Canonical feed URL (stable `section` / `continent` order) for redirects and
 * cache keys. Bots append `utm_*`, `fbclid`, etc.; without a 308 to here, each
 * unique query string can become a separate ISR entry on Vercel.
 */
export function togstrekRssCanonicalFeedUrl(url: URL): URL {
  const out = new URL(url.href);
  out.hash = "";
  const { section, continent } = parseTogstrekRssQuery(url);
  out.search = "";
  if (section) out.searchParams.set("section", section);
  if (continent) out.searchParams.set("continent", continent);
  return out;
}

/** True when the request should 308 to {@link togstrekRssCanonicalFeedUrl}. */
export function togstrekRssShouldRedirectToCanonicalFeedUrl(url: URL): boolean {
  if (url.searchParams.getAll("section").length > 1) return true;
  if (url.searchParams.getAll("continent").length > 1) return true;
  for (const key of new Set(url.searchParams.keys())) {
    if (key !== "section" && key !== "continent") return true;
  }
  const rawS = url.searchParams.get("section");
  if (rawS !== null && normalizeSection(rawS) === undefined) return true;
  const rawC = url.searchParams.get("continent");
  if (rawC !== null && normalizeContinent(rawC) === undefined) return true;

  const canon = togstrekRssCanonicalFeedUrl(url);
  return url.pathname !== canon.pathname || url.search !== canon.search;
}

function adventureItems(origin: string): TogstrekRssItem[] {
  const out: TogstrekRssItem[] = [];
  for (const row of listSortedTogstrekAdventureArchiveItems()) {
    const slug = row.href.replace(/^\/adventures\//, "");
    const fm = loadTogstrekAdventureFrontmatterOnly(slug);
    const url = `${origin}${row.href}`;
    const when = pubDateForContent(fm.published, fm.modified);
    if (when.getTime() === 0) continue;
    out.push({
      title: fm.title,
      link: url,
      guid: url,
      pubDate: when,
      description: fm.description?.trim() || fm.title,
      category: "adventures",
    });
  }
  return out;
}

function placeItems(origin: string, continent?: string): TogstrekRssItem[] {
  const out: TogstrekRssItem[] = [];
  for (const { continent: c, country, place } of discoverTogstrekPlaceSlugs()) {
    if (continent && c !== continent) continue;
    const fm = loadTogstrekPlaceFrontmatterOnly(c, country, place);
    if (fm.draft) continue;
    const path = buildTogstrekPlacePublicPath(c, country, place);
    const url = `${origin}${path}`;
    const mtime = togstrekSitemapLastModifiedForPlace(c, country, place);
    const when = pubDateForContent(fm.published, fm.modified, mtime);
    if (when.getTime() === 0) continue;
    out.push({
      title: fm.title,
      link: url,
      guid: url,
      pubDate: when,
      description: fm.description?.trim() || fm.title,
      category: "places",
    });
  }
  return out;
}

function hikingItems(origin: string): TogstrekRssItem[] {
  const out: TogstrekRssItem[] = [];
  for (const segments of discoverTogstrekHikingSlugLists()) {
    if (segments.length === 0) continue;
    const resolved = resolveTogstrekHikingRoute(segments);
    if (!resolved || resolved.kind !== "post") continue;
    const fm = loadTogstrekHikingFrontmatterOnly(segments);
    const path = `/hiking/${segments.join("/")}`;
    const url = `${origin}${path}`;
    const when = pubDateForContent(fm.published, fm.modified);
    if (when.getTime() === 0) continue;
    out.push({
      title: fm.title,
      link: url,
      guid: url,
      pubDate: when,
      description: fm.description?.trim() || fm.title,
      category: "hiking",
    });
  }
  return out;
}

function photographyItems(origin: string): TogstrekRssItem[] {
  const out: TogstrekRssItem[] = [];
  for (const segments of discoverTogstrekPhotographySlugLists()) {
    const fm = loadTogstrekPhotographyFrontmatterOnly(segments);
    const path = `/photography/${segments.join("/")}`;
    const url = `${origin}${path}`;
    const when = pubDateForContent(fm.published, fm.modified);
    if (when.getTime() === 0) continue;
    out.push({
      title: fm.title,
      link: url,
      guid: url,
      pubDate: when,
      description: fm.description?.trim() || fm.title,
      category: "photography",
    });
  }
  return out;
}

function otherWorkItems(origin: string): TogstrekRssItem[] {
  const out: TogstrekRssItem[] = [];
  for (const segments of discoverTogstrekOtherWorkSlugLists()) {
    if (segments.length === 0) continue;
    const fm = loadTogstrekOtherWorkFrontmatterOnly(segments);
    const path = `/other-work/${segments.join("/")}`;
    const url = `${origin}${path}`;
    const when = pubDateForContent(fm.published, fm.modified);
    if (when.getTime() === 0) continue;
    out.push({
      title: fm.title,
      link: url,
      guid: url,
      pubDate: when,
      description: fm.description?.trim() || fm.title,
      category: "other-work",
    });
  }
  return out;
}

function mergeAndCap(items: TogstrekRssItem[], max: number): TogstrekRssItem[] {
  return [...items]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, max);
}

function channelTitle(opts: TogstrekRssFeedBuildOptions): string {
  if (opts.continent && (!opts.section || opts.section === "places")) {
    return `A Tog's Trek — ${opts.continent.replace(/-/g, " ")} places`;
  }
  if (opts.section === "adventures") return "A Tog's Trek — Adventures";
  if (opts.section === "places") return "A Tog's Trek — Places";
  if (opts.section === "hiking") return "A Tog's Trek — Hiking";
  if (opts.section === "photography") return "A Tog's Trek — Photography";
  if (opts.section === "other-work") return "A Tog's Trek — Other work";
  return "A Tog's Trek";
}

function channelDescription(opts: TogstrekRssFeedBuildOptions): string {
  if (opts.continent && (!opts.section || opts.section === "places")) {
    return `Latest updates across place guides in ${opts.continent.replace(/-/g, " ")}.`;
  }
  if (opts.section) {
    return `Latest updates — ${opts.section.replace(/-/g, " ")}.`;
  }
  return "Latest updates across adventures, places, hiking, photography, and other work.";
}

export function buildTogstrekRssDocument(opts: TogstrekRssFeedBuildOptions): string {
  const origin = getTogstrekSiteOrigin().replace(/\/+$/, "");
  const selfUrl = `${origin}${opts.selfPath}`;
  const max = opts.maxItems ?? 300;
  /** `continent` without `section` ⇒ places-only regional feed (per-site convention). */
  const continent = opts.continent;
  const section =
    continent && !opts.section ? ("places" as const) : opts.section;

  const items: TogstrekRssItem[] = [];
  const want = (s: TogstrekRssSection) => !section || section === s;

  if (want("adventures")) items.push(...adventureItems(origin));
  if (want("places")) items.push(...placeItems(origin, continent));
  if (want("hiking")) items.push(...hikingItems(origin));
  if (want("photography")) items.push(...photographyItems(origin));
  if (want("other-work")) items.push(...otherWorkItems(origin));

  const capped = mergeAndCap(items, max);
  const lastBuild = capped[0]?.pubDate ?? new Date();
  const title = channelTitle({ ...opts, section, continent });
  const desc = channelDescription({ ...opts, section, continent });

  const itemXml = capped
    .map(
      (it) => `    <item>
      <title>${escapeXml(it.title)}</title>
      <link>${escapeXml(it.link)}</link>
      <guid isPermaLink="true">${escapeXml(it.guid)}</guid>
      <pubDate>${rfc822(it.pubDate)}</pubDate>
      ${it.category ? `<category>${escapeXml(it.category)}</category>` : ""}
      <description>${cdata(it.description)}</description>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" ${RSS_NS}>
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(origin + "/")}</link>
    <description>${escapeXml(desc)}</description>
    <language>en-gb</language>
    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>
    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml" />
    <generator>A Tog's Trek (Next.js)</generator>
${itemXml}
  </channel>
</rss>
`;
}
