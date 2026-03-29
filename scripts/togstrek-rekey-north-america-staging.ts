/**
 * Copy `migration/cdn-upload-ready/north-america/**` into a new tree whose paths
 * match current MDX (`united-states-of-america`, nested state/city, etc.).
 *
 * Use when you already have a local mirror from an older migrate (e.g. `usa/`,
 * `california-los-angeles/`). Then upload:
 *
 *   npm run r2:upload -- --source migration/cdn-upload-ready/north-america-rekeyed --prefix north-america/
 *
 * Usage:
 *   npx tsx scripts/togstrek-rekey-north-america-staging.ts
 *   npx tsx scripts/togstrek-rekey-north-america-staging.ts --source ./migration/cdn-upload-ready/north-america --out ./migration/cdn-upload-ready/north-america-rekeyed
 *   npx tsx scripts/togstrek-rekey-north-america-staging.ts --dry-run
 */

import * as fs from "node:fs";
import * as path from "node:path";

const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

/** Directory segments only; filename stays last. */
function rekeyNorthAmericaDirSegments(dirs: string[]): string[] {
  if (dirs.length === 0) return [];
  const out: string[] = [];
  let country = dirs[0]!;
  if (country === "usa") country = "united-states-of-america";
  out.push(country);
  let i = 1;
  while (i < dirs.length) {
    const d = dirs[i]!;
    if (d.startsWith("california-") && d !== "california") {
      out.push("california", d.slice("california-".length));
      i++;
      continue;
    }
    if (d === "texas-dallas") {
      out.push("texas", "dallas");
      i++;
      continue;
    }
    if (d === "ny-new-york") {
      out.push("ny", "new-york");
      i++;
      continue;
    }
    if (d === "new-jersey-scotch-plains") {
      out.push("new-jersey", "scotch-plains");
      i++;
      continue;
    }
    if (d === "massachusetts-boston") {
      out.push("massachusetts", "boston");
      i++;
      continue;
    }
    out.push(d);
    i++;
  }
  return out;
}

function rekeyRelativePosix(rel: string): string {
  const parts = rel.split("/").filter(Boolean);
  if (parts.length === 0) return rel;
  const filename = parts[parts.length - 1]!;
  const dirs = parts.slice(0, -1);
  const newDirs = rekeyNorthAmericaDirSegments(dirs);
  return [...newDirs, filename].join("/");
}

function parseArgs(argv: string[]): {
  source: string;
  out: string;
  dryRun: boolean;
} {
  const REPO = process.cwd();
  let source = path.join(REPO, "migration", "cdn-upload-ready", "north-america");
  let out = path.join(REPO, "migration", "cdn-upload-ready", "north-america-rekeyed");
  let dryRun = false;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") dryRun = true;
    else if (a === "--source" && argv[i + 1]) source = path.resolve(REPO, argv[++i]!);
    else if (a === "--out" && argv[i + 1]) out = path.resolve(REPO, argv[++i]!);
  }
  return { source, out, dryRun };
}

function walkFiles(dir: string): string[] {
  const acc: string[] = [];
  function w(d: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) w(full);
      else if (ent.isFile()) {
        const ext = path.extname(ent.name).toLowerCase();
        if (IMAGE_EXT.has(ext)) acc.push(full);
      }
    }
  }
  w(dir);
  return acc.sort();
}

function main(): void {
  const { source, out, dryRun } = parseArgs(process.argv);
  if (!fs.existsSync(source)) {
    console.error(
      `Source missing: ${source}\n` +
        "Add your existing north-america staging tree there, or run migrate / image fetch first.",
    );
    process.exit(1);
  }

  const files = walkFiles(source);
  if (files.length === 0) {
    console.error(`No image files under ${source}`);
    process.exit(1);
  }

  let copied = 0;
  let same = 0;
  const collisions = new Map<string, string[]>();

  for (const abs of files) {
    const rel = path.relative(source, abs).replace(/\\/g, "/");
    const newRel = rekeyRelativePosix(rel);
    if (newRel === rel) same++;

    const destAbs = path.join(out, ...newRel.split("/"));
    const list = collisions.get(newRel) ?? [];
    list.push(rel);
    collisions.set(newRel, list);

    if (dryRun) {
      if (newRel !== rel) console.log(`${rel} → ${newRel}`);
      continue;
    }

    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    fs.copyFileSync(abs, destAbs);
    copied++;
  }

  const dupes = Array.from(collisions.entries()).filter(([, v]) => v.length > 1);
  if (dupes.length) {
    console.warn("\nMultiple sources mapped to the same destination (last copy wins):");
    for (const [dest, srcs] of dupes.slice(0, 20)) {
      console.warn(`  ${dest} <= ${srcs.join(" | ")}`);
    }
    if (dupes.length > 20) console.warn(`  … +${dupes.length - 20} more`);
  }

  if (dryRun) {
    console.log(
      `\n[dry-run] ${files.length} files; ${same} already canonical path; ${files.length - same} would rekey.`,
    );
    return;
  }

  console.log(
    `Copied ${copied} files → ${out}\nUpload: npm run r2:upload -- --source ${path.relative(process.cwd(), out)} --prefix north-america/`,
  );
}

main();
