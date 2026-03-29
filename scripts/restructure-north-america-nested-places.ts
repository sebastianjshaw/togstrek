/**
 * One-off: move compound US place MDX to nested paths and fix placeSlug + media URLs.
 *
 *   npx tsx scripts/restructure-north-america-nested-places.ts
 *   npx tsx scripts/restructure-north-america-nested-places.ts --dry-run
 */

import * as fs from "node:fs";
import * as path from "node:path";

import matter from "gray-matter";
import { stringify as yamlStringify } from "yaml";

const REPO = process.cwd();
const NA = path.join(REPO, "content", "places", "north-america");
const MEDIA_PREFIX = "https://media.togstrek.com/north-america/";

type Move = { from: string; to: string; oldMediaPrefix: string; newMediaPrefix: string };

function buildMoves(): Move[] {
  const moves: Move[] = [];
  /** Legacy flat `usa/` folder from older migrations; canonical country folder is `united-states-of-america`. */
  const legacyUsaDir = path.join(NA, "usa");
  if (fs.existsSync(legacyUsaDir)) {
    for (const name of fs.readdirSync(legacyUsaDir)) {
      if (!name.endsWith(".mdx")) continue;
      const base = name.replace(/\.mdx$/i, "");
      let toRel: string | null = null;
      const mCal = /^california-(.+)$/.exec(base);
      if (mCal)
        toRel = path.join(
          "united-states-of-america",
          "california",
          `${mCal[1]}.mdx`,
        );
      else if (base === "texas-dallas")
        toRel = path.join(
          "united-states-of-america",
          "texas",
          "dallas.mdx",
        );
      else if (base === "ny-new-york")
        toRel = path.join("united-states-of-america", "ny", "new-york.mdx");
      if (!toRel) continue;
      const fromAbs = path.join(legacyUsaDir, name);
      const toAbs = path.join(NA, toRel);
      const newP = `north-america/${toRel.replace(/\\/g, "/").replace(/\.mdx$/i, "")}/`;
      moves.push({
        from: fromAbs,
        to: toAbs,
        oldMediaPrefix: `${MEDIA_PREFIX}usa/${base}/`,
        newMediaPrefix: `https://media.togstrek.com/${newP}`,
      });
    }
  }
  const usaLong = path.join(NA, "united-states-of-america");
  if (fs.existsSync(usaLong)) {
    for (const name of fs.readdirSync(usaLong)) {
      if (!name.endsWith(".mdx")) continue;
      const base = name.replace(/\.mdx$/i, "");
      let toRel: string | null = null;
      if (base === "new-jersey-scotch-plains")
        toRel = path.join(
          "united-states-of-america",
          "new-jersey",
          "scotch-plains.mdx",
        );
      else if (base === "massachusetts-boston")
        toRel = path.join(
          "united-states-of-america",
          "massachusetts",
          "boston.mdx",
        );
      if (!toRel) continue;
      const fromAbs = path.join(usaLong, name);
      const toAbs = path.join(NA, toRel);
      const newTail = toRel.replace(/\\/g, "/").replace(/\.mdx$/i, "");
      moves.push({
        from: fromAbs,
        to: toAbs,
        oldMediaPrefix: `${MEDIA_PREFIX}united-states-of-america/${base}/`,
        newMediaPrefix: `https://media.togstrek.com/north-america/${newTail}/`,
      });
    }
  }
  return moves;
}

function processFile(move: Move, dryRun: boolean): void {
  let raw = fs.readFileSync(move.from, "utf8");
  if (move.oldMediaPrefix !== move.newMediaPrefix) {
    raw = raw.split(move.oldMediaPrefix).join(move.newMediaPrefix);
  }
  const parsed = matter(raw);
  const data = { ...(parsed.data as Record<string, unknown>) };
  const relTo = path.relative(NA, move.to).replace(/\\/g, "/");
  const withoutExt = relTo.replace(/\.mdx$/i, "");
  const segments = withoutExt.split("/").filter(Boolean);
  const countrySlug = segments[0]!;
  const placeSlug = segments.slice(1).join("/");
  data.continentSlug = "north-america";
  data.countrySlug = countrySlug;
  data.placeSlug = placeSlug;

  const body = parsed.content;
  const fmYaml = yamlStringify(data).trim();
  const out = `---\n${fmYaml}\n---\n${body.startsWith("\n") ? "" : "\n"}${body}`;

  if (dryRun) {
    console.log(`[dry-run] ${move.from} → ${move.to}`);
    return;
  }
  fs.mkdirSync(path.dirname(move.to), { recursive: true });
  fs.writeFileSync(move.to, out, "utf8");
  fs.unlinkSync(move.from);
  console.log(`moved ${path.relative(REPO, move.from)} → ${path.relative(REPO, move.to)}`);
}

function main(): void {
  const dryRun = process.argv.includes("--dry-run");
  const moves = buildMoves();
  console.log(`${dryRun ? "[dry-run] " : ""}${moves.length} file(s) to restructure.`);
  for (const m of moves) processFile(m, dryRun);
}

main();
