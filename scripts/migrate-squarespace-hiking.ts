/**
 * Migrate Squarespace HTTrack hiking blog HTML to nested `content/hiking/.../*.mdx` and copy images
 * into `migration/cdn-upload-ready/hiking/...` for CDN upload (same host as place images).
 *
 * Usage:
 *   npm run migrate:hiking -- --dry-run
 *   npm run migrate:hiking -- --backup ./TogsTrekBackup
 *   npm run migrate:hiking -- --limit 5
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

/** Resolve HTTrack-relative asset URL to absolute filesystem path under backup root. */
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

function slugSegmentsFromHtmlPath(
  hikingDir: string,
  htmlAbs: string,
): string[] {
  const rel = path.relative(hikingDir, htmlAbs);
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

function mediaUrlFor(slugSegments: string[], filename: string): string {
  return `${MEDIA_BASE}/hiking/${slugSegments.join("/")}/${filename}`;
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

function hrefToSitePath(href: string): string {
  let h = href.trim().replace(/^\.\//, "");
  if (h.startsWith("hiking/")) h = h.slice("hiking/".length);
  const stem = h.replace(/\.html?$/i, "");
  return `/hiking/${stem}`;
}

function migrateHub(args: {
  backupRoot: string;
  contentRoot: string;
  cdnOut: string;
  dryRun: boolean;
  byBase: Map<string, string[]>;
}): void {
  const hubPath = path.join(args.backupRoot, "togstrek.com", "hiking.html");
  if (!fs.existsSync(hubPath)) {
    console.warn("No hiking.html hub at", hubPath);
    return;
  }
  const html = fs.readFileSync(hubPath, "utf8");
  const $ = load(html);
  const title = stripSiteTitle(
    extractMeta(html, "og:title") ?? "Hiking",
  );
  const description =
    extractMeta(html, "og:description")?.trim() ||
    "Trail reports, stages, and photos from hikes on Tog’s Trek.";
  const ogImage = extractMeta(html, "og:image");
  const ogW = extractMeta(html, "og:image:width");
  const ogH = extractMeta(html, "og:image:height");

  const links: { title: string; href: string }[] = [];
  $("article.hentry.blog-item h1.blog-title a").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!href || !text) return;
    if (href.includes("/tag/") || href.includes("/category/")) return;
    links.push({ title: text, href: hrefToSitePath(href) });
  });

  const listMd = links
    .map((l) => `- [${l.title.replace(/\]/g, "\\]")}](${l.href})`)
    .join("\n");

  const bodyMd = [
    "Posts from the original hiking collection (first page of the archive). Deeper pagination may list additional entries not mirrored in this static export.",
    "",
    listMd || "_No article links found in hub HTML._",
    "",
  ].join("\n");

  let hero: Record<string, unknown> | undefined;
  if (ogImage) {
    const fsPath = resolveAssetToFs(args.backupRoot, hubPath, ogImage);
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
      const dest = path.join(args.cdnOut, "hiking", "_hub", base);
      if (!args.dryRun) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(srcFile, dest);
      }
      hero = {
        basename: base.replace(/\.[^.]+$/, ""),
        src: mediaUrlFor(["_hub"], base),
        width: ogW ? Number(ogW) : 1500,
        height: ogH ? Number(ogH) : 1000,
        alt: title,
        priority: true,
      };
    } catch (e) {
      console.warn(`Hub hero image skipped: ${(e as Error).message}`);
    }
  }

  const fm: Record<string, unknown> = { title, description };
  if (hero) fm["heroImage"] = hero;

  const outPath = path.join(args.contentRoot, "hiking", "index.mdx");
  const mdx = `---\n${yamlStringify(fm).trim()}\n---\n\n${bodyMd}\n`;
  if (!args.dryRun) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, mdx, "utf8");
  }
  console.log(`${args.dryRun ? "[dry-run] " : ""}Wrote ${posix(path.relative(REPO_ROOT, outPath))}`);
}

function migratePost(args: {
  htmlAbs: string;
  hikingDir: string;
  backupRoot: string;
  contentRoot: string;
  cdnOut: string;
  dryRun: boolean;
  byBase: Map<string, string[]>;
  turndown: TurndownService;
}): void {
  const html = fs.readFileSync(args.htmlAbs, "utf8");
  const slugSegments = slugSegmentsFromHtmlPath(args.hikingDir, args.htmlAbs);
  if (slugSegments.length === 0) return;

  const $ = load(html);
  let inner = $(".blog-item-content.e-content").html();
  if (!inner) inner = $(".blog-item-content").html();
  if (!inner) {
    console.warn(`No blog-item-content: ${args.htmlAbs}`);
    return;
  }

  const $frag = load(`<div class="togstrek-migrate-root">${inner}</div>`);
  $frag("script, style, noscript").remove();

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
      "hiking",
      ...slugSegments,
      path.basename(srcFile),
    );
    const publicUrl = mediaUrlFor(slugSegments, path.basename(srcFile));
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
        "hiking",
        ...slugSegments,
        path.basename(srcFile),
      );
      if (!args.dryRun) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(srcFile, dest);
      }
      hero = {
        basename: base.replace(/\.[^.]+$/, ""),
        src: mediaUrlFor(slugSegments, path.basename(srcFile)),
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

  const fm: Record<string, unknown> = { title, description };
  if (published) fm["published"] = published;
  if (modified) fm["modified"] = modified;
  if (latStr && lngStr) {
    const lat = Number(latStr);
    const lng = Number(lngStr);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      fm["lat"] = lat;
      fm["lng"] = lng;
    }
  }
  if (hero) fm["heroImage"] = hero;

  const outPath =
    path.join(args.contentRoot, "hiking", ...slugSegments) + ".mdx";
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
  const hikingDir = path.join(backupRoot, "togstrek.com", "hiking");
  const contentRoot = path.join(REPO_ROOT, "content");
  const cdnOut = path.join(REPO_ROOT, "migration", "cdn-upload-ready");

  if (!fs.existsSync(hikingDir)) {
    console.error(`Hiking HTML dir missing: ${hikingDir}`);
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

  migrateHub({
    backupRoot,
    contentRoot,
    cdnOut,
    dryRun,
    byBase,
  });

  const allHtml = walkHtmlFiles(hikingDir);
  const posts = allHtml.filter((abs) => {
    const rel = posix(path.relative(hikingDir, abs));
    return !shouldSkipHtml(rel);
  });

  const toRun =
    limit !== null ? posts.slice(0, limit) : posts;
  console.log(
    `Migrating ${toRun.length} of ${posts.length} hiking post HTML files${limit ? ` (limit ${limit})` : ""}.`,
  );

  for (const htmlAbs of toRun) {
    migratePost({
      htmlAbs,
      hikingDir,
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
      `Upload ${pathToFileURL(path.join(cdnOut, "hiking")).href} to CDN under /hiking/`,
    );
  }
}

main();
