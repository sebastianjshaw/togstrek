/**
 * Scan HTTrack backup `TogsTrekBackup/togstrek.com` and emit:
 * - `migration/migration-inventory.jsonl` — one JSON object per HTML file
 * - `migration/path-mapping.template.csv` — review / override slugs before MDX + CDN work
 *
 * Run: `npm run inventory:squarespace`
 */

import * as fs from "node:fs";
import * as path from "node:path";

const REPO_ROOT = process.cwd();
const BACKUP_ROOT = path.join(REPO_ROOT, "TogsTrekBackup", "togstrek.com");
const OUT_DIR = path.join(REPO_ROOT, "migration");

const CONTINENT_SLUGS = new Set([
  "africa",
  "antarctica",
  "asia",
  "europe",
  "north-america",
  "oceania",
  "south-america",
]);

type Classification =
  | "noise_https"
  | "noise_embed"
  | "noise_template"
  | "tag"
  | "category"
  | "blog_tagged"
  | "blog"
  | "photography"
  | "adventures"
  | "hiking"
  | "other_work"
  | "root_misc"
  | "continent_place_candidate"
  | "continent_hub_or_listing";

type InventoryRow = {
  backupRelativePath: string;
  classification: Classification;
  segmentCount: number;
  /** Path segments under togstrek.com (no .html on last) */
  segments: string[];
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  squarespaceFullUrl: string | null;
  /** First path segment if it is a known continent */
  continentSegment: string | null;
  /** Heuristic: first folder after continent (often country) */
  suggestedCountrySlug: string | null;
  /** Heuristic: last path segment (filename without .html) */
  suggestedPlaceSlug: string | null;
};

function walkHtmlFiles(dir: string, acc: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkHtmlFiles(full, acc);
    } else if (ent.isFile() && ent.name.endsWith(".html")) {
      acc.push(full);
    }
  }
  return acc;
}

function extractMeta(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)="${name}"[^>]+content="([^"]*)"`,
    "i",
  );
  const m = html.match(re);
  if (m) return decodeHtmlEntities(m[1]!.trim()) || null;
  const re2 = new RegExp(
    `<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${name}"`,
    "i",
  );
  const m2 = html.match(re2);
  return m2 ? decodeHtmlEntities(m2[1]!.trim()) || null : null;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&mdash;/g, "—")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

function extractSquarespaceFullUrl(html: string): string | null {
  const m = html.match(/"fullUrl"\s*:\s*"(\/[^"]+)"/);
  return m ? m[1]! : null;
}

function classify(relativePosix: string, baseName: string): Classification {
  const lower = relativePosix.toLowerCase();
  if (
    lower.includes("/_https_/") ||
    lower.startsWith("_https_/") ||
    lower.includes("/_/cdn.embedly")
  ) {
    return "noise_https";
  }
  if (lower.includes("/www.youtube.com/") || lower.includes("youtube.com/embed")) {
    return "noise_embed";
  }
  if (/^template-|^template_/i.test(baseName) || lower.includes("/template-")) {
    return "noise_template";
  }
  if (lower.includes("/tag/")) return "tag";
  if (lower.includes("/category/")) return "category";
  if (lower.includes("/blog/tagged/")) return "blog_tagged";
  if (lower.startsWith("blog/")) return "blog";
  if (lower.startsWith("photography/")) return "photography";
  if (lower.startsWith("adventures/")) return "adventures";
  if (lower.startsWith("hiking/")) return "hiking";
  if (lower.startsWith("other-work/")) return "other_work";

  const segments = relativePosix.split("/").filter(Boolean);
  const first = segments[0] ?? "";

  if (CONTINENT_SLUGS.has(first)) {
    if (segments.length <= 1) return "continent_hub_or_listing";
    const rest = segments.slice(1);
    const hasOnlyTagOrCategory = rest.some(
      (s) => s === "tag" || s === "category",
    );
    if (hasOnlyTagOrCategory) return "continent_hub_or_listing";
    return "continent_place_candidate";
  }

  return "root_misc";
}

function parsePath(relativePosix: string): {
  segments: string[];
  segmentCount: number;
} {
  const parts = relativePosix.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  if (last?.endsWith(".html")) {
    parts[parts.length - 1] = last.slice(0, -5);
  }
  return { segments: parts, segmentCount: parts.length };
}

function suggestSlugs(
  classification: Classification,
  segments: string[],
): {
  continentSegment: string | null;
  suggestedCountrySlug: string | null;
  suggestedPlaceSlug: string | null;
} {
  if (!CONTINENT_SLUGS.has(segments[0] ?? "")) {
    return {
      continentSegment: null,
      suggestedCountrySlug: null,
      suggestedPlaceSlug: null,
    };
  }
  const continent = segments[0]!;
  if (classification !== "continent_place_candidate") {
    return {
      continentSegment: continent,
      suggestedCountrySlug: null,
      suggestedPlaceSlug: null,
    };
  }
  if (segments.length < 2) {
    return {
      continentSegment: continent,
      suggestedCountrySlug: null,
      suggestedPlaceSlug: null,
    };
  }
  const tail = segments.slice(1);
  const place = tail[tail.length - 1] ?? null;
  const country = tail.length >= 2 ? tail[0]! : null;
  return {
    continentSegment: continent,
    suggestedCountrySlug: country,
    suggestedPlaceSlug: place,
  };
}

