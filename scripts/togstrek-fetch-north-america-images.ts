/**
 * Download Squarespace CDN images referenced in North America place MDX under
 * `content/places/north-america/` (recursive).
 * into `migration/cdn-upload-ready/north-america/{country}/{place}/` and rewrite MDX
 * to `https://media.togstrek.com/north-america/{country}/{place}/{file}`.
 *
 * Run after `npm run migrate:places:north-america`. Then upload:
 *   npm run r2:upload -- --source migration/cdn-upload-ready/north-america --prefix north-america/
 *
 * Usage:
 *   npm run media:fetch-north-america -- --dry-run
 *   npm run media:fetch-north-america
 *   npm run media:fetch-north-america -- --limit 3
 */

import * as fs from "node:fs";
import * as path from "node:path";

import matter from "gray-matter";

const REPO_ROOT = process.cwd();
const PLACES_NA = path.join(REPO_ROOT, "content", "places", "north-america");
const DEFAULT_OUT = path.join(
  REPO_ROOT,
  "migration",
  "cdn-upload-ready",
  "north-america",
);
const MEDIA_PUBLIC_BASE =
  process.env.TOGSTREK_MEDIA_PUBLIC_BASE?.trim() ||
  "https://media.togstrek.com/north-america";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i;

function parseArgs(argv: string[]): {
  outRoot: string;
  dryRun: boolean;
  limit: number | null;
} {
  let outRoot = DEFAULT_OUT;
  let dryRun = false;
  let limit: number | null = null;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") dryRun = true;
    else if (a === "--out" && argv[i + 1]) {
      outRoot = path.resolve(REPO_ROOT, argv[++i]!);
    } else if (a === "--limit" && argv[i + 1]) {
      const n = Number(argv[++i]!);
      if (Number.isFinite(n) && n > 0) limit = n;
    }
  }
  return { outRoot, dryRun, limit };
}

function listNorthAmericaMdxFiles(): string[] {
  const out: string[] = [];
  function walk(dir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.isFile() && ent.name.endsWith(".mdx")) out.push(full);
    }
  }
  walk(PLACES_NA);
  return out.sort((a, b) => a.localeCompare(b));
}

/** `.../north-america/<country>/….mdx` (any nesting under country) → country + place path segments. */
function countryPlaceFromMdxPath(mdxAbs: string): {
  country: string;
  placeSegments: string[];
} | null {
  const rel = path.relative(PLACES_NA, mdxAbs).replace(/\\/g, "/");
  const parts = rel.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const last = parts[parts.length - 1]!;
  if (!last.endsWith(".mdx")) return null;
  const country = parts[0]!;
  const middle = parts.slice(1, -1);
  const leaf = path.basename(last, ".mdx");
  const placeSegments = [...middle, leaf];
  return { country, placeSegments };
}

function normalizeSquarespaceFetchUrl(raw: string): string {
  const trimmed = raw.trim().split(/\s/)[0]!;
  const withoutQuery = trimmed.split("?")[0]!;
  try {
    const u = new URL(withoutQuery);
    if (
      u.hostname === "images.squarespace-cdn.com" &&
      u.pathname.includes("/content/") &&
      !u.pathname.includes("/content/v1/")
    ) {
      u.pathname = u.pathname.replace("/content/", "/content/v1/");
    }
    return u.toString();
  } catch {
    return withoutQuery;
  }
}

function basenameForUrl(imageUrl: string): string {
  try {
    const u = new URL(imageUrl.split("?")[0]!);
    const last = u.pathname.split("/").pop() ?? "image.jpg";
    return decodeURIComponent(last) || "image.jpg";
  } catch {
    return "image.jpg";
  }
}

function collectSquarespaceImageUrls(raw: string): string[] {
  const found = new Set<string>();

  try {
    const { data } = matter(raw);
    const hero = data?.heroImage as { src?: string } | undefined;
    if (typeof hero?.src === "string" && isSquarespaceImageUrl(hero.src)) {
      found.add(hero.src.trim());
    }
  } catch {
    /* fall through to regex */
  }

  /* Markdown: URL may contain `)` inside filename before final `.jpg)`. */
  for (const m of raw.matchAll(
    /!\[[^\]]*]\((https:\/\/images\.squarespace-cdn\.com\/.+?\.(?:jpe?g|png|webp|gif|avif))\)/gi,
  )) {
    const u = m[1]!.trim();
    if (isSquarespaceImageUrl(u)) found.add(u);
  }
  for (const m of raw.matchAll(
    /https:\/\/images\.squarespace-cdn\.com\/[^\s\)"'<>]+/gi,
  )) {
    let u = m[0]!.trim();
    u = u.replace(/[),.;]+$/, "");
    if (isSquarespaceImageUrl(u)) found.add(u);
  }
  for (const m of raw.matchAll(
    /!\[[^\]]*]\((https:\/\/static1\.squarespace\.com\/.+?\.(?:jpe?g|png|webp|gif|avif))\)/gi,
  )) {
    let u = m[1]!.trim();
    if (IMAGE_EXT.test(u.split("?")[0]!)) found.add(u);
  }
  for (const m of raw.matchAll(
    /https:\/\/static1\.squarespace\.com\/[^\s\)"'<>]+/gi,
  )) {
    let u = m[0]!.trim().replace(/[),.;]+$/, "");
    if (IMAGE_EXT.test(u)) found.add(u);
  }

  return [...found].filter(
    (u) =>
      !u.includes("/memberAccountAvatars/") && !u.includes("/namespaces/"),
  );
}

