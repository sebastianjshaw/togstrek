/**
 * Normalize `migration/cdn-upload-ready/north-america/**` on disk to match MDX URLs:
 * - `usa/**` → `united-states-of-america/**` with nested state/place (no `california-los-angeles` folders).
 * - `united-states-of-america/massachusetts-boston` → `massachusetts/boston`
 * - `united-states-of-america/new-jersey-scotch-plains` → `new-jersey/scotch-plains`
 *
 * Run:
 *   npx tsx scripts/togstrek-fix-migration-north-america-layout.ts
 *   npx tsx scripts/togstrek-fix-migration-north-america-layout.ts --dry-run
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

/** Expand one path segment that incorrectly combined admin tier + place. */
function expandSegment(d: string): string[] {
  if (d.startsWith("california-") && d !== "california") {
    return ["california", d.slice("california-".length)];
  }
  if (d === "texas-dallas") return ["texas", "dallas"];
  if (d === "ny-new-york") return ["ny", "new-york"];
  if (d === "new-jersey-scotch-plains") return ["new-jersey", "scotch-plains"];
  if (d === "massachusetts-boston") return ["massachusetts", "boston"];
  return [d];
}

/** `rel` = path under north-america/ (posix). Returns canonical posix rel. */
function canonicalRelFromStagingRel(rel: string): string {
  const parts = rel.split("/").filter(Boolean);
  if (parts.length < 2) return rel;
  const filename = parts[parts.length - 1]!;
  const dirParts = parts.slice(0, -1);
  let country = dirParts[0]!;
  if (country === "usa") country = "united-states-of-america";
  const afterCountry = dirParts.slice(1).flatMap(expandSegment);
  return [country, ...afterCountry, filename].join("/");
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

function removeEmptyDirs(root: string): void {
  const walk = (d: string): boolean => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return false;
    }
    for (const ent of entries) {
      if (ent.isDirectory()) walk(path.join(d, ent.name));
    }
    try {
      const again = fs.readdirSync(d);
      if (again.length === 0 && d !== root) {
        fs.rmdirSync(d);
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  };
  for (let i = 0; i < 20; i++) {
    walk(root);
  }
}

function main(): void {
  const dryRun = process.argv.includes("--dry-run");
  const repo = process.cwd();
  const naRoot = path.join(repo, "migration", "cdn-upload-ready", "north-america");
  if (!fs.existsSync(naRoot)) {
    console.error(`Missing ${naRoot}`);
    process.exit(1);
  }

  const files = walkFiles(naRoot);
  const moves: { from: string; to: string; rel: string; newRel: string }[] = [];
  const destSources = new Map<string, string[]>();

  for (const abs of files) {
    const rel = path.relative(naRoot, abs).replace(/\\/g, "/");
    const newRel = canonicalRelFromStagingRel(rel);
    if (newRel === rel) continue;
    const destAbs = path.join(naRoot, ...newRel.split("/"));
    moves.push({ from: abs, to: destAbs, rel, newRel });
    const list = destSources.get(destAbs) ?? [];
    list.push(abs);
    destSources.set(destAbs, list);
  }

  const dupes = [...destSources.entries()].filter(([, srcs]) => srcs.length > 1);
  if (dupes.length) {
    console.error("Ambiguous: multiple sources → same destination:");
    for (const [dest, srcs] of dupes.slice(0, 15)) {
      console.error(`  ${path.relative(repo, dest)} <=`, srcs.map((s) => path.relative(repo, s)));
    }
    process.exit(1);
  }

  if (moves.length === 0) {
    console.log("Nothing to fix — paths already canonical.");
    removeEmptyDirs(naRoot);
    return;
  }

  console.log(`${dryRun ? "[dry-run] " : ""}${moves.length} file(s) to relocate.\n`);

  for (const m of moves) {
    if (dryRun) {
      console.log(`${m.rel} → ${m.newRel}`);
      continue;
    }
    fs.mkdirSync(path.dirname(m.to), { recursive: true });
    if (fs.existsSync(m.to)) {
      console.warn(`Skip (dest exists): ${m.newRel}`);
      continue;
    }
    fs.renameSync(m.from, m.to);
  }

  if (!dryRun) {
    removeEmptyDirs(naRoot);
    const legacyUsa = path.join(naRoot, "usa");
    if (fs.existsSync(legacyUsa)) {
      try {
        fs.rmSync(legacyUsa, { recursive: true, force: true });
        console.log("Removed leftover migration/cdn-upload-ready/north-america/usa/");
      } catch {
        /* ignore */
      }
    }
    console.log("\nPruned empty directories.");
  }

  console.log(
    dryRun
      ? "\nRun without --dry-run to apply."
      : "\nUpload: npm run r2:upload -- --source migration/cdn-upload-ready/north-america --prefix north-america/",
  );
}

main();
