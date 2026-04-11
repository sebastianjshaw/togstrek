/**
 * Rewrite remaining `images.squarespace-cdn.com` / `static1.squarespace.com` image URLs
 * in MDX to `https://media.togstrek.com/<prefix>/<filename>` using the **same**
 * assignment rules as `media:migrate-squarespace-backup` (sorted files, first-seen
 * URL wins prefix, `pickUniqueFilename` per prefix for basename collisions).
 *
 * Use after staging + uploading assets so CDN keys exist. Does **not** read a backup.
 *
 *   npm run media:rewrite-squarespace-to-cdn -- --dry-run
 *   npm run media:rewrite-squarespace-to-cdn
 */

import * as fs from "node:fs";
import * as path from "node:path";

import matter from "gray-matter";

const REPO_ROOT = process.cwd();
const CONTENT_DIR = path.join(REPO_ROOT, "content");
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i;

function getMediaBase(): string {
  const raw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  return "https://media.togstrek.com";
}

function nfc(s: string): string {
  return s.normalize("NFC");
}

function normalizeSquarespaceUrl(raw: string): string {
  const trimmed = raw.trim().split(/\s/)[0]!;
  const withoutQuery = trimmed.split("?")[0]!;
  const u = new URL(withoutQuery);
  if (
    u.hostname === "images.squarespace-cdn.com" &&
    u.pathname.includes("/content/") &&
    !u.pathname.includes("/content/v1/")
  ) {
    u.pathname = u.pathname.replace("/content/", "/content/v1/");
  }
  return u.toString();
}

function isSquarespaceImageUrl(u: string): boolean {
  if (!IMAGE_EXT.test(u.split("?")[0]!)) return false;
  return (
    u.includes("images.squarespace-cdn.com") ||
    u.includes("static1.squarespace.com")
  );
}

function collectExactUrlsFromText(
  raw: string,
): { exact: string; normalized: string }[] {
  const found: { exact: string; normalized: string }[] = [];
  const seen = new Set<string>();

  const push = (exact: string) => {
    const t = exact.trim();
    if (!t || !isSquarespaceImageUrl(t)) return;
    const n = normalizeSquarespaceUrl(t);
    const key = `${t}\0${n}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ exact: t, normalized: n });
  };

  try {
    const { data } = matter(raw);
    const hero = data?.heroImage as { src?: string } | undefined;
    if (typeof hero?.src === "string") push(hero.src);
  } catch {
    /* regex only */
  }

  for (const m of raw.matchAll(
    /https:\/\/images\.squarespace-cdn\.com\/[^\s\)"'<>]+/gi,
  )) {
    const u = m[0]!.trim().replace(/[),.;]+$/, "");
    push(u);
  }
  for (const m of raw.matchAll(
    /https:\/\/static1\.squarespace\.com\/[^\s\)"'<>]+/gi,
  )) {
    const u = m[0]!.trim().replace(/[),.;]+$/, "");
    push(u);
  }

  return found;
}

function cdnPrefixForSourceFile(absFile: string): string | null {
  const rel = path.relative(REPO_ROOT, absFile).replace(/\\/g, "/");
  if (!rel.startsWith("content/") || !rel.endsWith(".mdx")) return null;
  const inner = rel.slice("content/".length, -4);
  if (inner.startsWith("places/")) return inner.slice("places/".length);
  return inner;
}

function pickUniqueFilename(
  usedInDir: Set<string>,
  preferred: string,
): string {
  if (!usedInDir.has(preferred)) {
    usedInDir.add(preferred);
    return preferred;
  }
  const ext = path.extname(preferred) || ".jpg";
  const stem = preferred.slice(0, -ext.length) || "image";
  let n = 2;
  while (usedInDir.has(`${stem}-${n}${ext}`)) n++;
  const out = `${stem}-${n}${ext}`;
  usedInDir.add(out);
  return out;
}

function preferredFilenameFromNormalizedUrl(normalized: string): string {
  const u = new URL(normalized.split("?")[0]!);
  const parts = u.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "image.jpg";
  try {
    return nfc(decodeURIComponent(last));
  } catch {
    return nfc(last);
  }
}

function listMdxFiles(): string[] {
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
  walk(CONTENT_DIR);
  return out.sort((a, b) => a.localeCompare(b));
}

function parseArgs(argv: string[]): { dryRun: boolean } {
  let dryRun = false;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--dry-run") dryRun = true;
  }
  return { dryRun };
}

function main(): void {
  const { dryRun } = parseArgs(process.argv);
  const mediaBase = getMediaBase();
  const sourceFiles = listMdxFiles();

  const urlAssignment = new Map<
    string,
    { prefix: string; filename: string }
  >();
  const usedNames = new Map<string, Set<string>>();

  for (const file of sourceFiles) {
    const prefix = cdnPrefixForSourceFile(file);
    if (!prefix) continue;
    const raw = fs.readFileSync(file, "utf8");
    for (const { normalized } of collectExactUrlsFromText(raw)) {
      if (urlAssignment.has(normalized)) continue;
      const preferred = preferredFilenameFromNormalizedUrl(normalized);
      const dirUsed = usedNames.get(prefix) ?? new Set<string>();
      usedNames.set(prefix, dirUsed);
      const filename = pickUniqueFilename(dirUsed, preferred);
      urlAssignment.set(normalized, { prefix, filename });
    }
  }

  const perFile = new Map<string, [string, string][]>();
  for (const file of sourceFiles) {
    const prefix = cdnPrefixForSourceFile(file);
    if (!prefix) continue;
    const raw = fs.readFileSync(file, "utf8");
    for (const { exact, normalized } of collectExactUrlsFromText(raw)) {
      const a = urlAssignment.get(normalized);
      if (!a) continue;
      const pub = `${mediaBase}/${a.prefix}/${a.filename}`;
      const list = perFile.get(file) ?? [];
      list.push([exact, pub]);
      perFile.set(file, list);
    }
  }

  let totalRepl = 0;
  let filesTouched = 0;

  for (const [file, pairs] of perFile) {
    if (pairs.length === 0) continue;
    let text = fs.readFileSync(file, "utf8");
    const orig = text;
    const sorted = [...pairs].sort((a, b) => b[0].length - a[0].length);
    for (const [exact, pub] of sorted) {
      if (exact === pub) continue;
      const count = text.split(exact).length - 1;
      if (count > 0) totalRepl += count;
      text = text.split(exact).join(pub);
    }
    if (text !== orig) {
      filesTouched++;
      if (!dryRun) fs.writeFileSync(file, text, "utf8");
    }
  }

  console.log(
    dryRun
      ? `[dry-run] Would rewrite ${totalRepl} URL occurrence(s) in ${filesTouched} file(s); ${urlAssignment.size} unique Squarespace image URL(s).`
      : `Rewrote ${totalRepl} URL occurrence(s) in ${filesTouched} file(s); ${urlAssignment.size} unique Squarespace image URL(s) → ${mediaBase}/…`,
  );
}

main();
