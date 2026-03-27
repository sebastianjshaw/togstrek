/**
 * Copy (or move) image files into CDN folder layout without renaming:
 *   {out}/{continent_slug}/{country_slug}/{place_slug}/{filename}
 *
 * Matches `togstrekMediaUrl("{continent}/{country}/{place}/{file}")` in src/config/togstrek-media.ts.
 *
 * Usage:
 *   npm run media:restructure -- --manifest ./migration/image-placement.csv --out ./migration/cdn-upload-ready
 *   npm run media:restructure -- --discover --out ./migration/discovered-images.txt
 *   npm run media:restructure -- ... --dry-run
 *   npm run media:restructure -- ... --move   (move instead of copy; use with care)
 *
 * Default --source: $TOGSTREK_MEDIA_BACKUP_ROOT, else ./TogsTrekBackup in the repo.
 * Full HTTrack mirror (example): /Volumes/MEDIA/TogsTrekBackup
 * Image-only subtree (~10k+ files): .../images.squarespace-cdn.com/content
 *
 *   TOGSTREK_MEDIA_BACKUP_ROOT=/Volumes/MEDIA/TogsTrekBackup npm run media:restructure -- --discover
 *
 * Manifest CSV columns: filename, continent_slug, country_slug, place_slug [, source_hint]
 * - Lines starting with # are ignored.
 * - source_hint: optional; file must be the unique match whose path contains this substring.
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

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type ManifestRow = {
  filename: string;
  continent_slug: string;
  country_slug: string;
  place_slug: string;
  source_hint: string;
  lineNumber: number;
};

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") out["dry-run"] = true;
    else if (a === "--move") out["move"] = true;
    else if (a === "--discover") out["discover"] = true;
    else if (a === "--source" && argv[i + 1]) {
      out["source"] = argv[++i]!;
    } else if (a === "--out" && argv[i + 1]) {
      out["out"] = argv[++i]!;
    } else if (a === "--manifest" && argv[i + 1]) {
      out["manifest"] = argv[++i]!;
    }
  }
  return out;
}

/** CLI --source, else TOGSTREK_MEDIA_BACKUP_ROOT, else ./TogsTrekBackup. */
function resolveSourceRoot(cliSource: string | undefined): string {
  if (typeof cliSource === "string" && cliSource.trim()) {
    return path.resolve(process.cwd(), cliSource.trim());
  }
  const env = process.env.TOGSTREK_MEDIA_BACKUP_ROOT?.trim();
  if (env) return path.resolve(env);
  return path.resolve(process.cwd(), "TogsTrekBackup");
}

function walkImages(dir: string, acc: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkImages(full, acc);
    else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (IMAGE_EXT.has(ext)) acc.push(full);
    }
  }
  return acc;
}

function indexByBasename(files: string[]): Map<string, string[]> {
  const m = new Map<string, string[]>();
  for (const f of files) {
    const base = path.basename(f);
    const list = m.get(base) ?? [];
    list.push(f);
    m.set(base, list);
  }
  return m;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else cur += c;
  }
  out.push(cur.trim());
  return out;
}

function loadManifest(csvPath: string): ManifestRow[] {
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/);
  const rows: ManifestRow[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line || line.startsWith("#")) continue;
    const cells = parseCsvLine(line);
    if (cells.length < 4) {
      console.warn(`Skipping line ${i + 1}: need at least 4 columns`);
      continue;
    }
    const [filename, continent_slug, country_slug, place_slug, source_hint = ""] =
      cells;
    if (!filename || !continent_slug || !country_slug || !place_slug) continue;
    if (filename.toLowerCase() === "filename") continue; // header row
    rows.push({
      filename,
      continent_slug,
      country_slug,
      place_slug,
      source_hint,
      lineNumber: i + 1,
    });
  }
  return rows;
}

function assertSlug(label: string, value: string, line: number): void {
  if (!SLUG.test(value)) {
    throw new Error(
      `Invalid ${label} "${value}" (line ${line}): use lowercase kebab-case [a-z0-9-]+`,
    );
  }
}

function resolveSource(
  basename: string,
  candidates: string[],
  sourceRoot: string,
  hint: string,
): string {
  const posix = (p: string) => p.split(path.sep).join("/");
  if (candidates.length === 1) return candidates[0]!;
  if (!hint) {
    const rels = candidates.map((c) => posix(path.relative(sourceRoot, c)));
    throw new Error(
      `Multiple files named "${basename}". Add source_hint (unique path substring). Found:\n  ${rels.join("\n  ")}`,
    );
  }
  const hintNorm = hint.split(path.sep).join("/");
  const matched = candidates.filter((c) =>
    posix(path.relative(sourceRoot, c)).includes(hintNorm),
  );
  if (matched.length === 1) return matched[0]!;
  if (matched.length === 0) {
    throw new Error(
      `No file named "${basename}" with path containing hint "${hint}"`,
    );
  }
  const rels = matched.map((c) => posix(path.relative(sourceRoot, c)));
  throw new Error(
    `Hint "${hint}" still ambiguous for "${basename}":\n  ${rels.join("\n  ")}`,
  );
}

