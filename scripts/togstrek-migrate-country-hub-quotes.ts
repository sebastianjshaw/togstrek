/**
 * Extract per-country hero quotes from the Squarespace HTTrack mirror and merge
 * into `src/data/togstrek-country-hub-list-quotes.ts` (keyed by ISO2).
 *
 * Original pages expose a headline (`h1`/`h2` in `.sqs-html-content`) plus a
 * right-aligned attribution line (`em` in the following block). See e.g.
 * `TogsTrekBackup/togstrek.com/denmark.html` and `argentina.html`.
 *
 * Usage:
 *   npx tsx scripts/togstrek-migrate-country-hub-quotes.ts --dry-run
 *   npx tsx scripts/togstrek-migrate-country-hub-quotes.ts --apply
 *   npx tsx scripts/togstrek-migrate-country-hub-quotes.ts --backup /path/to/TogsTrekBackup --apply
 *
 * `--apply` merges extracted quotes over existing entries (backup wins when both exist).
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { load } from "cheerio";

import {
  type TogstrekCountryHubHeaderQuote,
  togstrekCountryHubHeaderQuoteByIso2 as existingQuotes,
} from "@/data/togstrek-country-hub-list-quotes";
import { togstrekUnCountryNameToUrlSlug } from "@/lib/togstrek-geo-labels";
import { discoverTogstrekCountryHubParams } from "@/lib/togstrek-place-mdx-fs";
import { togstrekUn195Countries } from "@/data/togstrek-un195-countries";

const REPO_ROOT = process.cwd();

/** Same overrides as `getIso2ForCountrySlug` — keep in sync with `togstrek-visited-travel-data.ts`. */
const TOGSTREK_COUNTRY_SLUG_ISO2: Record<string, string> = {
  "czech-republic": "CZ",
  liechtenstein: "LI",
  lichtenstein: "LI",
  antarctic: "AQ",
  "hong-kong": "HK",
  turkiye: "TR",
  turkey: "TR",
  "united-states-of-america": "US",
  usa: "US",
};

function getIso2ForCountrySlug(
  continent: string,
  countrySlug: string,
): string | undefined {
  const mapped = TOGSTREK_COUNTRY_SLUG_ISO2[countrySlug.toLowerCase()];
  if (mapped) return mapped;
  const row = togstrekUn195Countries.find(
    (c) =>
      c.continent === continent &&
      togstrekUnCountryNameToUrlSlug(c.name) === countrySlug,
  );
  return row?.iso2;
}

const QUOTES_TS = path.join(
  REPO_ROOT,
  "src/data/togstrek-country-hub-list-quotes.ts",
);
const JSON_OUT = path.join(
  REPO_ROOT,
  "migration/country-hub-quotes.extracted.json",
);

/** Backup folder names that differ from the live site country slug. */
const COUNTRY_SLUG_BACKUP_ALIASES: Record<string, string[]> = {
  turkiye: ["turkey", "turkiye"],
};

/** Root HTML files keyed by `continent/country` when the mirror uses a different slug. */
const COUNTRY_HUB_BACKUP_ROOT_HTML: Record<string, string> = {
  "antarctica/antarctic": "antarctica.html",
};

/**
 * Extra mirror paths relative to `togstrek.com/` when there is no `{slug}.html`
 * (avoid blanket `category/` matching — e.g. Dominican Republic category pages are not country hubs).
 */
const COUNTRY_HUB_BACKUP_RELATIVE_EXTRA: Record<string, string> = {
  belgium: "europe/category/Belgium.html",
};

function resolveBackupRoot(cli: string | undefined): string {
  if (cli?.trim()) return path.resolve(REPO_ROOT, cli.trim());
  const env = process.env.TOGSTREK_MEDIA_BACKUP_ROOT?.trim();
  if (env) return path.resolve(env);
  return path.resolve(REPO_ROOT, "TogsTrekBackup");
}

