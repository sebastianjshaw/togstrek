/**
 * Migrate Squarespace HTTrack adventure HTML (`togstrek.com/adventures/*.html`) to
 * `content/adventures/<slug>.mdx` and copy images into
 * `migration/cdn-upload-ready/adventures/<slug>/…` for CDN upload.
 *
 * Usage:
 *   npm run migrate:adventures -- --dry-run
 *   npm run migrate:adventures -- --backup ./TogsTrekBackup
 *   npm run migrate:adventures -- --limit 5
 *
 * Default --backup: $TOGSTREK_MEDIA_BACKUP_ROOT, else ./TogsTrekBackup (expects togstrek.com/...).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";
import { stringify as yamlStringify } from "yaml";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const REPO_ROOT = process.cwd();
const MEDIA_BASE = "https://media.togstrek.com";
const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

function resolveBackupRoot(cli: string | undefined): string {
  if (cli?.trim()) return path.resolve(REPO_ROOT, cli.trim());
  const env = process.env.TOGSTREK_MEDIA_BACKUP_ROOT?.trim();
  if (env) return path.resolve(env);
  return path.resolve(REPO_ROOT, "TogsTrekBackup");
}

function walkHtmlFiles(dir: string, acc: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtmlFiles(full, acc);
    else if (ent.isFile() && ent.name.endsWith(".html")) acc.push(full);
  }
  return acc;
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

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&mdash;/g, "—")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
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

function extractItemprop(html: string, itemprop: string): string | null {
  const re = new RegExp(
    `<meta[^>]+itemprop="${itemprop}"[^>]+content="([^"]*)"`,
    "i",
  );
  const m = html.match(re);
  if (m) return decodeHtmlEntities(m[1]!.trim()) || null;
  const re2 = new RegExp(
    `<meta[^>]+content="([^"]*)"[^>]+itemprop="${itemprop}"`,
    "i",
  );
  const m2 = html.match(re2);
  return m2 ? decodeHtmlEntities(m2[1]!.trim()) || null : null;
}

function stripSiteTitle(raw: string): string {
  return raw
    .replace(/\s*[—–]\s*A Tog's Trek\s*$/i, "")
    .replace(/\s*&mdash;\s*A Tog&#39;s Trek\s*$/i, "")
    .trim();
}

function formatDateOnly(iso: string | null): string | undefined {
  if (!iso) return undefined;
  const d = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return d ? d[1] : undefined;
}

function posix(p: string): string {
  return p.split(path.sep).join("/");
}

function resolveAssetToFs(backupRoot: string, htmlFile: string, raw: string): string {
  const trimmed = raw.trim().split("?")[0]!;
  if (trimmed.startsWith("data:")) return "";
  if (trimmed.startsWith("//")) {
    const u = new URL(`https:${trimmed}`);
    const sub = u.pathname.replace(/^\//, "");
    return path.join(backupRoot, u.hostname, sub);
  }
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      const sub = u.pathname.replace(/^\//, "");
      return path.join(backupRoot, u.hostname, sub);
    } catch {
      return "";
    }
  }
  const baseDir = path.dirname(htmlFile);
  const joined = path.normalize(path.join(baseDir, trimmed));
  if (fs.existsSync(joined)) return joined;
  const stripped = trimmed.replace(/^(\.\.\/)+/, "");
  return path.join(backupRoot, stripped);
}

function basenameFromFsOrUrl(fsPath: string, fallbackUrl: string): string {
  if (fsPath && fs.existsSync(fsPath)) return path.basename(fsPath);
  return basenameFromImageUrl(fallbackUrl);
}

function basenameFromImageUrl(raw: string): string {
  const withoutQuery = raw.trim().split("?")[0]!;
  try {
    if (withoutQuery.startsWith("//")) {
      const u = new URL(`https:${withoutQuery}`);
      return decodeURIComponent(path.basename(u.pathname)) || "image.jpg";
    }
    if (/^https?:\/\//i.test(withoutQuery)) {
      const u = new URL(withoutQuery);
      return decodeURIComponent(path.basename(u.pathname)) || "image.jpg";
    }
  } catch {
    /* fall through */
  }
  const parts = withoutQuery.split("/").filter(Boolean);
  let last = parts[parts.length - 1] || "image.jpg";
  try {
    last = decodeURIComponent(last);
  } catch {
    /* keep last */
  }
  if (/\.html?$/i.test(last)) {
    last = last.replace(/\.html?$/i, ".jpg");
  }
  return last;
}

