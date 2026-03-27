/**
 * WordPress WXR (eXtended RSS) → Markdown/MDX exporter.
 *
 * Handles:
 * - `post` and `page` → `.mdx` with YAML frontmatter (title, slug, dates, categories, tags, thumbnail)
 * - `attachment` → `attachments/manifest.json` + `attachments/urls.txt` (download list)
 * - Featured images via `_thumbnail_id` postmeta → resolved against attachment items
 *
 * Usage:
 *   npm run import:wxr -- --input ./export.xml --out ./migration/wxr-import
 *   npm run import:wxr -- --input ./export.xml --out ./out --dry-run
 *   npm run import:wxr -- --input ./export.xml --preserve-html   (skip Turndown; class→className for MDX)
 *   npm run import:wxr -- --input ./export.xml --published-only
 *
 * Body conversion:
 * - Strips Gutenberg `<!-- wp:... -->` comments
 * - Default: HTML → GitHub-flavored Markdown (Turndown)
 * - `--preserve-html`: keep HTML, rewrite `class=` → `className=` for JSX compatibility
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { XMLParser } from "fast-xml-parser";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import YAML from "yaml";

type WpItem = Record<string, unknown>;

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") out["dry-run"] = true;
    else if (a === "--preserve-html") out["preserve-html"] = true;
    else if (a === "--published-only") out["published-only"] = true;
    else if (a === "--input" && argv[i + 1]) out["input"] = argv[++i]!;
    else if (a === "--out" && argv[i + 1]) out["out"] = argv[++i]!;
  }
  return out;
}

function ensureArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

/** Pull text from parser nodes (strings, numbers, or { "#text": "..." }). */
function scalarText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object" && v !== null && "#text" in v) {
    const t = (v as { "#text": unknown })["#text"];
    return typeof t === "string" ? t.trim() : scalarText(t);
  }
  return "";
}

function stripGutenbergComments(html: string): string {
  return html.replace(/<!--\s*wp:[\s\S]*?-->/g, "");
}

function stripWpHtml(html: string): string {
  return stripGutenbergComments(html).trim();
}

/** Use with `--preserve-html` so leftover tags are JSX-friendly in MDX. */
function htmlToMdxJsx(html: string): string {
  return stripWpHtml(html).replace(/\bclass=/gi, "className=");
}

function makeTurndown(): TurndownService {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  td.use(gfm);
  return td;
}

type PostmetaMap = Map<string, string[]>;

function collectPostmeta(item: WpItem): PostmetaMap {
  const map: PostmetaMap = new Map();
  const raw = item["wp:postmeta"];
  const blocks = ensureArray(raw).filter(
    (b) => b != null && typeof b === "object",
  ) as WpItem[];
  for (const block of blocks) {
    const key = scalarText(block["wp:meta_key"]);
    const val = scalarText(block["wp:meta_value"]);
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(val);
    map.set(key, list);
  }
  return map;
}

function firstMeta(meta: PostmetaMap, key: string): string | undefined {
  return meta.get(key)?.[0];
}

type Term = { domain: string; nicename: string; name: string };

function collectTerms(item: WpItem): { categories: Term[]; tags: Term[] } {
  const categories: Term[] = [];
  const tags: Term[] = [];
  const raw = item.category;
  for (const c of ensureArray(raw)) {
    if (c == null || typeof c !== "object") continue;
    const o = c as Record<string, unknown>;
    const domain = String(o["@_domain"] ?? "");
    const nicename = String(o["@_nicename"] ?? "");
    const name = scalarText(o["#text"] ?? o);
    const term: Term = { domain, nicename, name };
    if (domain === "category") categories.push(term);
    else if (domain === "post_tag") tags.push(term);
    else categories.push(term);
  }
  return { categories, tags };
}

type AttachmentRecord = {
  wpPostId: string;
  slug: string;
  title: string;
  url: string;
  parentId: string;
  status: string;
  mimeType: string;
  attachedFile: string;
  guid: string;
  link: string;
};

function attachmentMimeType(item: WpItem, meta: PostmetaMap): string {
  const top = scalarText(item["wp:post_mime_type"]);
  if (top) return top;
  return firstMeta(meta, "_wp_post_mime_type") ?? "";
}