function parseArgs(argv: string[]): {
  dryRun: boolean;
  apply: boolean;
  backup?: string;
} {
  let dryRun = false;
  let apply = false;
  let backup: string | undefined;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") dryRun = true;
    else if (a === "--apply") apply = true;
    else if (a === "--backup" && argv[i + 1]) {
      backup = argv[++i];
    }
  }
  if (!dryRun && !apply) dryRun = true;
  return { dryRun, apply, backup };
}

function slugCandidates(countrySlug: string): string[] {
  const extra = COUNTRY_SLUG_BACKUP_ALIASES[countrySlug] ?? [];
  const out = [countrySlug, ...extra];
  return [...new Set(out)];
}

function isUsableHtmlFile(filePath: string): boolean {
  try {
    const st = fs.statSync(filePath);
    return st.isFile() && st.size >= 80;
  } catch {
    return false;
  }
}

function resolveCountryHubHtml(
  togstrekCom: string,
  continent: string,
  countrySlug: string,
): string | null {
  const override = COUNTRY_HUB_BACKUP_ROOT_HTML[`${continent}/${countrySlug}`];
  if (override) {
    const p = path.join(togstrekCom, override);
    if (isUsableHtmlFile(p)) return p;
  }
  const extraRel = COUNTRY_HUB_BACKUP_RELATIVE_EXTRA[countrySlug];
  if (extraRel) {
    const p = path.join(togstrekCom, extraRel);
    if (isUsableHtmlFile(p)) return p;
  }
  for (const slug of slugCandidates(countrySlug)) {
    const candidates = [
      path.join(togstrekCom, `${slug}.html`),
      path.join(togstrekCom, continent, `${slug}.html`),
    ];
    for (const p of candidates) {
      if (isUsableHtmlFile(p)) return p;
    }
  }
  return null;
}

function normalizeAttribution(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .replace(/^[\s\-–—:]+/, "")
    .trim();
}

