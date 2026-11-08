/**
 * Pure logic for the automatic Instagram posting queue: which pages are
 * postable, in what order, and what the caption says. No filesystem or network
 * access here so it can be unit-tested; see `togstrek-instagram-collect.ts` for
 * reading content and `scripts/togstrek-instagram-publish.ts` for the runner.
 */

import { createHash } from "node:crypto";

export const TOGSTREK_INSTAGRAM_DEFAULT_MIN_WORDS = 120;
export const TOGSTREK_INSTAGRAM_MIN_DESCRIPTION_CHARS = 40;
/** Instagram feed images must sit between 4:5 (0.8) and 1.91:1 (width / height). */
export const TOGSTREK_INSTAGRAM_MIN_ASPECT = 0.8;
export const TOGSTREK_INSTAGRAM_MAX_ASPECT = 1.91;
const CAPTION_MAX_CHARS = 2200;
const CAPTION_DESCRIPTION_MAX_CHARS = 320;
const HASHTAG_LIMIT = 6;

export type TogstrekInstagramCandidate = {
  /** Stable id used in the state file, e.g. `place:asia/uzbekistan/khiva`. */
  key: string;
  kind: "place" | "hiking";
  title: string;
  description: string;
  /** Site path with a leading slash, e.g. `/asia/uzbekistan/khiva`. */
  path: string;
  /** Used to avoid posting the same country or trail twice in a row. */
  groupKey: string;
  /** Human label shown after the title, e.g. `Uzbekistan` or `Hiking`. */
  regionLabel: string;
  hashtags: string[];
  imageUrl: string;
  imageAlt?: string;
  imageWidth: number;
  imageHeight: number;
};

export type TogstrekInstagramState = {
  version: 1;
  /** How many times the whole queue has been worked through. */
  cycle: number;
  /** Candidate keys already posted in the current cycle. */
  posted: string[];
  last?: {
    key: string;
    groupKey: string;
    mediaId: string;
    postedAt: string;
  };
};

export function emptyTogstrekInstagramState(): TogstrekInstagramState {
  return { version: 1, cycle: 1, posted: [] };
}

/** Eligibility input: the parts of a content file the rules look at. */
export type TogstrekInstagramEligibilityInput = {
  draft?: unknown;
  title?: unknown;
  description?: unknown;
  heroImage?: unknown;
  body: string;
};

/**
 * Wording the brand guide rules out ("earnest, not hype") and the older
 * generic descriptions lean on. A page whose description uses these is held
 * back from the feed until the description is rewritten.
 */
export const TOGSTREK_INSTAGRAM_GENERIC_PHRASES: RegExp[] = [
  /\bcharming\b/i,
  /\bpicturesque\b/i,
  /\bstunning\b/i,
  /\bbreathtaking\b/i,
  /\bmust[- ](visit|see)\b/i,
  /\btestament to\b/i,
  /\bnestled\b/i,
  /\bvibrant\b/i,
  /\brich (tapestry|blend|history and)\b/i,
  /\bhidden gem\b/i,
  /\bcaptivating\b/i,
  /\bsomething for (everyone|everybody)\b/i,
  /\btreasure trove\b/i,
  /\bfoodie/i,
  /\bsensory\b/i,
  /\bbucket list\b/i,
];

export type TogstrekInstagramEligibility =
  | { ok: true }
  | { ok: false; reason: string };

