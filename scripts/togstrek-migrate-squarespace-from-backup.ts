/**
 * Find Squarespace CDN image URLs in all MDX under content/ and in
 * `src/components/togstrek-about/togstrek-about-page.tsx`, resolve files under an
 * HTTrack backup (`images.squarespace-cdn.com/...`, `static1.squarespace.com/...`),
 * copy into `migration/cdn-upload-ready/<cdn-prefix>/…` (matching
 * `https://media.togstrek.com/<cdn-prefix>/…`), rewrite sources, then optionally
 * sync to R2.
 *
 * CDN prefix from path:
 *   `content/places/europe/portugal/lisbon.mdx` → `europe/portugal/lisbon`
 *   `content/photography/events/foo.mdx`       → `photography/events/foo`
 *   `content/adventures/x.mdx`                 → `adventures/x`
 *   `…/togstrek-about-page.tsx`                → `about`
 *
 * Usage:
 *   npm run media:migrate-squarespace-backup -- --dry-run
 *   npm run media:migrate-squarespace-backup -- --backup /path/to/TogsTrekBackup
 *
 * If the mirror lives on an external drive, pass it explicitly (defaults to
 * ./TogsTrekBackup in the repo, which is often empty):
 *   npm run media:migrate-squarespace-backup -- --dry-run --backup /Volumes/MEDIA/TogsTrekBackup
 * Or set TOGSTREK_MEDIA_BACKUP_ROOT to that path.
 *   npm run media:migrate-squarespace-backup -- --limit 5
 *   npm run media:migrate-squarespace-backup -- --upload
 *   npm run media:migrate-squarespace-backup -- --dry-run --verbose
 *     (list every source→dest path; default dry-run only prints a short summary)
 *
 * After (without --upload):
 *   npm run r2:upload -- --source migration/cdn-upload-ready --prefix "" --skip-existing
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";

import matter from "gray-matter";

const REPO_ROOT = process.cwd();
const MEDIA_PUBLIC = "https://media.togstrek.com";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i;

/** Squarespace site id segment in CDN paths. */
const SQUARESPACE_SITE_IDS = ["6207d70ece223e42dd9ae587"] as const;

/** Suffixes often appended to CDN basenames; HTTrack may omit them on disk. */
const CDN_EXPORT_SUFFIXES = [
  "43a3",
  "ee8a",
  "243a3",
  "343a3",
  "453a3",
  "463a3",
  "473a3",
] as const;

const CONTENT_DIR = path.join(REPO_ROOT, "content");
const DEFAULT_OUT = path.join(REPO_ROOT, "migration", "cdn-upload-ready");
const ABOUT_TSX = path.join(
  REPO_ROOT,
  "src",
  "components",
  "togstrek-about",
  "togstrek-about-page.tsx",
);

function resolvePathUserArg(p: string): string {
  const t = p.trim();
  return path.isAbsolute(t) ? path.normalize(t) : path.resolve(REPO_ROOT, t);
}

function resolveBackupRoot(cli: string | undefined): string {
  if (cli?.trim()) return resolvePathUserArg(cli);
  const env = process.env.TOGSTREK_MEDIA_BACKUP_ROOT?.trim();
  if (env) return resolvePathUserArg(env);
  return path.resolve(REPO_ROOT, "TogsTrekBackup");
}

function parseArgs(argv: string[]): {
  backupRoot: string;
  outRoot: string;
  dryRun: boolean;
  verbose: boolean;
  limit: number | null;
  upload: boolean;
} {
  let backupRoot = resolveBackupRoot(undefined);
  let outRoot = DEFAULT_OUT;
  let dryRun = false;
  let verbose = false;
  let limit: number | null = null;
  let upload = false;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") dryRun = true;
    else if (a === "--verbose" || a === "-v") verbose = true;
    else if (a === "--backup" && argv[i + 1])
      backupRoot = resolvePathUserArg(argv[++i]!);
    else if (a === "--out" && argv[i + 1]) outRoot = path.resolve(REPO_ROOT, argv[++i]!);
    else if (a === "--limit" && argv[i + 1]) {
      const n = Number(argv[++i]!);
      if (Number.isFinite(n) && n > 0) limit = n;
    } else if (a === "--upload") upload = true;
  }
  return { backupRoot, outRoot, dryRun, verbose, limit, upload };
}