function resolveSourceFile(
  basename: string,
  candidates: string[],
  backupRoot: string,
  hint: string,
): string {
  if (candidates.length === 1) return candidates[0]!;
  if (!hint) {
    const rels = candidates.map((c) => posix(path.relative(backupRoot, c)));
    throw new Error(
      `Multiple "${basename}" in backup; add unique path. Found:\n  ${rels.join("\n  ")}`,
    );
  }
  const hintNorm = hint.split(path.sep).join("/");
  const matched = candidates.filter((c) =>
    posix(path.relative(backupRoot, c)).includes(hintNorm),
  );
  if (matched.length === 1) return matched[0]!;
  if (matched.length === 0) {
    throw new Error(`No "${basename}" matching hint "${hint}"`);
  }
  const rels = matched.map((c) => posix(path.relative(backupRoot, c)));
  throw new Error(`Ambiguous "${basename}" for hint "${hint}":\n  ${rels.join("\n  ")}`);
}

function slugSegmentsFromHtmlPath(adventuresDir: string, htmlAbs: string): string[] {
  const rel = path.relative(adventuresDir, htmlAbs);
  const without = rel.replace(/\.html?$/i, "");
  return without.split(path.sep).filter(Boolean);
}

function shouldSkipHtml(relativePosix: string): boolean {
  const seg = relativePosix.split("/").filter(Boolean);
  if (seg[0] === "tag" || seg[0] === "category") return true;
  const base = path.basename(relativePosix, ".html");
  if (base.startsWith("ugiv") && base.length > 30) return true;
  return false;
}

function mediaUrlForAdventure(slugSegments: string[], filename: string): string {
  return `${MEDIA_BASE}/adventures/${slugSegments.join("/")}/${filename}`;
}

function hintFromCdnUrl(raw: string): string {
  try {
    const u = new URL(
      raw.trim().startsWith("//") ? `https:${raw.trim()}` : raw.trim(),
    );
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.length >= 2 ? parts.slice(-2, -1)[0]! : "";
  } catch {
    return "";
  }
}

/**
 * Gallery lightbox anchors wrap a thumb `img` — use the anchor `href` (full-size)
 * so Turndown emits `![](...)`.
 */
function unwrapGalleryLightboxAnchors($frag: ReturnType<typeof load>): void {
  $frag("a.image-slide-anchor, a.js-gallery-lightbox-opener").each((_, el) => {
    const $a = $frag(el);
    const href = $a.attr("href")?.trim();
    const $innerImg = $a.find("img").first();
    if (!href || !$innerImg.length) return;
    const alt = $innerImg.attr("alt") ?? "";
    const $out = $frag("<img />");
    $out.attr("src", href);
    if (alt) $out.attr("alt", alt);
    $a.replaceWith($out);
  });
}