function csvEscape(field: string): string {
  if (/[",\n\r]/.test(field)) return `"${field.replace(/"/g, '""')}"`;
  return field;
}

function main(): void {
  if (!fs.existsSync(BACKUP_ROOT)) {
    console.error(
      `Missing backup folder: ${BACKUP_ROOT}\n` +
        "Add HTTrack output at TogsTrekBackup/togstrek.com and re-run.",
    );
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = walkHtmlFiles(BACKUP_ROOT);
  const jsonlPath = path.join(OUT_DIR, "migration-inventory.jsonl");
  const csvPath = path.join(OUT_DIR, "path-mapping.template.csv");

  const counts: Record<string, number> = {};
  const jsonlLines: string[] = [];
  const csvRows: string[] = [
    [
      "backup_relative_path",
      "classification",
      "segment_count",
      "squarespace_full_url",
      "og_title",
      "continent_segment",
      "suggested_country_slug",
      "suggested_place_slug",
      "final_continent_slug",
      "final_country_slug",
      "final_place_slug",
      "notes",
    ].join(","),
  ];

  for (const abs of files) {
    const relativePosix = path
      .relative(BACKUP_ROOT, abs)
      .split(path.sep)
      .join("/");
    const baseName = path.basename(abs);
    const classification = classify(relativePosix, baseName);
    counts[classification] = (counts[classification] ?? 0) + 1;

    let html = "";
    try {
      html = fs.readFileSync(abs, "utf8");
    } catch {
      continue;
    }

    const { segments, segmentCount } = parsePath(relativePosix);
    const ogTitle =
      extractMeta(html, "og:title") ?? extractMeta(html, "twitter:title");
    const ogDescription =
      extractMeta(html, "og:description") ??
      extractMeta(html, "description") ??
      extractMeta(html, "twitter:description");
    const ogImage =
      extractMeta(html, "og:image") ?? extractMeta(html, "twitter:image");
    const squarespaceFullUrl = extractSquarespaceFullUrl(html);

    const { continentSegment, suggestedCountrySlug, suggestedPlaceSlug } =
      suggestSlugs(classification, segments);

    const row: InventoryRow = {
      backupRelativePath: relativePosix,
      classification,
      segmentCount,
      segments,
      ogTitle,
      ogDescription,
      ogImage,
      squarespaceFullUrl,
      continentSegment,
      suggestedCountrySlug,
      suggestedPlaceSlug,
    };

    jsonlLines.push(JSON.stringify(row));

    csvRows.push(
      [
        csvEscape(relativePosix),
        csvEscape(classification),
        String(segmentCount),
        csvEscape(squarespaceFullUrl ?? ""),
        csvEscape(ogTitle ?? ""),
        csvEscape(continentSegment ?? ""),
        csvEscape(suggestedCountrySlug ?? ""),
        csvEscape(suggestedPlaceSlug ?? ""),
        "", // final_continent_slug — fill after review
        "",
        "",
        "",
      ].join(","),
    );
  }

  fs.writeFileSync(jsonlPath, jsonlLines.join("\n") + "\n", "utf8");
  fs.writeFileSync(csvPath, csvRows.join("\n") + "\n", "utf8");

  const order = [
    "continent_place_candidate",
    "tag",
    "category",
    "continent_hub_or_listing",
    "photography",
    "blog",
    "blog_tagged",
    "adventures",
    "hiking",
    "other_work",
    "root_misc",
    "noise_https",
    "noise_embed",
    "noise_template",
  ];

  console.log("Squarespace backup inventory\n");
  console.log(`Backup root: ${BACKUP_ROOT}`);
  console.log(`HTML files:  ${files.length}`);
  console.log(`Wrote:       ${jsonlPath}`);
  console.log(`Wrote:       ${csvPath}\n`);
  console.log("Classification counts (review place vs tag/category before bulk MDX):\n");

  const keys = Object.keys(counts).sort(
    (a, b) => (order.indexOf(a) === -1 ? 999 : order.indexOf(a)) -
      (order.indexOf(b) === -1 ? 999 : order.indexOf(b)),
  );
  for (const k of keys) {
    console.log(`  ${k.padEnd(28)} ${counts[k]}`);
  }

  const placeLike = counts["continent_place_candidate"] ?? 0;
  const tags = counts["tag"] ?? 0;
  const categories = counts["category"] ?? 0;
  console.log("\n---");
  console.log(
    `Place candidates (continent tree, not tag/category): ${placeLike}`,
  );
  console.log(`Tag listing pages:                          ${tags}`);
  console.log(`Category listing pages:                     ${categories}`);
  console.log("\nNext: fill final_* columns in path-mapping.template.csv for UK /");
  console.log("multi-segment paths, then lock slug rules before MDX + CDN scripts.");
}

main();