function nfc(s: string): string {
  return s.normalize("NFC");
}

/** Compare filenames loosely: drop combining marks, lower-case, treat + as space. */
function foldBasename(s: string): string {
  return nfc(s)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\+/g, " ")
    .toLowerCase();
}

function safeDecodeURIComponent(seg: string): string {
  let s = seg;
  try {
    s = decodeURIComponent(seg);
  } catch {
    return seg;
  }
  if (/%[0-9A-Fa-f]{2}/.test(s)) {
    try {
      s = decodeURIComponent(s);
    } catch {
      /* keep single-pass */
    }
  }
  return s;
}

/** Last path segment of a URL pathname (always POSIX `/`). */
function urlPathLastSegment(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function stemExt(basename: string): { stem: string; ext: string } {
  const i = basename.lastIndexOf(".");
  if (i <= 0) return { stem: basename, ext: "" };
  return { stem: basename.slice(0, i), ext: basename.slice(i) };
}

/** Keys to register for a file on disk (handles +/space and stripped CDN suffixes). */
function diskBasenameLookupKeys(basename: string): string[] {
  const keys = new Set<string>();
  const add = (k: string) => {
    if (k) keys.add(k);
  };
  add(basename);
  add(nfc(basename));
  add(basename.normalize("NFD"));
  if (basename.includes(" ")) add(basename.replace(/ /g, "+"));
  if (basename.includes("+")) add(basename.replace(/\+/g, " "));
  const { stem, ext } = stemExt(basename);
  for (const suf of CDN_EXPORT_SUFFIXES) {
    if (stem.endsWith(suf)) {
      const shorter = stem.slice(0, -suf.length) + ext;
      add(shorter);
      add(nfc(shorter));
    }
  }
  return [...keys];
}

/** Keys derived from the URL’s encoded filename segment. */
function urlBasenameLookupKeys(encodedLastSegment: string): string[] {
  const keys = new Set<string>();
  const addAll = (basename: string) => {
    for (const k of diskBasenameLookupKeys(basename)) keys.add(k);
  };

  const decoded = safeDecodeURIComponent(encodedLastSegment);
  addAll(decoded);
  addAll(nfc(decoded));
  addAll(decoded.normalize("NFD"));

  const { stem, ext } = stemExt(nfc(decoded));
  for (const suf of CDN_EXPORT_SUFFIXES) {
    addAll(stem + suf + ext);
    if (stem.endsWith(suf)) addAll(stem.slice(0, -suf.length) + ext);
  }

  return [...keys];
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
      if (IMAGE_EXT.test(ent.name)) acc.push(full);
    }
  }
  return acc;
}

function indexByBasename(files: string[]): Map<string, string[]> {
  const m = new Map<string, string[]>();
  const add = (key: string, fullPath: string) => {
    const list = m.get(key) ?? [];
    if (!list.includes(fullPath)) list.push(fullPath);
    m.set(key, list);
  };
  for (const f of files) {
    const base = path.basename(f);
    for (const k of diskBasenameLookupKeys(base)) add(k, f);
  }
  return m;
}

