/**
 * One-time cleanup for migrated Squarespace photography MDX:
 * - Unwrap `[View fullsize ![alt](thumb)](dest)` → `![alt](bestImageUrl)`
 * - Remove duplicate H1 when it matches frontmatter `title`
 * - Strip category / date / author / tag footer lines that duplicate the page template
 *
 * Usage: npx tsx scripts/fix-photography-mdx-blog-boilerplate.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

import matter from "gray-matter";

const REPO_ROOT = process.cwd();
const CONTENT_ROOT = path.join(REPO_ROOT, "content", "photography");

const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

function extOfUrl(u: string): string {
  try {
    const base = u.split(/[?#]/)[0] ?? "";
    return path.extname(base).toLowerCase();
  } catch {
    return "";
  }
}

function pickImageUrl(innerUrl: string, outerUrl: string): string {
  const eOuter = extOfUrl(outerUrl);
  if (IMAGE_EXT.has(eOuter)) return outerUrl;
  const eInner = extOfUrl(innerUrl);
  if (IMAGE_EXT.has(eInner)) return innerUrl;
  return outerUrl;
}

function walkMdxFiles(dir: string, acc: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMdxFiles(full, acc);
    else if (ent.isFile() && ent.name.endsWith(".mdx")) acc.push(full);
  }
  return acc;
}

const RE_VIEW_FULLSIZE =
  /\[View fullsize\s*!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;

function cleanPhotographyBody(body: string, title: string): string {
  let s = body.replace(/\r\n/g, "\n");

  s = s.replace(RE_VIEW_FULLSIZE, (_, alt: string, inner: string, outer: string) => {
    const url = pickImageUrl(inner, outer);
    return `![${alt}](${url})`;
  });

  s = s.replace(/^\[[^\]]+\]\(\/photography\/category\/[^)]+\)\s*\n?/gm, "");

  s = s.replace(
    /^\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)[a-z]*\s*\n?/gim,
    "",
  );

  s = s.replace(/^Written By \[[^\]]+\]\([^)]+\)\s*\n?/gm, "");

  s = s.replace(/^\[[^\]]+\]\(\/photography\/tag\/[^)]+\)\s*\n?/gm, "");

  s = s.replace(/^\[[^\]]+\]\(\/photographyfb9c\)\s*\n?/gm, "");

  const norm = (t: string) => t.normalize("NFC").trim().toLowerCase();
  const titleN = norm(title);
  const trimmed = s.trimStart();
  const h1 = /^#\s+(.+?)\s*$/m.exec(trimmed);
  if (h1 && norm(h1[1]!) === titleN) {
    s = trimmed.slice(h1[0].length).trimStart();
  }

  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trimEnd() + "\n";
}

function main(): void {
  const files = walkMdxFiles(CONTENT_ROOT);
  let changed = 0;
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const t = typeof data.title === "string" ? data.title : "";
    const nextBody = cleanPhotographyBody(content, t);
    if (nextBody === content) continue;
    const out = matter.stringify(nextBody, data);
    fs.writeFileSync(file, out, "utf8");
    changed += 1;
    console.log(path.relative(REPO_ROOT, file));
  }
  console.log(`Updated ${changed} / ${files.length} files.`);
}

main();
