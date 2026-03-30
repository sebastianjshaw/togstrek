/**
 * Convert migrated Squarespace “Featured” summary markdown into the Huldufólk-style
 * MDX template: intro wrapper + <TogstrekAdventureFeaturedSection> cards.
 *
 *   npm run normalize:adventure-mdx
 */

import * as fs from "node:fs";
import * as path from "node:path";

const REPO_ROOT = process.cwd();
const ADVENTURES_DIR = path.join(REPO_ROOT, "content", "adventures");

const SKIP_FILES = new Set(["2023-hulduflk.mdx"]);

const DATE_LINE = /^([A-Za-z]{3} \d{1,2}, \d{4})$/;
const LINK_LINE = /^\[([^\]]+)\]\((\.\.\/[^)]+\.html)\)\s*$/;
const READ_MORE = /^\[Read More/;

type Item = {
  title: string;
  rawPath: string;
  dateDisplay: string;
  excerpt: string;
};

function demoteFirstH1(text: string): string {
  const lines = text.split("\n");
  if (lines[0]?.match(/^#\s+/) && !lines[0].match(/^##\s+/)) {
    lines[0] = lines[0].replace(/^#/, "##");
  }
  return lines.join("\n").trim();
}

function cleanFrontmatterBlock(fm: string): string {
  return fm
    .split("\n")
    .filter((l) => !/^\s*lat:\s*/.test(l) && !/^\s*lng:\s*/.test(l))
    .join("\n")
    .trimEnd();
}

function pathToHref(raw: string): string {
  const without = raw.replace(/^\.\//, "").replace(/^\.\.\//, "");
  return `/${without.replace(/\.html?$/i, "")}`;
}

function dateToIso(display: string): string | undefined {
  const d = new Date(display);
  if (Number.isNaN(d.getTime())) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** next-mdx-remote RSC removes `prop={expr}`; only string literals survive (see remove-javascript-expressions). */
function mdxLiteralStringAttr(value: string): string {
  const esc = value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `"${esc}"`;
}

function renderPlace(it: Item): string {
  const href = pathToHref(it.rawPath);
  const iso = dateToIso(it.dateDisplay);
  const lines = [
    "  <TogstrekAdventureFeaturedPlace",
    `    href=${mdxLiteralStringAttr(href)}`,
    `    title=${mdxLiteralStringAttr(it.title)}`,
    `    date=${mdxLiteralStringAttr(it.dateDisplay)}`,
  ];
  if (iso) lines.push(`    dateTime=${mdxLiteralStringAttr(iso)}`);
  lines.push(`    excerpt=${mdxLiteralStringAttr(it.excerpt)}`, "  />");
  return lines.join("\n");
}

function parseItemsFromLines(lines: string[], start: number): { items: Item[]; end: number } {
  const items: Item[] = [];
  let i = start;

  while (i < lines.length) {
    while (i < lines.length && lines[i].trim() === "") i++;
    if (i >= lines.length) break;
    if (lines[i].startsWith("### ") || lines[i] === "Featured") break;

    const dm = lines[i].trim().match(DATE_LINE);
    if (!dm) {
      i++;
      continue;
    }
    const dateDisplay = dm[1]!;
    i++;

    while (i < lines.length && lines[i].trim() === "") i++;
    const linkLine = lines[i];
    const lm = linkLine?.match(LINK_LINE);
    if (!lm) {
      i++;
      continue;
    }
    const title = lm[1]!;
    const rawPath = lm[2]!;
    i++;

    while (i < lines.length && lines[i].trim() === "") i++;
    if (lines[i]?.trim() === dateDisplay) {
      i++;
      while (i < lines.length && lines[i].trim() === "") i++;
    }

    const excerptLines: string[] = [];
    while (i < lines.length) {
      const line = lines[i]!;
      const t = line.trim();
      if (READ_MORE.test(t)) {
        i++;
        break;
      }
      if (t.match(DATE_LINE) && excerptLines.length > 0) {
        break;
      }
      if (t === "Featured" || t.startsWith("### ")) break;
      excerptLines.push(line);
      i++;
    }

    const excerpt = excerptLines.join("\n").trim();

    while (i < lines.length && lines[i].trim() === "") i++;
    if (lines[i] && READ_MORE.test(lines[i].trim())) i++;
    while (i < lines.length && lines[i].trim() === "") i++;
    // Only strip duplicate *same* date lines after Read more — not the next item's date.
    while (i < lines.length && lines[i].trim() === dateDisplay) {
      i++;
      while (i < lines.length && lines[i].trim() === "") i++;
    }

    items.push({ title, rawPath, dateDisplay, excerpt });
  }

  return { items, end: i };
}

function transformBody(body: string): string {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  const introBuf: string[] = [];
  while (i < lines.length) {
    if (lines[i] === "Featured" && (i === 0 || lines[i - 1]!.trim() === "")) {
      break;
    }
    if (lines[i].startsWith("### ")) {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      if (lines[j] === "Featured") break;
    }
    introBuf.push(lines[i]!);
    i++;
  }

  out.push(
    '<div className="togstrek-adventure-mdx-intro mx-auto max-w-[var(--tt-layout-max-prose)]">',
    "",
    demoteFirstH1(introBuf.join("\n")),
    "",
    "</div>",
    "",
  );

  while (i < lines.length) {
    while (i < lines.length && lines[i].trim() === "") i++;
    if (i >= lines.length) break;

    if (lines[i].startsWith("### ")) {
      out.push(lines[i]!, "");
      i++;
      continue;
    }

    if (lines[i] === "Featured") {
      i++;
      while (i < lines.length && lines[i].trim() === "") i++;
      const { items, end } = parseItemsFromLines(lines, i);
      i = end;
      out.push('<TogstrekAdventureFeaturedSection title="Featured">', "");
      for (const it of items) {
        out.push(renderPlace(it), "");
      }
      out.push("</TogstrekAdventureFeaturedSection>", "");
      continue;
    }

    i++;
  }

  return out.join("\n").trimEnd() + "\n";
}

function transformFile(raw: string): string {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return raw;
  const fm = cleanFrontmatterBlock(match[1]!);
  const body = match[2]!;
  if (body.includes("TogstrekAdventureFeaturedSection")) return raw;
  if (!body.includes("Featured")) return raw;
  return `---\n${fm}\n---\n\n${transformBody(body)}`;
}

function main(): void {
  const names = fs.readdirSync(ADVENTURES_DIR).filter((n) => n.endsWith(".mdx"));
  let n = 0;
  for (const name of names) {
    if (SKIP_FILES.has(name)) continue;
    const fp = path.join(ADVENTURES_DIR, name);
    const raw = fs.readFileSync(fp, "utf8");
    if (!raw.includes("Featured")) continue;
    if (raw.includes("TogstrekAdventureFeaturedSection")) continue;
    const next = transformFile(raw);
    if (next === raw) continue;
    fs.writeFileSync(fp, next, "utf8");
    console.log("Updated", name);
    n++;
  }
  console.log(`Done (${n} files).`);
}

main();
