/**
 * Migrate Squarespace HTTrack Antarctica place HTML to
 * `content/places/antarctica/antarctic/<place>.mdx` and copy images to
 * `migration/cdn-upload-ready/antarctica/antarctic/<place>/` for CDN upload
 * (public URLs: `https://media.togstrek.com/antarctica/antarctic/...`).
 *
 * Backup layout is flat: `togstrek.com/antarctica/<place>.html` (not nested by country).
 * The site uses a synthetic country segment `antarctic` so routes match
 * `/{continent}/{country}/{place}`.
 *
 * Skips `tag/`, `category/`, and `_https_` embed stubs.
 *
 * Usage:
 *   npx tsx scripts/migrate-squarespace-places-antarctica.ts --dry-run
 *   npx tsx scripts/migrate-squarespace-places-antarctica.ts --backup /path/to/TogsTrekBackup
 *   npx tsx scripts/migrate-squarespace-places-antarctica.ts --limit 3
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

function nfc(s: string): string {
  return s.normalize("NFC");
}

/** HTTrack URLs sometimes use .jpeg while the mirrored file is .jpg (or different casing / Unicode NFC). */
function candidatesForBasename(
  base: string,
  byBase: Map<string, string[]>,
): string[] {
  const direct = byBase.get(base);
  if (direct?.length) return direct;
  const stem = base.replace(/\.[^.]+$/, "");
  if (!stem) return [];
  const out: string[] = [];
  const nfcBase = nfc(base);
  const nfcStem = nfc(stem);
  for (const [k, paths] of byBase) {
    const kStem = k.replace(/\.[^.]+$/, "");
    if (kStem.toLowerCase() === stem.toLowerCase()) out.push(...paths);
    else if (nfc(k) === nfcBase) out.push(...paths);
    else if (nfc(kStem).toLowerCase() === nfcStem.toLowerCase()) out.push(...paths);
  }
  return out;
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

/** CDN paths mirror site URLs: /antarctica/antarctic/drake-passage/photo.jpg */
function mediaUrlForPlace(slugSegments: string[], filename: string): string {
  const seg = slugSegments.filter(Boolean).join("/");
  return seg
    ? `${MEDIA_BASE}/${seg}/${filename}`
    : `${MEDIA_BASE}/${filename}`;
}

/** When the HTTrack mirror has no local file, keep a remote https URL for Turndown. */
function normalizeRemoteImageUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t || t.startsWith("data:")) return null;
  if (t.startsWith("//")) return `https:${t}`.split("?")[0]!;
  if (/^https?:\/\//i.test(t)) return t.split("?")[0]!;
  return null;
}

/**
 * og:image in mirrored HTML is often `../../../images.squarespace-cdn.com/...foo.html?format=`.
 * Turn it into a real image URL for the hero + next/image.
 */
function absolutizeSquarespaceImageMeta(
  htmlAbs: string,
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  const t = raw.trim().split("?")[0]!;
  const fromRemote = normalizeRemoteImageUrl(t);
  if (fromRemote) {
    return /\.html$/i.test(fromRemote)
      ? fromRemote.replace(/\.html$/i, ".jpg")
      : fromRemote;
  }
  const cleaned = t.replace(/^(?:\.\.\/)+/, "");
  if (cleaned.startsWith("images.squarespace-cdn.com/")) {
    let u = `https://${cleaned}`;
    if (/\.html$/i.test(u)) u = u.replace(/\.html$/i, ".jpg");
    return u;
  }
  if (cleaned.startsWith("static1.squarespace.com/")) {
    return `https://${cleaned}`;
  }
  return null;
}