function migrateAdventurePost(args: {
  htmlAbs: string;
  adventuresDir: string;
  backupRoot: string;
  contentRoot: string;
  cdnOut: string;
  dryRun: boolean;
  byBase: Map<string, string[]>;
  turndown: TurndownService;
}): void {
  const html = fs.readFileSync(args.htmlAbs, "utf8");
  const slugSegments = slugSegmentsFromHtmlPath(args.adventuresDir, args.htmlAbs);
  if (slugSegments.length === 0) return;

  const $ = load(html);
  let inner = $(".blog-item-content.e-content").html();
  if (!inner) inner = $(".blog-item-content").html();
  if (!inner) inner = $("main#page").html();
  if (!inner) inner = $("article#sections").html();
  if (!inner) {
    console.warn(`No main body (blog-item / main#page / article#sections): ${args.htmlAbs}`);
    return;
  }

  const $frag = load(`<div class="togstrek-migrate-root">${inner}</div>`);
  $frag("script, style, noscript").remove();
  $frag("#itemPagination").remove();
  unwrapGalleryLightboxAnchors($frag);

  $frag("a").each((_, el) => {
    const node = $frag(el);
    const img = node.find("img").first();
    if (img.length) {
      node.replaceWith(img);
    }
  });

  $frag("img").each((_, el) => {
    const node = $frag(el);
    const raw =
      node.attr("data-src") ||
      node.attr("data-image") ||
      node.attr("src") ||
      "";
    if (!raw || raw.startsWith("data:")) {
      node.remove();
      return;
    }
    const fsPath = resolveAssetToFs(args.backupRoot, args.htmlAbs, raw);
    const base = basenameFromFsOrUrl(fsPath, raw);
    if (!IMAGE_EXT.has(path.extname(base).toLowerCase())) {
      node.remove();
      return;
    }
    const relFromBackup = posix(path.relative(args.backupRoot, fsPath));
    const hintPath =
      relFromBackup.includes("/") && !relFromBackup.startsWith("..")
        ? relFromBackup.split("/").slice(-4, -1).join("/")
        : "";
    const hint = hintPath || hintFromCdnUrl(raw);

    let srcFile: string;
    try {
      srcFile = resolveSourceFile(
        base,
        args.byBase.get(base) ?? [],
        args.backupRoot,
        hint,
      );
    } catch (e) {
      console.warn(
        `  Image skip ${base} in ${slugSegments.join("/")}: ${(e as Error).message}`,
      );
      node.remove();
      return;
    }

    const dest = path.join(
      args.cdnOut,
      "adventures",
      ...slugSegments,
      path.basename(srcFile),
    );
    const publicUrl = mediaUrlForAdventure(slugSegments, path.basename(srcFile));
    if (!args.dryRun) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(srcFile, dest);
    }

    node.attr("src", publicUrl);
    node.removeAttr("data-src");
    node.removeAttr("data-image");
    node.removeAttr("srcset");
    node.removeAttr("sizes");
  });

  const innerMd = args.turndown.turndown($frag(".togstrek-migrate-root").html() ?? "");

  const title = stripSiteTitle(
    extractMeta(html, "og:title") ?? slugSegments[slugSegments.length - 1]!,
  );
  const description =
    extractMeta(html, "og:description")?.replace(/\s+/g, " ").trim() ||
    title;

  const published = formatDateOnly(extractItemprop(html, "datePublished"));
  const modified = formatDateOnly(extractItemprop(html, "dateModified"));

  const ogImage = extractMeta(html, "og:image");
  const ogW = extractMeta(html, "og:image:width");
  const ogH = extractMeta(html, "og:image:height");
  const latStr = extractMeta(html, "og:latitude");
  const lngStr = extractMeta(html, "og:longitude");

  let hero: Record<string, unknown> | undefined;
  if (ogImage) {
    const fsPath = resolveAssetToFs(args.backupRoot, args.htmlAbs, ogImage);
    const base = basenameFromFsOrUrl(fsPath, ogImage);
    const relFromBackup = posix(path.relative(args.backupRoot, fsPath));
    const hintPath =
      relFromBackup.includes("/") && !relFromBackup.startsWith("..")
        ? relFromBackup.split("/").slice(-4, -1).join("/")
        : "";
    const hint = hintPath || hintFromCdnUrl(ogImage);
    try {
      const srcFile = resolveSourceFile(
        base,
        args.byBase.get(base) ?? [],
        args.backupRoot,
        hint,
      );
      const dest = path.join(
        args.cdnOut,
        "adventures",
        ...slugSegments,
        path.basename(srcFile),
      );
      if (!args.dryRun) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(srcFile, dest);
      }
      hero = {
        basename: base.replace(/\.[^.]+$/, ""),
        src: mediaUrlForAdventure(slugSegments, path.basename(srcFile)),
        width: ogW ? Number(ogW) : 1500,
        height: ogH ? Number(ogH) : 1000,
        alt: title,
        priority: true,
      };
    } catch (e) {
      console.warn(
        `  Hero skip for ${slugSegments.join("/")}: ${(e as Error).message}`,
      );
    }
  }

  const slugKey = slugSegments.join("/");
  const fm: Record<string, unknown> = { title, description, slug: slugKey };
  if (published) fm["published"] = published;
  if (modified) fm["modified"] = modified;
  if (latStr && lngStr) {
    const lat = Number(latStr);
    const lng = Number(lngStr);
    if (
      !Number.isNaN(lat) &&
      !Number.isNaN(lng) &&
      (lat !== 0 || lng !== 0)
    ) {
      fm["lat"] = lat;
      fm["lng"] = lng;
    }
  }
  if (hero) fm["heroImage"] = hero;

  const outPath =
    path.join(args.contentRoot, "adventures", ...slugSegments) + ".mdx";
  const mdx = `---\n${yamlStringify(fm).trim()}\n---\n\n${innerMd.trim()}\n`;

  if (!args.dryRun) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, mdx, "utf8");
  }
  console.log(
    `${args.dryRun ? "[dry-run] " : ""}${posix(path.relative(REPO_ROOT, outPath))}`,
  );
}