function main(): void {
  const args = parseArgs(process.argv);
  const sourceRoot = resolveSourceRoot(
    typeof args["source"] === "string" ? args["source"] : undefined,
  );
  const outRoot = path.resolve(
    process.cwd(),
    String(args["out"] ?? "migration/cdn-upload-ready"),
  );
  const dryRun = Boolean(args["dry-run"]);
  const doMove = Boolean(args["move"]);
  const discover = Boolean(args["discover"]);

  if (!fs.existsSync(sourceRoot)) {
    console.error(`--source does not exist: ${sourceRoot}`);
    process.exit(1);
  }

  const allImages = walkImages(sourceRoot);
  const byBase = indexByBasename(allImages);

  if (discover) {
    const discoverPath =
      typeof args["out"] === "string"
        ? outRoot
        : path.join(process.cwd(), "migration", "discovered-images.txt");
    const lines = allImages
      .map((abs) => {
        const rel = path.relative(sourceRoot, abs).split(path.sep).join("/");
        return `${path.basename(abs)}\t${rel}`;
      })
      .sort();
    if (!dryRun) {
      fs.mkdirSync(path.dirname(discoverPath), { recursive: true });
      fs.writeFileSync(
        discoverPath,
        [
          "# basename\trelative_path_under_source",
          ...lines,
          "",
        ].join("\n"),
        "utf8",
      );
    }
    console.log(
      dryRun
        ? `[dry-run] Would list ${allImages.length} images (first 20):`
        : `Wrote ${discoverPath} (${allImages.length} files)`,
    );
    if (dryRun) console.log(lines.slice(0, 20).join("\n"));
    const dupes = [...byBase.entries()].filter(([, v]) => v.length > 1);
    if (dupes.length) {
      console.log(`\nDuplicate basenames under source: ${dupes.length}`);
      for (const [b, list] of dupes.slice(0, 15)) {
        console.log(`  ${b} (${list.length} paths)`);
      }
      if (dupes.length > 15) console.log("  …");
    }
    return;
  }

  const manifestPath = path.resolve(
    process.cwd(),
    String(args["manifest"] ?? "migration/image-placement.csv"),
  );
  if (!fs.existsSync(manifestPath)) {
    console.error(`Missing manifest: ${manifestPath}`);
    console.error("Copy migration/image-placement.template.csv and fill rows.");
    process.exit(1);
  }

  const rows = loadManifest(manifestPath);
  if (!rows.length) {
    console.error("Manifest has no data rows.");
    process.exit(1);
  }

  let copied = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      assertSlug("continent_slug", row.continent_slug, row.lineNumber);
      assertSlug("country_slug", row.country_slug, row.lineNumber);
      assertSlug("place_slug", row.place_slug, row.lineNumber);
    } catch (e) {
      errors.push(String(e));
      continue;
    }

    const candidates = byBase.get(row.filename) ?? [];
    if (!candidates.length) {
      errors.push(`Line ${row.lineNumber}: no source file "${row.filename}"`);
      skipped++;
      continue;
    }

    let src: string;
    try {
      src = resolveSource(
        row.filename,
        candidates,
        sourceRoot,
        row.source_hint,
      );
    } catch (e) {
      errors.push(`Line ${row.lineNumber}: ${e}`);
      skipped++;
      continue;
    }

    const destDir = path.join(
      outRoot,
      row.continent_slug,
      row.country_slug,
      row.place_slug,
    );
    const destFile = path.join(destDir, row.filename);

    if (!dryRun) {
      fs.mkdirSync(destDir, { recursive: true });
      if (doMove) fs.renameSync(src, destFile);
      else fs.copyFileSync(src, destFile);
    }
    copied++;
    if (copied <= 10 || dryRun)
      console.log(
        `${doMove ? "MOVE" : "COPY"} ${path.relative(sourceRoot, src)} → ${path.relative(process.cwd(), destFile)}`,
      );
  }

  if (copied > 10 && !dryRun)
    console.log(`… and ${copied - 10} more (see ${outRoot})`);

  console.log(
    `\nDone: ${copied} files ${dryRun ? "(dry-run)" : doMove ? "moved" : "copied"}, ${skipped} skipped`,
  );
  if (errors.length) {
    console.log("\nIssues:");
    for (const e of errors.slice(0, 30)) console.log(`  ${e}`);
    if (errors.length > 30) console.log(`  … +${errors.length - 30} more`);
    process.exit(errors.some((e) => e.includes("no source")) ? 1 : 0);
  }
}

main();