function buildAttachmentIndex(items: WpItem[]): {
  byId: Map<string, AttachmentRecord>;
  list: AttachmentRecord[];
} {
  const byId = new Map<string, AttachmentRecord>();
  const list: AttachmentRecord[] = [];

  for (const item of items) {
    const postType = scalarText(item["wp:post_type"]);
    if (postType !== "attachment") continue;

    const wpPostId = scalarText(item["wp:post_id"]);
    const meta = collectPostmeta(item);
    const attachedFile = firstMeta(meta, "_wp_attached_file") ?? "";
    const mimeType = attachmentMimeType(item, meta);

    let url = scalarText(item["wp:attachment_url"]);
    if (!url) url = scalarText(item.link);

    const rec: AttachmentRecord = {
      wpPostId,
      slug: scalarText(item["wp:post_name"]) || `attachment-${wpPostId}`,
      title: scalarText(item.title),
      url,
      parentId: scalarText(item["wp:post_parent"]) || "0",
      status: scalarText(item["wp:status"]),
      mimeType,
      attachedFile,
      guid: scalarText(
        typeof item.guid === "object" && item.guid !== null
          ? (item.guid as { "#text"?: string })["#text"]
          : item.guid,
      ),
      link: scalarText(item.link),
    };

    if (wpPostId) byId.set(wpPostId, rec);
    list.push(rec);
  }

  return { byId, list };
}

function resolveThumbnail(
  meta: PostmetaMap,
  attachments: Map<string, AttachmentRecord>,
): Record<string, string> | undefined {
  const id = firstMeta(meta, "_thumbnail_id");
  if (!id) return undefined;
  const att = attachments.get(id);
  if (!att?.url) {
    return { wpAttachmentId: id };
  }
  const filename = att.attachedFile
    ? path.basename(att.attachedFile)
    : path.basename(new URL(att.url, "https://_").pathname);
  return {
    wpAttachmentId: id,
    url: att.url,
    basename: filename,
  };
}

function safeBasename(slug: string, wpPostId: string): string {
  const base =
    slug.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") ||
    `post-${wpPostId}`;
  return `${base}.mdx`;
}

function writeFileEnsured(
  absPath: string,
  body: string,
  dryRun: boolean,
): void {
  if (dryRun) return;
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, body, "utf8");
}

