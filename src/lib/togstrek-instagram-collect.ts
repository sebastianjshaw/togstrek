/**
 * Reads `content/places/**` and `content/hiking/**` and returns the pages that
 * can be posted to Instagram, plus the pages that were skipped and why.
 *
 * Adventures and the photography / Other Work sections are deliberately not
 * included: only places and hiking go to the feed.
 */

import fs from "node:fs";

import matter from "gray-matter";

import {
  buildTogstrekInstagramCaptionHashtags,
  buildTogstrekInstagramHikingSummary,
  evaluateTogstrekInstagramEligibility,
  readTogstrekInstagramHero,
  togstrekInstagramSegmentLabel,
  type TogstrekInstagramCandidate,
  type TogstrekInstagramRejection,
} from "@/lib/togstrek-instagram-post";
import {
  discoverTogstrekHikingSlugLists,
  hikingMdxFilePath,
} from "@/lib/togstrek-hiking-content-fs";
import { extractTogstrekHikingTrailFactsFromMarkdown } from "@/lib/togstrek-hiking-trail-facts";
import {
  discoverTogstrekPlaceSlugs,
  togstrekPlaceMdxFilePath,
} from "@/lib/togstrek-place-mdx-fs";
import {
  buildTogstrekPlacePublicPath,
  TOGSTREK_ANTARCTICA_COUNTRY_SLUG,
} from "@/lib/togstrek-place-path";

export type TogstrekInstagramCollectResult = {
  eligible: TogstrekInstagramCandidate[];
  rejected: TogstrekInstagramRejection[];
};

type Parsed = { data: Record<string, unknown>; body: string };

function readMdx(filePath: string): Parsed {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { data: data as Record<string, unknown>, body: content };
}

function toCandidate(
  base: Pick<
    TogstrekInstagramCandidate,
    "key" | "kind" | "path" | "groupKey" | "regionLabel"
  >,
  parsed: Parsed,
): TogstrekInstagramCandidate | null {
  const hero = readTogstrekInstagramHero(parsed.data.heroImage);
  const title =
    typeof parsed.data.title === "string" ? parsed.data.title.trim() : "";
  const description =
    typeof parsed.data.description === "string"
      ? parsed.data.description.trim()
      : "";
  if (!hero || !title || !description) return null;
  return {
    key: base.key,
    kind: base.kind,
    title,
    description,
    path: base.path,
    groupKey: base.groupKey,
    regionLabel: base.regionLabel,
    hashtags: buildTogstrekInstagramCaptionHashtags({
      kind: base.kind,
      regionLabel: base.regionLabel,
      title,
    }),
    imageUrl: hero.src,
    imageAlt: hero.alt,
    imageWidth: hero.width,
    imageHeight: hero.height,
  };
}

export function collectTogstrekInstagramCandidates(
  opts: { minWords?: number; allowGeneric?: boolean } = {},
): TogstrekInstagramCollectResult {
  const eligible: TogstrekInstagramCandidate[] = [];
  const rejected: TogstrekInstagramRejection[] = [];

  for (const { continent, country, place } of discoverTogstrekPlaceSlugs()) {
    const key = `place:${continent}/${country}/${place.join("/")}`;
    const publicPath = buildTogstrekPlacePublicPath(continent, country, place);
    let parsed: Parsed;
    try {
      parsed = readMdx(togstrekPlaceMdxFilePath(continent, country, place));
    } catch {
      rejected.push({ key, path: publicPath, reason: "unreadable file" });
      continue;
    }
    const verdict = evaluateTogstrekInstagramEligibility(
      { ...parsed.data, body: parsed.body },
      opts,
    );
    if (!verdict.ok) {
      rejected.push({ key, path: publicPath, reason: verdict.reason });
      continue;
    }
    const regionLabel =
      continent === "antarctica" && country === TOGSTREK_ANTARCTICA_COUNTRY_SLUG
        ? "Antarctica"
        : togstrekInstagramSegmentLabel(country);
    const c = toCandidate(
      {
        key,
        kind: "place",
        path: publicPath,
        groupKey: `${continent}/${country}`,
        regionLabel,
      },
      parsed,
    );
    if (c) eligible.push(c);
    else rejected.push({ key, path: publicPath, reason: "missing fields" });
  }

  for (const slug of discoverTogstrekHikingSlugLists()) {
    if (slug.length === 0) continue;
    const key = `hiking:${slug.join("/")}`;
    const publicPath = `/hiking/${slug.join("/")}`;
    let parsed: Parsed;
    try {
      parsed = readMdx(hikingMdxFilePath(slug));
    } catch {
      rejected.push({ key, path: publicPath, reason: "unreadable file" });
      continue;
    }
    const verdict = evaluateTogstrekInstagramEligibility(
      { ...parsed.data, body: parsed.body },
      opts,
    );
    if (!verdict.ok) {
      rejected.push({ key, path: publicPath, reason: verdict.reason });
      continue;
    }
    const trailLabel = slug.length > 1 ? togstrekInstagramSegmentLabel(slug[0]!) : "";
    const facts = extractTogstrekHikingTrailFactsFromMarkdown(parsed.body);
    const c = toCandidate(
      {
        key,
        kind: "hiking",
        path: publicPath,
        groupKey: `hiking/${slug[0]}`,
        regionLabel: trailLabel,
      },
      parsed,
    );
    if (c) {
      c.description = buildTogstrekInstagramHikingSummary({
        description: c.description,
        trailLabel,
        distanceKm: facts.distanceKm,
        difficulty: facts.difficulty,
      });
      eligible.push(c);
    }
    else rejected.push({ key, path: publicPath, reason: "missing fields" });
  }

  return { eligible, rejected };
}