/** Rough word count of the prose in an MDX body (images, JSX tags and markup removed). */
export function countTogstrekMdxProseWords(body: string): number {
  const text = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*---\s*$/gm, " ")
    .replace(/[*_`>|]/g, " ");
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  return words.length;
}

/** Title and description: any of these words means the page is not finished. */
const FRONTMATTER_PLACEHOLDER_PATTERNS: RegExp[] = [
  /placeholder/i,
  /\bstub\b/i,
  /\bdraft\b/i,
];

/**
 * Body: stub markers only. "Draft" is not checked here because it appears in
 * ordinary prose (draft beer).
 */
const BODY_PLACEHOLDER_PATTERNS: RegExp[] = [
  /placeholder/i,
  /\bstub\b/i,
  /^#{2,4}\s+name\s*$/im,
  /\bX{4,}\b/,
];

function readHero(raw: unknown): {
  src: string;
  width: number;
  height: number;
  alt?: string;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (
    typeof o.src !== "string" ||
    typeof o.width !== "number" ||
    typeof o.height !== "number"
  ) {
    return null;
  }
  return {
    src: o.src,
    width: o.width,
    height: o.height,
    alt: typeof o.alt === "string" && o.alt.trim() ? o.alt.trim() : undefined,
  };
}

/**
 * Pages are skipped, never posted, when they are drafts or stubs, have no usable
 * hero photo, or have too little writing to send people to.
 */
export function evaluateTogstrekInstagramEligibility(
  input: TogstrekInstagramEligibilityInput,
  opts: { minWords?: number; allowGeneric?: boolean } = {},
): TogstrekInstagramEligibility {
  const minWords = opts.minWords ?? TOGSTREK_INSTAGRAM_DEFAULT_MIN_WORDS;
  if (input.draft === true) return { ok: false, reason: "draft" };
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";
  if (!title) return { ok: false, reason: "no title" };
  if (description.length < TOGSTREK_INSTAGRAM_MIN_DESCRIPTION_CHARS) {
    return { ok: false, reason: "description too short" };
  }
  if (
    FRONTMATTER_PLACEHOLDER_PATTERNS.some(
      (re) => re.test(title) || re.test(description),
    ) ||
    BODY_PLACEHOLDER_PATTERNS.some((re) => re.test(input.body))
  ) {
    return { ok: false, reason: "placeholder or stub text" };
  }
  if (!/[.!?…”’")]$/.test(description)) {
    return { ok: false, reason: "description looks cut off" };
  }
  if (
    !opts.allowGeneric &&
    TOGSTREK_INSTAGRAM_GENERIC_PHRASES.some((re) => re.test(description))
  ) {
    return { ok: false, reason: "generic marketing wording in description" };
  }
  const hero = readHero(input.heroImage);
  if (!hero) return { ok: false, reason: "no hero image" };
  if (!/^https:\/\//i.test(hero.src)) {
    return { ok: false, reason: "hero is not an absolute https URL" };
  }
  if (!/\.jpe?g(\?.*)?$/i.test(hero.src)) {
    return { ok: false, reason: "hero is not a JPEG" };
  }
  const aspect = hero.width / hero.height;
  if (
    !(aspect >= TOGSTREK_INSTAGRAM_MIN_ASPECT) ||
    !(aspect <= TOGSTREK_INSTAGRAM_MAX_ASPECT)
  ) {
    return { ok: false, reason: "hero aspect ratio outside 4:5 to 1.91:1" };
  }
  if (countTogstrekMdxProseWords(input.body) < minWords) {
    return { ok: false, reason: `fewer than ${minWords} words of writing` };
  }
  return { ok: true };
}

export function readTogstrekInstagramHero(raw: unknown) {
  return readHero(raw);
}

const LOWERCASE_JOINERS = new Set(["and", "of", "the", "de", "la", "del"]);

/** `united-states-of-america` → `United States of America`. */
export function togstrekInstagramSegmentLabel(segment: string): string {
  if (segment === "turkiye") return "Türkiye";
  return segment
    .split("-")
    .filter(Boolean)
    .map((part, i) =>
      i > 0 && LOWERCASE_JOINERS.has(part)
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}

/** `United States of America` → `UnitedStatesofAmerica` (hashtag-safe, letters and digits only). */
const HASHTAG_LETTER_MAP: Record<string, string> = {
  æ: "ae", Æ: "Ae", ø: "o", Ø: "O", ð: "d", Ð: "D", þ: "th", Þ: "Th",
  ß: "ss", ł: "l", Ł: "L", đ: "d", Đ: "D", ı: "i", œ: "oe", Œ: "Oe",
};

export function togstrekInstagramHashtag(label: string): string {
  const compact = label
    .replace(/[æÆøØðÐþÞßłŁđĐıœŒ]/g, (ch) => HASHTAG_LETTER_MAP[ch] ?? ch)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "");
  return compact ? `#${compact}` : "";
}

export type TogstrekInstagramRejection = {
  key: string;
  path: string;
  reason: string;
};

/**
 * Page-specific hashtags (the caption adds `#togstrek #travel` itself): the
 * country, the page title when it is short enough to read as a tag, and
 * `#hiking` for trails.
 */
export function buildTogstrekInstagramCaptionHashtags(input: {
  kind: "place" | "hiking";
  regionLabel: string;
  title: string;
}): string[] {
  if (input.kind === "hiking") {
    return uniqueHashtags([
      "#hiking",
      togstrekInstagramHashtag(input.regionLabel || input.title),
    ]);
  }
  const out = [togstrekInstagramHashtag(input.regionLabel)];
  const titleTag = togstrekInstagramHashtag(input.title);
  if (titleTag.length > 1 && titleTag.length <= 25) out.push(titleTag);
  return uniqueHashtags(out);
}

export function uniqueHashtags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    if (!t || t === "#") continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= HASHTAG_LIMIT) break;
  }
  return out;
}

