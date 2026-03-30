/**
 * next-mdx-remote RSC strips JSX attrs like `title={"x"}` (see remove-javascript-expressions).
 * Rewrite `name={"..."}` lines to `name="..."` with escaped quotes so cards render with links/text.
 *
 *   npm run fix:adventure-mdx-attrs
 */

import * as fs from "node:fs";
import * as path from "node:path";

const ADVENTURES_DIR = path.join(process.cwd(), "content", "adventures");

/** `href|title=...` etc. where value is a JSON string inside `{...}`. */
const ATTR_JSON_LINE =
  /^(\s*)(href|title|date|dateTime|excerpt|imageSrc|imageAlt)=\{("(?:[^"\\]|\\.)*")\}\s*$/;

function escapeForDoubleQuotedJsxAttr(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** `excerpt={`...`}` (no interpolation) → literal excerpt="…". */
const ATTR_TEMPLATE_LINE =
  /^(\s*)(href|title|date|dateTime|excerpt|imageSrc|imageAlt)=\{`([^`]*)`\}\s*$/;

function fixBody(raw: string): string {
  const lines = raw.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    let m = line.match(ATTR_JSON_LINE);
    if (m) {
      const [, indent, name, jsonStr] = m;
      try {
        const val = JSON.parse(jsonStr) as string;
        out.push(`${indent}${name}="${escapeForDoubleQuotedJsxAttr(val)}"`);
        continue;
      } catch {
        /* keep line */
      }
    }
    m = line.match(ATTR_TEMPLATE_LINE);
    if (m) {
      const [, indent, name, inner] = m;
      out.push(`${indent}${name}="${escapeForDoubleQuotedJsxAttr(inner)}"`);
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

function main(): void {
  const names = fs.readdirSync(ADVENTURES_DIR).filter((n) => n.endsWith(".mdx"));
  let n = 0;
  for (const name of names) {
    const fp = path.join(ADVENTURES_DIR, name);
    const raw = fs.readFileSync(fp, "utf8");
    const next = fixBody(raw);
    if (next !== raw) {
      fs.writeFileSync(fp, next, "utf8");
      console.log("Updated", name);
      n++;
    }
  }
  console.log(`Done (${n} files).`);
}

main();