function candidatesForBasename(
  encodedOrDecodedBasename: string,
  byBase: Map<string, string[]>,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (paths: string[] | undefined) => {
    for (const p of paths ?? []) {
      if (!seen.has(p)) {
        seen.add(p);
        out.push(p);
      }
    }
  };

  for (const key of urlBasenameLookupKeys(encodedOrDecodedBasename)) {
    push(byBase.get(key));
  }

  const decoded = safeDecodeURIComponent(encodedOrDecodedBasename);
  const base = nfc(decoded);
  const stem = base.replace(/\.[^.]+$/, "");
  if (!stem) return out;
  const nfcBase = base;
  const nfcStem = nfc(stem);
  for (const [k, paths] of byBase) {
    const kStem = k.replace(/\.[^.]+$/, "");
    if (kStem.toLowerCase() === stem.toLowerCase()) push(paths);
    else if (nfc(k) === nfcBase) push(paths);
    else if (nfc(kStem).toLowerCase() === nfcStem.toLowerCase()) push(paths);
  }
  return out;
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

/** Map URL pathname segments to on-disk names (e.g. %C3%B0 → ð). */
function filesystemRelPathFromUrlPathname(urlPathname: string): string {
  const trimmed = urlPathname.replace(/^\//, "");
  const parts = trimmed.split("/").map((seg) => {
    try {
      return decodeURIComponent(seg);
    } catch {
      return seg;
    }
  });
  return parts.join(path.sep);
}

function tryFileUnderHost(hostDir: string, relPathFs: string): string | null {
  const full = path.join(hostDir, relPathFs);
  try {
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  } catch {
    /* ignore */
  }
  return null;
}

function tryOpenRead(p: string): boolean {
  let fd: number | undefined;
  try {
    fd = fs.openSync(p, "r");
    return true;
  } catch {
    return false;
  } finally {
    if (fd !== undefined) {
      try {
        fs.closeSync(fd);
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * macOS + external volumes often store NFD names while our resolved path is NFC
 * (or the reverse). `copyFile` needs the exact byte sequence the FS accepts.
 */
function resolveSourcePathForCopy(absResolvedPath: string): string | null {
  const dir = path.dirname(absResolvedPath);
  const base = path.basename(absResolvedPath);
  let names: string[];
  try {
    names = fs.readdirSync(dir);
  } catch {
    return null;
  }
  const direct = path.join(dir, base);
  if (tryOpenRead(direct)) return direct;
  const wantNfc = nfc(base);
  for (const n of names) {
    if (!IMAGE_EXT.test(n)) continue;
    if (nfc(n) !== wantNfc) continue;
    const p = path.join(dir, n);
    if (tryOpenRead(p)) return p;
  }
  const wantFold = foldBasename(base);
  for (const n of names) {
    if (!IMAGE_EXT.test(n)) continue;
    if (foldBasename(n) !== wantFold) continue;
    const p = path.join(dir, n);
    if (tryOpenRead(p)) return p;
  }
  return null;
}

function backupPathDirect(backupRoot: string, url: string): string | null {
  const u = new URL(url);
  const hostDir = path.join(backupRoot, u.hostname);
  const relPathFs = filesystemRelPathFromUrlPathname(u.pathname);
  const relPosix = relPathFs.split(path.sep).join("/");

  const attempts: string[] = [relPathFs];
  const stripV1 = relPosix.replace(/^content\/v1\//, "content/");
  if (stripV1 !== relPosix) attempts.push(stripV1.split("/").join(path.sep));
  const addV1 = relPosix.replace(/^content\//, "content/v1/");
  if (addV1 !== relPosix && !relPosix.startsWith("content/v1/")) {
    attempts.push(addV1.split("/").join(path.sep));
  }

  for (const rel of attempts) {
    const hit = tryFileUnderHost(hostDir, rel);
    if (hit) return hit;
  }
  return null;
}

/**
 * List the Squarespace “media folder” on disk and match when global basename index
 * fails (encoding, + vs space, optional 43a3-style suffix, mojibake in MDX URL).
 */
function backupPathScanMediaFolder(backupRoot: string, url: string): string | null {
  const u = new URL(url);
  const hostDir = path.join(backupRoot, u.hostname);
  const parts = u.pathname.split("/").filter(Boolean);
  const siteIdx = parts.findIndex((p) =>
    (SQUARESPACE_SITE_IDS as readonly string[]).includes(p),
  );
  if (siteIdx < 0 || siteIdx + 2 >= parts.length) return null;
  const siteId = parts[siteIdx]!;
  const folderId = safeDecodeURIComponent(parts[siteIdx + 1]!);
  const fileSeg = parts[parts.length - 1]!;
  if (!IMAGE_EXT.test(fileSeg)) return null;

  const dirCandidates = [
    path.join(hostDir, "content", "v1", siteId, folderId),
    path.join(hostDir, "content", siteId, folderId),
  ];

  const urlKeys = new Set(urlBasenameLookupKeys(fileSeg));
  const decodedName = nfc(safeDecodeURIComponent(fileSeg));
  const urlFold = foldBasename(decodedName);

  for (const dirPath of dirCandidates) {
    let names: string[];
    try {
      names = fs.readdirSync(dirPath);
    } catch {
      continue;
    }
    const images = names.filter((n) => IMAGE_EXT.test(n));

    for (const n of images) {
      const full = path.join(dirPath, n);
      for (const dk of diskBasenameLookupKeys(n)) {
        if (urlKeys.has(dk)) return full;
      }
      if (nfc(n) === decodedName) return full;
      if (foldBasename(n) === urlFold) return full;
    }

    const dateM = decodedName.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateM && images.length >= 1 && images.length <= 12) {
      const pref = dateM[1]!;
      const dated = images.filter((n) => n.startsWith(pref));
      if (dated.length === 1) return path.join(dirPath, dated[0]!);
    }
    const compactM = decodedName.match(/^(\d{8})-/);
    if (compactM && images.length >= 1 && images.length <= 12) {
      const pref = compactM[1]!;
      const dated = images.filter((n) => n.startsWith(pref));
      if (dated.length === 1) return path.join(dirPath, dated[0]!);
    }
  }
  return null;
}

function backupPathByBasename(
  backupRoot: string,
  url: string,
  byHostBasename: Map<string, Map<string, string[]>>,
): string | null {
  const u = new URL(url);
  const host = u.hostname;
  const byBase = byHostBasename.get(host);
  if (!byBase) return null;
  const lastSegEncoded = urlPathLastSegment(u.pathname);
  const cands = candidatesForBasename(lastSegEncoded, byBase);
  if (cands.length === 0) return null;
  if (cands.length === 1) return cands[0]!;
  const parts = u.pathname.split("/").filter(Boolean);
  let folderId = parts.length >= 2 ? parts[parts.length - 2]! : "";
  folderId = safeDecodeURIComponent(folderId);
  const norm = (p: string) => p.replace(/\\/g, "/");
  const matched = cands.filter((p) => norm(p).includes(folderId));
  if (matched.length === 1) return matched[0]!;
  const siteId = "6207d70ece223e42dd9ae587";
  const bySite = cands.filter((p) => norm(p).includes(siteId));
  if (bySite.length === 1) return bySite[0]!;
  return null;
}

function resolveBackupFile(
  backupRoot: string,
  url: string,
  byHostBasename: Map<string, Map<string, string[]>>,
): string | null {
  return (
    backupPathDirect(backupRoot, url) ??
    backupPathByBasename(backupRoot, url, byHostBasename) ??
    backupPathScanMediaFolder(backupRoot, url)
  );
}

function cdnPrefixForSourceFile(absFile: string): string | null {
  const rel = path.relative(REPO_ROOT, absFile).replace(/\\/g, "/");
  if (rel === "src/components/togstrek-about/togstrek-about-page.tsx") {
    return "about";
  }
  if (!rel.startsWith("content/") || !rel.endsWith(".mdx")) return null;
  const inner = rel.slice("content/".length, -4);
  if (inner.startsWith("places/")) return inner.slice("places/".length);
  return inner;
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

function collectExactUrlsFromText(raw: string): { exact: string; normalized: string }[] {
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
    /* non-matter files use regex only */
  }

  for (const m of raw.matchAll(
    /https:\/\/images\.squarespace-cdn\.com\/[^\s\)"'<>]+/gi,
  )) {
    let u = m[0]!.trim().replace(/[),.;]+$/, "");
    push(u);
  }
  for (const m of raw.matchAll(
    /https:\/\/static1\.squarespace\.com\/[^\s\)"'<>]+/gi,
  )) {
    let u = m[0]!.trim().replace(/[),.;]+$/, "");
    push(u);
  }

  return found;
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

function runR2Upload(outRoot: string): void {
  const venvPy = path.join(REPO_ROOT, ".venv", "bin", "python3");
  const py = fs.existsSync(venvPy) ? venvPy : "python3";
  const script = path.join(REPO_ROOT, "scripts", "r2_upload.py");
  console.log("\nRunning R2 upload (full staging tree, skip existing)…");
  execFileSync(
    py,
    [
      script,
      "--source",
      outRoot,
      "--prefix",
      "",
      "--skip-existing",
    ],
    { stdio: "inherit", env: process.env, cwd: REPO_ROOT },
  );
}

function main(): void {
  const { backupRoot, outRoot, dryRun, verbose, limit, upload } =
    parseArgs(process.argv);

  if (!fs.existsSync(backupRoot)) {
    console.error(`Backup root not found: ${backupRoot}`);
    process.exit(1);
  }

  const sqImgRoot = path.join(backupRoot, "images.squarespace-cdn.com");
  const stImgRoot = path.join(backupRoot, "static1.squarespace.com");
  const byHostBasename = new Map<string, Map<string, string[]>>();

  if (fs.existsSync(sqImgRoot)) {
    byHostBasename.set(
      "images.squarespace-cdn.com",
      indexByBasename(walkImages(sqImgRoot)),
    );
  }
  if (fs.existsSync(stImgRoot)) {
    byHostBasename.set(
      "static1.squarespace.com",
      indexByBasename(walkImages(stImgRoot)),
    );
  }

  function countUniqueIndexedPaths(byBase: Map<string, string[]>): number {
    const seen = new Set<string>();
    for (const paths of byBase.values()) {
      for (const p of paths) seen.add(p);
    }
    return seen.size;
  }
  let indexed = 0;
  for (const m of byHostBasename.values()) indexed += countUniqueIndexedPaths(m);
  console.log(
    `Backup: ${backupRoot}\nIndexed ~${indexed} image files under Squarespace host dirs.`,
  );
  if (indexed < 200) {
    console.warn(
      "\n[warn] Very few images indexed under this backup root. If your HTTrack mirror is on another disk, pass:\n" +
        "  --backup /Volumes/MEDIA/TogsTrekBackup\n" +
        "or set TOGSTREK_MEDIA_BACKUP_ROOT to that folder (must contain images.squarespace-cdn.com/…).\n",
    );
  }

  let sourceFiles = [...listMdxFiles()];
  if (fs.existsSync(ABOUT_TSX)) sourceFiles.push(ABOUT_TSX);
  sourceFiles.sort((a, b) => a.localeCompare(b));
  if (limit !== null) sourceFiles = sourceFiles.slice(0, limit);

  /** normalized URL → placement + source file on disk */
  const urlAssignment = new Map<
    string,
    { relDir: string; filename: string; srcPath: string }
  >();
  /** relDir → used basenames */
  const usedNames = new Map<string, Set<string>>();

  type FileReplace = { file: string; exact: string; normalized: string };
  const fileReplacements: FileReplace[] = [];
  let missingBackup = 0;

  for (const file of sourceFiles) {
    const prefix = cdnPrefixForSourceFile(file);
    if (!prefix) continue;
    const raw = fs.readFileSync(file, "utf8");
    const pairs = collectExactUrlsFromText(raw);
    for (const { exact, normalized } of pairs) {
      if (!urlAssignment.has(normalized)) {
        const srcPath = resolveBackupFile(backupRoot, normalized, byHostBasename);
        if (!srcPath) {
          console.warn(
            `[missing backup] ${normalized}\n  referenced from ${path.relative(REPO_ROOT, file)}`,
          );
          missingBackup++;
          continue;
        }
        const base = path.basename(srcPath);
        const dirUsed = usedNames.get(prefix) ?? new Set<string>();
        usedNames.set(prefix, dirUsed);
        const filename = pickUniqueFilename(dirUsed, base);
        urlAssignment.set(normalized, {
          relDir: prefix,
          filename,
          srcPath,
        });
      }
      fileReplacements.push({ file, exact, normalized });
    }
  }

  const summaryLine = `Files to scan: ${sourceFiles.length} | Unique Squarespace URLs (resolved): ${urlAssignment.size} | Missing in backup: ${missingBackup}`;
  console.log(`\n${summaryLine}`);

  if (dryRun) {
    const outRel = path.relative(REPO_ROOT, outRoot);
    if (verbose) {
      for (const [, a] of urlAssignment) {
        const dest = path.join(outRoot, a.relDir, a.filename);
        console.log(
          `[dry-run] copy ${path.relative(REPO_ROOT, a.srcPath)} → ${path.relative(REPO_ROOT, dest)}`,
        );
      }
    } else if (urlAssignment.size > 0) {
      console.log(
        `[dry-run] Would stage ${urlAssignment.size} unique file(s) under ${outRel}/ (add --verbose to list each path).`,
      );
    }
    console.log("\n── Summary ──");
    console.log(summaryLine);
    if (missingBackup > 0) {
      console.log(
        `Exit ${missingBackup > 0 ? 1 : 0}: ${missingBackup} Squarespace URL(s) have no file in this backup (see [missing backup] lines above).`,
      );
    }
    console.log("\n[dry-run] No writes. Drop --dry-run to copy + rewrite.");
    process.exit(missingBackup > 0 ? 1 : 0);
  }

  fs.mkdirSync(outRoot, { recursive: true });
  /** Normalized URL staged successfully (dest existed or copy succeeded). */
  const stagedOk = new Set<string>();
  for (const [normalized, a] of urlAssignment) {
    const dest = path.join(outRoot, a.relDir, a.filename);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(dest)) {
      stagedOk.add(normalized);
      continue;
    }
    const realSrc = resolveSourcePathForCopy(a.srcPath) ?? a.srcPath;
    try {
      fs.copyFileSync(realSrc, dest);
      console.log(`[copy] ${a.relDir}/${a.filename}`);
      stagedOk.add(normalized);
    } catch (e) {
      console.warn(
        `[copy failed] ${a.relDir}/${a.filename}\n  from: ${a.srcPath}\n  ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  const copyFailed = urlAssignment.size - stagedOk.size;

  /** file → list of [exact, publicUrl] sorted by exact length desc */
  const perFile = new Map<string, [string, string][]>();
  for (const fr of fileReplacements) {
    if (!stagedOk.has(fr.normalized)) continue;
    const a = urlAssignment.get(fr.normalized);
    if (!a) continue;
    const pub = `${MEDIA_PUBLIC}/${a.relDir}/${a.filename}`;
    const list = perFile.get(fr.file) ?? [];
    list.push([fr.exact, pub]);
    perFile.set(fr.file, list);
  }

  let rewritten = 0;
  for (const [file, pairs] of perFile) {
    let text = fs.readFileSync(file, "utf8");
    const orig = text;
    const sorted = [...pairs].sort((a, b) => b[0].length - a[0].length);
    for (const [exact, pub] of sorted) {
      if (exact === pub) continue;
      text = text.split(exact).join(pub);
    }
    if (text !== orig) {
      fs.writeFileSync(file, text, "utf8");
      console.log(`[rewrite] ${path.relative(REPO_ROOT, file)}`);
      rewritten++;
    }
  }

  console.log(
    `\nDone. Staged ${stagedOk.size}/${urlAssignment.size} unique asset(s) (${copyFailed} copy failure(s)), rewrote ${rewritten} source file(s).`,
  );
  console.log("\n── Summary ──");
  console.log(summaryLine);
  if (copyFailed > 0) {
    console.log(
      `Copy failures: ${copyFailed} (MDX left on Squarespace URLs for those; see [copy failed] above).`,
    );
  }

  if (upload) {
    try {
      runR2Upload(outRoot);
    } catch (e) {
      console.error("R2 upload failed:", e);
      process.exit(1);
    }
  } else {
    console.log(
      `\nUpload: npm run r2:upload -- --source migration/cdn-upload-ready --prefix "" --skip-existing\n(or: npm run media:migrate-squarespace-backup -- --upload)`,
    );
  }

  process.exit(missingBackup > 0 || copyFailed > 0 ? 1 : 0);
}

main();