function main(): void {
  const args = parseArgs(process.argv);
  const inputPath = path.resolve(
    process.cwd(),
    String(args["input"] ?? ""),
  );
  const outRoot = path.resolve(
    process.cwd(),
    String(args["out"] ?? "migration/wxr-import"),
  );
  const dryRun = Boolean(args["dry-run"]);
  const preserveHtml = Boolean(args["preserve-html"]);
  const publishedOnly = Boolean(args["published-only"]);

  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error("Usage: --input path/to/WordPress-export.xml [--out dir]");
    process.exit(1);
  }

  const xml = fs.readFileSync(inputPath, "utf8");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: false,
    processEntities: true,
  });
  const doc = parser.parse(xml) as {
    rss?: { channel?: { title?: string; item?: WpItem | WpItem[] } };
  };

  const channel = doc.rss?.channel;
  if (!channel) {
    console.error("Invalid WXR: missing rss.channel");
    process.exit(1);
  }

  const items = ensureArray(channel.item);
  const siteTitle = scalarText(channel.title);

  const { byId: attachmentById, list: attachmentList } =
    buildAttachmentIndex(items);

  const postsDir = path.join(outRoot, "posts");
  const pagesDir = path.join(outRoot, "pages");
  const attDir = path.join(outRoot, "attachments");

  const turndown = preserveHtml ? null : makeTurndown();

  let postsWritten = 0;
  let pagesWritten = 0;
  let skipped = 0;
  const usedNames = new Map<string, number>();

  for (const item of items) {
    const postType = scalarText(item["wp:post_type"]);
    if (postType === "attachment") continue;

    const status = scalarText(item["wp:status"]);
    if (publishedOnly && status !== "publish") {
      skipped++;
      continue;
    }

    if (postType !== "post" && postType !== "page") {
      skipped++;
      continue;
    }

    const wpPostId = scalarText(item["wp:post_id"]);
    const slug =
      scalarText(item["wp:post_name"]) || `post-${wpPostId || "unknown"}`;
    const title = scalarText(item.title);
    const link = scalarText(item.link);
    const guid =
      typeof item.guid === "object" && item.guid !== null
        ? scalarText((item.guid as { "#text": unknown })["#text"])
        : scalarText(item.guid);

    const rawHtml = scalarText(item["content:encoded"]);
    const excerpt = scalarText(item["excerpt:encoded"]);
    const pub = scalarText(item["wp:post_date_gmt"]) ||
      scalarText(item["wp:post_date"]);
    const creator = scalarText(item["dc:creator"]);

    const meta = collectPostmeta(item);
    const { categories, tags } = collectTerms(item);
    const thumbnail = resolveThumbnail(meta, attachmentById);

    let body: string;
    if (preserveHtml) {
      body = htmlToMdxJsx(rawHtml);
    } else {
      const cleaned = stripWpHtml(rawHtml);
      body = turndown!.turndown(cleaned || "<p></p>").trim();
    }

    const frontmatter: Record<string, unknown> = {
      title: title || slug,
      slug,
      description: excerpt || undefined,
      published: pub || undefined,
      wpPostId,
      wpPostType: postType,
      wpStatus: status || undefined,
      guid: guid || undefined,
      originalPermalink: link || undefined,
      author: creator || undefined,
      siteTitle: siteTitle || undefined,
      categories: categories.length
        ? categories.map((c) => ({ nicename: c.nicename, name: c.name }))
        : undefined,
      tags: tags.length
        ? tags.map((t) => ({ nicename: t.nicename, name: t.name }))
        : undefined,
      thumbnail,
    };

    // Drop undefined keys for cleaner YAML
    for (const k of Object.keys(frontmatter)) {
      if (frontmatter[k] === undefined) delete frontmatter[k];
    }

    const yaml = YAML.stringify(frontmatter, {
      lineWidth: 0,
      defaultStringType: "QUOTE_DOUBLE",
      defaultKeyType: "PLAIN",
    }).trimEnd();

    const mdx = `---\n${yaml}\n---\n\n${body}\n`;

    let baseName = safeBasename(slug, wpPostId);
    const targetDir = postType === "post" ? postsDir : pagesDir;
    let outFile = path.join(targetDir, baseName);
    const key = `${postType}:${baseName}`;
    const n = (usedNames.get(key) ?? 0) + 1;
    usedNames.set(key, n);
    if (n > 1) {
      const stem = baseName.replace(/\.mdx$/i, "");
      baseName = `${stem}-${wpPostId}.mdx`;
      outFile = path.join(targetDir, baseName);
    }

    writeFileEnsured(outFile, mdx, dryRun);
    if (postType === "post") postsWritten++;
    else pagesWritten++;
  }

  const manifest = {
    exportedAt: new Date().toISOString(),
    sourceFile: path.relative(process.cwd(), inputPath),
    siteTitle,
    attachmentCount: attachmentList.length,
    attachments: attachmentList,
  };

  const manifestPath = path.join(attDir, "manifest.json");
  const urlsPath = path.join(attDir, "urls.txt");

  if (!dryRun) {
    fs.mkdirSync(attDir, { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    const lines = attachmentList
      .map((a) => a.url)
      .filter(Boolean)
      .join("\n");
    fs.writeFileSync(urlsPath, `${lines}\n`, "utf8");
  }

  console.log(
    dryRun
      ? `[dry-run] Would write ${postsWritten} posts, ${pagesWritten} pages, ${attachmentList.length} attachments manifest`
      : `Wrote ${postsWritten} posts → ${postsDir}\nWrote ${pagesWritten} pages → ${pagesDir}\nWrote attachments manifest → ${manifestPath}\nWrote URL list → ${urlsPath}`,
  );
  if (skipped)
    console.log(`Skipped ${skipped} items (type filter or --published-only).`);
}

main();