function parseArgs(argv: string[]): {
  backupRoot: string;
  dryRun: boolean;
  limit: number | null;
} {
  let backupRoot: string | undefined;
  let dryRun = false;
  let limit: number | null = null;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") dryRun = true;
    else if (a === "--backup" && argv[i + 1]) backupRoot = argv[++i];
    else if (a === "--limit" && argv[i + 1]) limit = Number(argv[++i]);
  }
  return {
    backupRoot: resolveBackupRoot(backupRoot),
    dryRun,
    limit: limit !== null && Number.isFinite(limit) && limit > 0 ? limit : null,
  };
}

function main(): void {
  const { backupRoot, dryRun, limit } = parseArgs(process.argv);
  const adventuresDir = path.join(backupRoot, "togstrek.com", "adventures");
  const contentRoot = path.join(REPO_ROOT, "content");
  const cdnOut = path.join(REPO_ROOT, "migration", "cdn-upload-ready");

  if (!fs.existsSync(adventuresDir)) {
    console.error(`Adventures HTML dir missing: ${adventuresDir}`);
    process.exit(1);
  }

  const allImages = walkImages(backupRoot);
  const byBase = indexByBasename(allImages);
  console.log(
    `Indexed ${allImages.length} images under backup (for filename lookup).`,
  );

  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });
  turndown.use(gfm);

  const allHtml = walkHtmlFiles(adventuresDir);
  const posts = allHtml.filter((abs) => {
    const rel = posix(path.relative(adventuresDir, abs));
    return !shouldSkipHtml(rel);
  });

  const toRun = limit !== null ? posts.slice(0, limit) : posts;
  console.log(
    `Migrating ${toRun.length} of ${posts.length} adventure post HTML files${limit ? ` (limit ${limit})` : ""}.`,
  );

  for (const htmlAbs of toRun) {
    migrateAdventurePost({
      htmlAbs,
      adventuresDir,
      backupRoot,
      contentRoot,
      cdnOut,
      dryRun,
      byBase,
      turndown,
    });
  }

  if (dryRun) {
    console.log("Dry run complete — no files written.");
  } else {
    console.log("Done.");
    console.log(
      `Upload ${pathToFileURL(path.join(cdnOut, "adventures")).href} to CDN under /adventures/`,
    );
  }
}

main();