/** Trim to whole words (preferring a sentence end) and add an ellipsis when cut. */
export function truncateAtWord(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const sentenceEnd = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? "),
  );
  if (sentenceEnd > max * 0.5) return slice.slice(0, sentenceEnd + 1).trim();
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.5 ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[,;:\s]+$/, "")}…`;
}

/**
 * Template caption: `Title, Region`, the page description, the page address
 * (Instagram does not make caption links clickable), then a few hashtags.
 */
export function buildTogstrekInstagramCaption(
  c: TogstrekInstagramCandidate,
  siteOrigin: string,
): string {
  const host = siteOrigin.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const headline =
    c.regionLabel && c.regionLabel !== c.title
      ? `${c.title}, ${c.regionLabel}`
      : c.title;
  const body = truncateAtWord(c.description, CAPTION_DESCRIPTION_MAX_CHARS);
  const parts = [
    headline,
    body,
    `Full guide: ${host}${c.path}`,
    uniqueHashtags(["#togstrek", "#travel", ...c.hashtags]).join(" "),
  ].filter(Boolean);
  const caption = parts.join("\n\n");
  return caption.length <= CAPTION_MAX_CHARS
    ? caption
    : caption.slice(0, CAPTION_MAX_CHARS - 1) + "…";
}

const BOILERPLATE_HIKING_DESCRIPTION =
  /stage notes, terrain,? and photos|^field notes from\b/i;

/**
 * Many hiking descriptions are boilerplate ("…stage notes, terrain, and
 * photos."). Those are replaced with a line built from the page's own trail
 * facts; a real description is kept as written.
 */
export function buildTogstrekInstagramHikingSummary(input: {
  description: string;
  trailLabel: string;
  distanceKm?: number;
  difficulty?: string;
}): string {
  if (!BOILERPLATE_HIKING_DESCRIPTION.test(input.description)) {
    return input.description;
  }
  const facts: string[] = [];
  if (input.distanceKm !== undefined) {
    facts.push(`${Number.isInteger(input.distanceKm) ? input.distanceKm : input.distanceKm.toFixed(1)} km`);
  }
  if (input.difficulty) facts.push(`${input.difficulty.toLowerCase()} difficulty`);
  const lead = input.trailLabel
    ? `A stage of the ${input.trailLabel}`
    : "A hike from the trail notes";
  return facts.length > 0 ? `${lead}: ${facts.join(", ")}.` : `${lead}.`;
}

/** Stable pseudo-random order: a page keeps its slot when other pages are added. */
export function togstrekInstagramOrderKey(seed: string, key: string): string {
  return createHash("sha1").update(`${seed}:${key}`).digest("hex");
}

export function orderTogstrekInstagramCandidates(
  candidates: TogstrekInstagramCandidate[],
  seed: string,
): TogstrekInstagramCandidate[] {
  return [...candidates]
    .map((c) => ({ c, k: togstrekInstagramOrderKey(seed, c.key) }))
    .sort((a, b) => (a.k < b.k ? -1 : a.k > b.k ? 1 : 0))
    .map((x) => x.c);
}

/**
 * Starts a fresh cycle once every postable page has been posted. Posted keys
 * that no longer exist (renamed or removed pages) are dropped.
 */
export function normalizeTogstrekInstagramState(
  state: TogstrekInstagramState,
  candidates: TogstrekInstagramCandidate[],
): TogstrekInstagramState {
  const live = new Set(candidates.map((c) => c.key));
  const posted = state.posted.filter((k) => live.has(k));
  const allPosted = candidates.length > 0 && posted.length >= candidates.length;
  if (allPosted) {
    return { ...state, cycle: state.cycle + 1, posted: [] };
  }
  return { ...state, posted };
}

/**
 * Candidates in the order to try them: not yet posted this cycle, in queue
 * order, with pages from the same group as the last post pushed to the back so
 * the feed does not run ten Kyrgyzstan posts in a row.
 */
export function pickNextTogstrekInstagramCandidates(
  ordered: TogstrekInstagramCandidate[],
  state: TogstrekInstagramState,
  limit = 10,
): TogstrekInstagramCandidate[] {
  const posted = new Set(state.posted);
  const remaining = ordered.filter((c) => !posted.has(c.key));
  const lastGroup = state.last?.groupKey;
  if (!lastGroup) return remaining.slice(0, limit);
  const different = remaining.filter((c) => c.groupKey !== lastGroup);
  const same = remaining.filter((c) => c.groupKey === lastGroup);
  return [...different, ...same].slice(0, limit);
}

export function recordTogstrekInstagramPost(
  state: TogstrekInstagramState,
  c: TogstrekInstagramCandidate,
  mediaId: string,
  postedAt: string,
): TogstrekInstagramState {
  return {
    ...state,
    posted: state.posted.includes(c.key) ? state.posted : [...state.posted, c.key],
    last: { key: c.key, groupKey: c.groupKey, mediaId, postedAt },
  };
}