function normalizeBody(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/**
 * First `section.page-section` under `article#sections` / `article.sections`:
 * first `.sqs-html-content` block that contains `h1`/`h2` (including nested
 * fluid/scaled wrappers), plus attribution from the adjacent block (`em` in the
 * next block, or — for layouts like Latvia — the previous block).
 */
function extractCountryHubQuoteFromHtml(
  html: string,
): { body: string; attribution: string } | null {
  const $ = load(html);
  const article = $("article#sections, article.sections").first();
  if (!article.length) return null;

  const firstSection = article.children("section.page-section").first();
  if (!firstSection.length) return null;

  const blocks = firstSection.find(
    ".sqs-html-content[data-sqsp-text-block-content]",
  );
  let quoteIndex = -1;
  blocks.each((i, el) => {
    if (quoteIndex >= 0) return;
    const heading = $(el).find("h1, h2").first();
    if (heading.length) quoteIndex = i;
  });

  if (quoteIndex < 0) return null;

  const body = normalizeBody(blocks.eq(quoteIndex).text());
  if (!body) return null;

  let attribution = "";
  const tryAttribFrom = (idx: number) => {
    const blk = blocks.eq(idx);
    if (!blk.length) return;
    const em = blk.find("em").first();
    if (!em.length) return;
    const t = normalizeAttribution(em.text());
    if (t) attribution = t;
  };
  tryAttribFrom(quoteIndex + 1);
  if (!attribution) tryAttribFrom(quoteIndex - 1);

  return { body, attribution };
}

function formatQuotesTs(
  merged: Record<string, TogstrekCountryHubHeaderQuote>,
): string {
  const keys = Object.keys(merged).sort((a, b) => a.localeCompare(b));
  const lines = keys.map((iso2) => {
    const q = merged[iso2]!;
    return `  ${iso2}: {\n    body: ${JSON.stringify(q.body)},\n    attribution: ${JSON.stringify(q.attribution)},\n  },`;
  });
  return `/**
 * Country hub quotes: full quote + attribution on the country hub header
 * (\`/{continent}/{country}\`). Continent hub tiles use the saying only — see
 * \`getTogstrekCountryHubTileQuote\`.
 *
 * ISO2 entries are merged from the Squarespace backup via:
 * \`npm run migrate:country-hub-quotes\` (see \`scripts/togstrek-migrate-country-hub-quotes.ts\`).
 */

export type TogstrekCountryHubHeaderQuote = {
  body: string;
  attribution: string;
};

/**
 * Optional blockquote under the country hub title (\`/{continent}/{country}\`).
 * Keyed by ISO 3166-1 alpha-2.
 */
export const togstrekCountryHubHeaderQuoteByIso2: Partial<
  Record<string, TogstrekCountryHubHeaderQuote>
> = {
${lines.join("\n")}
};

/** Pull line for continent hub country tiles — saying only, no attribution. */
export function getTogstrekCountryHubTileQuote(iso2: string): string | undefined {
  return togstrekCountryHubHeaderQuoteByIso2[iso2]?.body;
}
`;
}

function main() {
  const { dryRun, apply, backup } = parseArgs(process.argv);
  const backupRoot = resolveBackupRoot(backup);
  const togstrekCom = path.join(backupRoot, "togstrek.com");
  if (!fs.existsSync(togstrekCom)) {
    console.error(`Missing mirror: ${togstrekCom}`);
    process.exit(1);
  }

  const hubs = discoverTogstrekCountryHubParams();
  const extracted: Record<string, TogstrekCountryHubHeaderQuote> = {};
  const noIso2: { continent: string; country: string }[] = [];
  const noFile: { continent: string; country: string }[] = [];
  const noQuote: { continent: string; country: string; file: string }[] = [];

  for (const { continent, country } of hubs) {
    const iso2 = getIso2ForCountrySlug(continent, country);
    if (!iso2) {
      noIso2.push({ continent, country });
      continue;
    }
    const file = resolveCountryHubHtml(togstrekCom, continent, country);
    if (!file) {
      noFile.push({ continent, country });
      continue;
    }
    const html = fs.readFileSync(file, "utf8");
    const quote = extractCountryHubQuoteFromHtml(html);
    if (!quote) {
      noQuote.push({ continent, country, file });
      continue;
    }
    extracted[iso2] = quote;
  }

  const merged = {
    ...existingQuotes,
    ...extracted,
  } as Record<string, TogstrekCountryHubHeaderQuote>;

  fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
  fs.writeFileSync(
    JSON_OUT,
    JSON.stringify(
      {
        extracted,
        stats: {
          hubs: hubs.length,
          extractedCount: Object.keys(extracted).length,
          noIso2: noIso2.length,
          noFile: noFile.length,
          noQuote: noQuote.length,
        },
        noIso2,
        noFile,
        noQuote,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Wrote ${JSON_OUT}`);
  console.log(
    `Extracted ${Object.keys(extracted).length}/${hubs.length} hubs (by ISO2).`,
  );
  if (noIso2.length)
    console.log(`No ISO2 mapping: ${noIso2.length}`, noIso2.slice(0, 5));
  if (noFile.length)
    console.log(`No backup HTML: ${noFile.length}`, noFile.slice(0, 8));
  if (noQuote.length)
    console.log(`No quote in first section: ${noQuote.length}`, noQuote.slice(0, 8));

  if (apply && !dryRun) {
    fs.writeFileSync(QUOTES_TS, formatQuotesTs(merged), "utf8");
    console.log(`Updated ${QUOTES_TS}`);
  } else if (apply && dryRun) {
    console.log("(Skipping --apply because --dry-run.)");
  } else if (!apply) {
    console.log("Dry run only. Pass --apply to rewrite togstrek-country-hub-list-quotes.ts");
  }
}

main();