function isSquarespaceImageUrl(u: string): boolean {
  if (!IMAGE_EXT.test(u.split("?")[0]!)) return false;
  return (
    u.includes("images.squarespace-cdn.com") ||
    u.includes("static1.squarespace.com")
  );
}

async function downloadToFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "TogstrekMediaMigration/1.0 (site owner; fetching own Squarespace assets)",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
}

function uniqueDestBasename(
  base: string,
  used: Set<string>,
): { filename: string; stem: string; ext: string } {
  const ext = path.extname(base) || ".jpg";
  let stem = base.slice(0, -ext.length) || "image";
  let filename = base;
  let n = 0;
  while (used.has(filename)) {
    n++;
    filename = `${stem}-${n}${ext}`;
  }
  used.add(filename);
  return { filename, stem, ext };
}

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function processOneMdx(
  mdxAbs: string,
  outRoot: string,
  dryRun: boolean,
): Promise<{ ok: number; fail: number }> {
  const loc = countryPlaceFromMdxPath(mdxAbs);
  if (!loc) return { ok: 0, fail: 0 };

  const raw = fs.readFileSync(mdxAbs, "utf8");
  const urls = collectSquarespaceImageUrls(raw);
  if (urls.length === 0) return { ok: 0, fail: 0 };

  const destDir = path.join(outRoot, loc.country, ...loc.placeSegments);
  const usedNames = new Set<string>();

  type Job = {
    exactInFile: string;
    fetchUrl: string;
    filename: string;
    publicUrl: string;
  };
  const byExact = new Map<string, Job>();

  for (const exact of urls) {
    if (byExact.has(exact)) continue;
    const fetchUrl = normalizeSquarespaceFetchUrl(exact);
    const base = basenameForUrl(fetchUrl);
    const { filename } = uniqueDestBasename(base, usedNames);
    const placeTail = loc.placeSegments.join("/");
    const publicUrl = `${MEDIA_PUBLIC_BASE}/${loc.country}/${placeTail}/${filename}`;
    byExact.set(exact, { exactInFile: exact, fetchUrl, filename, publicUrl });
  }

  const jobs = [...byExact.values()].sort(
    (a, b) => b.exactInFile.length - a.exactInFile.length,
  );

  let ok = 0;
  let fail = 0;
  const readyToRewrite: Job[] = [];

  for (const job of jobs) {
    const dest = path.join(destDir, job.filename);
    if (dryRun) {
      console.log(`  [dry-run] ${job.filename} ← ${job.fetchUrl}`);
      readyToRewrite.push(job);
      ok++;
      continue;
    }
    try {
      if (!fs.existsSync(dest)) {
        await downloadToFile(job.fetchUrl, dest);
        console.log(`  saved ${path.relative(REPO_ROOT, dest)}`);
      } else {
        console.log(`  skip exists ${job.filename}`);
      }
      readyToRewrite.push(job);
      ok++;
    } catch (e) {
      console.error(`  FAIL ${job.filename}: ${e}`);
      fail++;
    }
  }

  if (!dryRun && readyToRewrite.length > 0) {
    let newRaw = raw;
    for (const job of readyToRewrite.sort(
      (a, b) => b.exactInFile.length - a.exactInFile.length,
    )) {
      newRaw = newRaw.replace(
        new RegExp(escapeForRegex(job.exactInFile), "g"),
        job.publicUrl,
      );
    }
    if (newRaw !== raw) {
      fs.writeFileSync(mdxAbs, newRaw, "utf8");
      console.log(`  updated ${path.relative(REPO_ROOT, mdxAbs)}`);
    }
  }

  if (!dryRun && fail > 0) {
    console.warn(
      `  note: ${fail} download(s) failed; MDX still updated for successful images only`,
    );
  }

  return { ok, fail };
}

async function main(): Promise<void> {
  const { outRoot, dryRun, limit } = parseArgs(process.argv);

  if (!fs.existsSync(PLACES_NA)) {
    console.error(`Missing ${PLACES_NA}`);
    process.exit(1);
  }

  let files = listNorthAmericaMdxFiles();
  if (limit !== null) files = files.slice(0, limit);

  console.log(
    `North America image fetch: ${files.length} MDX files → ${path.relative(REPO_ROOT, outRoot)}`,
  );
  if (dryRun) console.log("(dry-run: no downloads, no MDX writes)\n");

  if (!dryRun) {
    fs.mkdirSync(outRoot, { recursive: true });
  }

  let totalOk = 0;
  let totalFail = 0;

  for (const mdxAbs of files) {
    const rel = path.relative(REPO_ROOT, mdxAbs);
    console.log(`\n${rel}`);
    const { ok, fail } = await processOneMdx(mdxAbs, outRoot, dryRun);
    totalOk += ok;
    totalFail += fail;
    await new Promise((r) => setTimeout(r, 50));
  }

  console.log(`\nDone. downloads ok: ${totalOk}, failed: ${totalFail}`);
  if (!dryRun && totalFail === 0) {
    console.log(
      `\nUpload: npm run r2:upload -- --source migration/cdn-upload-ready/north-america --prefix north-america/`,
    );
  }
  process.exit(totalFail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
