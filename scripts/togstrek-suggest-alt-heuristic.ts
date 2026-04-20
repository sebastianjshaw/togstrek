/**
 * Draft `alt` text from image URL path + optional surrounding context (placeholder for
 * real AI: plug an LLM here using file path + first N chars of MDX body).
 *
 * Heuristic: take the last 1–2 meaningful path segments before the file name, split on
 * `-`/`_`, title-case words, join as "Scene in …" style phrase.
 *
 *   npx tsx scripts/togstrek-suggest-alt-heuristic.ts --file content/places/europe/morocco/marrakech.mdx
 *   npx tsx scripts/togstrek-suggest-alt-heuristic.ts --url "https://media.togstrek.com/europe/morocco/marrakech/foo-bar.jpg"
 */

import fs from "node:fs";

function parseArgs(): { file?: string; url?: string } {
  const a = process.argv.slice(2);
  let file: string | undefined;
  let url: string | undefined;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--file" && a[i + 1]) {
      file = a[i + 1]!;
      i++;
    } else if (a[i] === "--url" && a[i + 1]) {
      url = a[i + 1]!;
      i++;
    }
  }
  return { file, url };
}

function titleCaseWords(s: string): string {
  return s
    .split(/[-_/]+/)
    .filter((w) => w.length > 0 && !/^\d+$/.test(w))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function suggestFromUrl(href: string): string {
  try {
    const u = new URL(href);
    const parts = u.pathname.split("/").filter(Boolean);
    const base = parts[parts.length - 1] ?? "";
    const stem = base.replace(/\.(jpe?g|png|webp|gif)$/i, "");
    if (stem.length < 3) return "";
    const withoutHash = stem.replace(/^[a-f0-9]{8,}[-.]?/i, "").trim();
    const words = titleCaseWords(withoutHash);
    if (words.length < 2) {
      const parent = parts.length >= 2 ? parts[parts.length - 2]! : "";
      const fromParent = titleCaseWords(parent);
      if (fromParent.length > 2) return `Photograph from ${fromParent}`;
    }
    return words.length > 2 ? `View of ${words}` : `Photograph: ${words}`;
  } catch {
    return "";
  }
}

function main(): void {
  const { file, url } = parseArgs();
  if (url) {
    console.log(suggestFromUrl(url));
    return;
  }
  if (file && fs.existsSync(file)) {
    const body = fs.readFileSync(file, "utf8");
    const re = /!\[([^\]]*)\]\(\s*([^)\s]+)\s*\)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(body))) {
      const alt = (m[1] ?? "").trim();
      const href = (m[2] ?? "").trim();
      if (alt.length > 0 && !/\.(jpe?g|png)$/i.test(alt)) continue;
      const s = suggestFromUrl(href);
      if (s) console.log(`![${s}](${href})`);
    }
    return;
  }
  console.error("Usage: --url <url> | --file <path.mdx>");
  process.exit(1);
}

main();