/** Turndown sometimes leaves HTTrack-relative Squarespace URLs in markdown links. */
function fixSquarespaceRelativeLinksInMarkdown(md: string): string {
  return md
    .replace(
      /\]\(\.\.\/\.\.\/\.\.\/images\.squarespace-cdn\.com\//g,
      "](https://images.squarespace-cdn.com/",
    )
    .replace(
      /\]\(\.\.\/\.\.\/images\.squarespace-cdn\.com\//g,
      "](https://images.squarespace-cdn.com/",
    )
    .replace(
      /\]\(\.\.\/images\.squarespace-cdn\.com\//g,
      "](https://images.squarespace-cdn.com/",
    );
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

function httrackHrefToSitePath(
  href: string,
  htmlAbs: string,
  backupRoot: string,
): string | null {
  const t = href.trim().split("?")[0]!;
  if (!t || t.startsWith("#")) return null;
  if (/^mailto:/i.test(t) || /^tel:/i.test(t)) return null;
  if (t.startsWith("http://") || t.startsWith("https://")) {
    try {
      const u = new URL(t);
      if (u.hostname === "togstrek.com" || u.hostname === "www.togstrek.com") {
        const p = u.pathname.replace(/\.html?$/i, "");
        if (!p.endsWith("/") && p.split("/").length > 0) {
          /* ok */
        }
        return p || "/";
      }
    } catch {
      return null;
    }
    return null;
  }
  const baseDir = path.dirname(htmlAbs);
  const resolved = path.normalize(path.join(baseDir, t.replace(/^\.\//, "")));
  const togstrekRoot = path.join(backupRoot, "togstrek.com");
  const rel = path.relative(togstrekRoot, resolved);
  if (rel.startsWith("..")) return null;
  const posixRel = rel.replace(/\\/g, "/");
  const without = posixRel.replace(/\.html?$/i, "");
  return "/" + without.split("/").filter(Boolean).join("/");
}

/**
 * Replace Squarespace summary carousel blocks with simple figure + link markup
 * so Turndown produces readable Markdown.
 */
function flattenSummaryBlocks($frag: ReturnType<typeof load>): void {
  $frag(".summary-block-wrapper").each((_, wrapper) => {
    const $w = $frag(wrapper);
    const heading = $w.find(".summary-header-text").first().text().trim();
    const items: string[] = [];
    $w.find(".summary-item").each((__, item) => {
      const $item = $frag(item);
      const $link = $item.find("a.summary-thumbnail-container").first();
      const $titleA = $item.find("a.summary-title-link").first();
      const href = ($link.attr("href") || $titleA.attr("href") || "").trim();
      const title = ($titleA.text() || $link.attr("data-title") || "").trim();
      const $img = $item.find("img").first();
      const src =
        $img.attr("data-src") || $img.attr("data-image") || $img.attr("src") || "";
      const alt = ($img.attr("alt") || title).trim();
      const time = $item.find("time[datetime]").attr("datetime") || "";
      if (!href && !src && !title) return;
      let block = "";
      if (src) {
        block += `<p><a href="${href || "#"}"><img src="${src}" alt="${alt.replace(/"/g, "&quot;")}" /></a></p>`;
      }
      if (title && href) {
        block += `<p><strong><a href="${href}">${title}</a></strong></p>`;
      } else if (title) {
        block += `<p><strong>${title}</strong></p>`;
      }
      if (time) {
        block += `<p><time datetime="${time}">${time}</time></p>`;
      }
      if (block) items.push(`<div class="togstrek-migrate-summary-item">${block}</div>`);
    });
    const header =
      heading
        ? `<h3 class="togstrek-migrate-summary-heading">${heading}</h3>`
        : "";
    $w.replaceWith(
      `<div class="togstrek-migrate-summary">${header}${items.join("\n")}</div>`,
    );
  });
}

function processImagesInFragment(args: {
  $frag: ReturnType<typeof load>;
  htmlAbs: string;
  backupRoot: string;
  cdnOut: string;
  slugSegments: string[];
  dryRun: boolean;
  byBase: Map<string, string[]>;
}): void {
  const { $frag, htmlAbs, backupRoot, cdnOut, slugSegments, dryRun, byBase } =
    args;

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
    const fsPath = resolveAssetToFs(backupRoot, htmlAbs, raw);
    const base = basenameFromFsOrUrl(fsPath, raw);
    if (!IMAGE_EXT.has(path.extname(base).toLowerCase())) {
      node.remove();
      return;
    }
    const relFromBackup = posix(path.relative(backupRoot, fsPath));
    const hintPath =
      relFromBackup.includes("/") && !relFromBackup.startsWith("..")
        ? relFromBackup.split("/").slice(-4, -1).join("/")
        : "";
    const hint = hintPath || hintFromCdnUrl(raw);

    let srcFile: string;
    try {
      srcFile = resolveSourceFile(
        base,
        candidatesForBasename(base, byBase),
        backupRoot,
        hint,
      );
    } catch (e) {
      const remote =
        normalizeRemoteImageUrl(raw) ||
        absolutizeSquarespaceImageMeta(htmlAbs, raw);
      if (remote) {
        node.attr("src", remote);
        node.removeAttr("data-src");
        node.removeAttr("data-image");
        node.removeAttr("data-togstrek-media-segment");
        node.removeAttr("srcset");
        node.removeAttr("sizes");
        return;
      }
      console.warn(
        `  Image skip ${base} in ${slugSegments.join("/")}: ${(e as Error).message}`,
      );
      node.remove();
      return;
    }

    if (!fs.existsSync(srcFile)) {
      const remote =
        normalizeRemoteImageUrl(raw) ||
        absolutizeSquarespaceImageMeta(htmlAbs, raw);
      if (remote) {
        node.attr("src", remote);
        node.removeAttr("data-src");
        node.removeAttr("data-image");
        node.removeAttr("data-togstrek-media-segment");
        node.removeAttr("srcset");
        node.removeAttr("sizes");
        return;
      }
      console.warn(
        `  Image skip ${base} in ${slugSegments.join("/")}: resolved path missing on disk`,
      );
      node.remove();
      return;
    }

    const segmentAttr = node.attr("data-togstrek-media-segment")?.trim();
    const effectiveSegments = segmentAttr ? [segmentAttr] : slugSegments;

    const dest = path.join(
      args.cdnOut,
      ...effectiveSegments,
      path.basename(srcFile),
    );
    const publicUrl = mediaUrlForPlace(effectiveSegments, path.basename(srcFile));
    if (!dryRun) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(srcFile, dest);
    }

    node.attr("src", publicUrl);
    node.removeAttr("data-src");
    node.removeAttr("data-image");
    node.removeAttr("data-togstrek-media-segment");
    node.removeAttr("srcset");
    node.removeAttr("sizes");
  });
}

/** Drop Squarespace blog chrome that duplicates title, dates, categories, tags, and author. */
function sanitizeSquarespaceBlogPostHtml($frag: ReturnType<typeof load>): void {
  $frag(".blog-item-top-wrapper").remove();
  $frag(".blog-meta-item--tags").remove();
  $frag(".blog-item-author-profile-wrapper").remove();
  $frag("section.blog-item-comments").remove();
}

/**
 * Gallery lightbox anchors wrap a thumb `img` and "View fullsize" screen-reader text.
 * Replace with a single `img` using the anchor `href` (full-size asset) so Turndown emits `![](...)`.
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

function rewriteAnchors(
  $frag: ReturnType<typeof load>,
  htmlAbs: string,
  backupRoot: string,
): void {
  $frag("a[href]").each((_, el) => {
    const node = $frag(el);
    const href = node.attr("href");
    if (!href) return;
    const site = httrackHrefToSitePath(href, htmlAbs, backupRoot);
    if (site) node.attr("href", site);
  });
}

function migrateOnePlacePage(args: {
  htmlAbs: string;
  slugSegments: string[];
  backupRoot: string;
  contentRoot: string;
  cdnOut: string;
  dryRun: boolean;
  byBase: Map<string, string[]>;
  turndown: TurndownService;
}): void {
  if (
    args.slugSegments.length !== 3 ||
    args.slugSegments[0] !== "antarctica" ||
    args.slugSegments[1] !== "antarctic"
  ) {
    console.warn(
      `Skip (expected antarctica/antarctic/<place>): ${args.slugSegments.join("/")}`,
    );
    return;
  }
  const html = fs.readFileSync(args.htmlAbs, "utf8");
  const $ = load(html);
  let inner = $("main#page").html();
  if (!inner) inner = $("article#sections").html();
  if (!inner) {
    console.warn(`No main#page / article#sections: ${args.htmlAbs}`);
    return;
  }

  const $frag = load(`<div class="togstrek-migrate-root">${inner}</div>`);
  $frag("script, style, noscript").remove();
  $frag("#itemPagination").remove();
  flattenSummaryBlocks($frag);
  sanitizeSquarespaceBlogPostHtml($frag);
  unwrapGalleryLightboxAnchors($frag);

  processImagesInFragment({
    $frag,
    htmlAbs: args.htmlAbs,
    backupRoot: args.backupRoot,
    cdnOut: args.cdnOut,
    slugSegments: args.slugSegments,
    dryRun: args.dryRun,
    byBase: args.byBase,
  });

  rewriteAnchors($frag, args.htmlAbs, args.backupRoot);

  const innerMd = fixSquarespaceRelativeLinksInMarkdown(
    args.turndown.turndown($frag(".togstrek-migrate-root").html() ?? ""),
  );

  const title = stripSiteTitle(
    extractMeta(html, "og:title") ??
      args.slugSegments[args.slugSegments.length - 1] ??
      "Place",
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

  const heroSegments = args.slugSegments;

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
        candidatesForBasename(base, args.byBase),
        args.backupRoot,
        hint,
      );
      if (!fs.existsSync(srcFile)) {
        throw new Error("resolved path missing on disk");
      }
      const dest = path.join(
        args.cdnOut,
        ...heroSegments,
        path.basename(srcFile),
      );
      if (!args.dryRun) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(srcFile, dest);
      }
      hero = {
        basename: path.basename(srcFile).replace(/\.[^.]+$/, ""),
        src: mediaUrlForPlace(heroSegments, path.basename(srcFile)),
        width: ogW ? Number(ogW) : 1500,
        height: ogH ? Number(ogH) : 1000,
        alt: title,
        priority: true,
      };
    } catch (e) {
      const remote = absolutizeSquarespaceImageMeta(args.htmlAbs, ogImage);
      if (remote) {
        hero = {
          basename: basenameFromImageUrl(remote).replace(/\.[^.]+$/, ""),
          src: remote,
          width: ogW ? Number(ogW) : 1500,
          height: ogH ? Number(ogH) : 1000,
          alt: title,
          priority: true,
        };
      } else {
        console.warn(
          `  Hero skip for ${args.slugSegments.join("/")}: ${(e as Error).message}`,
        );
      }
    }
  }

  const continentSlug = args.slugSegments[0]!;
  const countrySlug = args.slugSegments[1]!;
  const placeSlug = args.slugSegments[2]!;

  const fm: Record<string, unknown> = {
    title,
    description,
    continentSlug,
    countrySlug,
    placeSlug,
  };
  if (published) fm["published"] = published;
  if (modified) fm["modified"] = modified;
  if (latStr && lngStr) {
    const lat = Number(latStr);
    const lng = Number(lngStr);
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && !(lat === 0 && lng === 0)) {
      fm["lat"] = lat;
      fm["lng"] = lng;
    }
  }
  if (hero) fm["heroImage"] = hero;

  const outPath =
    path.join(args.contentRoot, "places", ...args.slugSegments) + ".mdx";
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

function resetAntarcticaStaging(cdnOut: string, dryRun: boolean): void {
  const target = path.join(cdnOut, "antarctica");
  if (dryRun || !fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true });
}

/** Place posts: `antarctica/<place>.html` at top level only (no tag/category subfolders). */
function listAntarcticaPlaceHtmlFiles(antarcticaDir: string): string[] {
  const out: string[] = [];
  let top: fs.Dirent[];
  try {
    top = fs.readdirSync(antarcticaDir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of top) {
    if (!ent.isFile() || !ent.name.endsWith(".html")) continue;
    if (ent.name.includes("_https_")) continue;
    out.push(path.join(antarcticaDir, ent.name));
  }
  return out.sort((a, b) => a.localeCompare(b));
}

/**
 * `antarctica/drake-passage.html` → `["antarctica", "antarctic", "drake-passage"]`
 */
function antarcticaHtmlToSlugSegments(
  togstrekCom: string,
  htmlAbs: string,
): string[] | null {
  const rel = path.relative(togstrekCom, htmlAbs);
  const without = rel.replace(/\.html$/i, "");
  const parts = without.split(/[/\\]/).filter(Boolean);
  if (parts.length !== 2 || parts[0] !== "antarctica") return null;
  return ["antarctica", "antarctic", parts[1]!];
}

function main(): void {
  const { backupRoot, dryRun, limit } = parseArgs(process.argv);
  const togstrekCom = path.join(backupRoot, "togstrek.com");
  const antarcticaDir = path.join(togstrekCom, "antarctica");
  const contentRoot = path.join(REPO_ROOT, "content");
  const cdnOut = path.join(REPO_ROOT, "migration", "cdn-upload-ready");

  if (!fs.existsSync(antarcticaDir)) {
    console.error(`Antarctica dir missing: ${antarcticaDir}`);
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

  resetAntarcticaStaging(cdnOut, dryRun);
  if (!dryRun) {
    console.log(
      "Cleared migration/cdn-upload-ready/antarctica for a clean place image tree.",
    );
  }

  let postHtml = listAntarcticaPlaceHtmlFiles(antarcticaDir);
  if (limit !== null) postHtml = postHtml.slice(0, limit);

  console.log(
    `Migrating ${postHtml.length} Antarctica place pages${limit ? ` (limit ${limit})` : ""}.`,
  );

  for (const htmlAbs of postHtml) {
    const slugSegments = antarcticaHtmlToSlugSegments(togstrekCom, htmlAbs);
    if (!slugSegments) {
      console.warn(`Skip unexpected path: ${htmlAbs}`);
      continue;
    }
    migrateOnePlacePage({
      htmlAbs,
      slugSegments,
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
      `Upload ${pathToFileURL(path.join(cdnOut, "antarctica")).href} to CDN with keys antarctica/... (same as site paths).`,
    );
  }
}

main();
