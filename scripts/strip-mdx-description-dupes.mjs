#!/usr/bin/env node
/**
 * Remove frontmatter `description` text duplicated in MDX body (exact paragraph
 * or as a prefix of a longer paragraph). Used where the page template already
 * renders description as the lead.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function walkMdx(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMdx(p, acc);
    else if (ent.name.endsWith(".mdx")) acc.push(p);
  }
  return acc;
}

function norm(s) {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function shouldSkipBlock(trimmed) {
  if (!trimmed) return true;
  if (trimmed.startsWith("![")) return true;
  if (trimmed.startsWith("```")) return true;
  if (/^Jump to/i.test(trimmed) || /^Jump To/i.test(trimmed)) return true;
  if (trimmed.startsWith("#")) return true;
  if (trimmed.length < 25) return true;
  return false;
}

/** Strip leading `desc` from `block` (whitespace-insensitive match at start). */
function stripDescPrefix(desc, block) {
  const d = desc.trim();
  const raw = block;
  const b = block.trim();
  const nd = norm(d);
  const nb = norm(b);
  if (nb === nd) return "";
  if (!nd.length || nd.length < 30 || !nb.startsWith(nd)) return block;

  let i = 0;
  let j = 0;
  const di = d;
  const bj = b;
  while (i < di.length && j < bj.length) {
    const dc = di[i];
    const bc = bj[j];
    if (/\s/.test(dc)) {
      while (i < di.length && /\s/.test(di[i])) i++;
      while (j < bj.length && /\s/.test(bj[j])) j++;
      continue;
    }
    if (dc.toLowerCase() !== bc.toLowerCase()) return block;
    i++;
    j++;
  }
  while (j < bj.length && /\s/.test(bj[j])) j++;
  const rest = bj.slice(j).trim();
  if (!rest) return "";
  const leadWs = raw.match(/^\s*/)?.[0] ?? "";
  return leadWs + rest;
}

function processBody(desc, content) {
  if (typeof desc !== "string" || !desc.trim()) return { content, changed: false };
  const parts = content.split(/(\n\n+)/);
  let changed = false;
  const out = [];
  for (let k = 0; k < parts.length; k++) {
    const sep = parts[k];
    if (k % 2 === 1) {
      out.push(sep);
      continue;
    }
    const block = sep;
    const trimmed = block.trim();
    if (shouldSkipBlock(trimmed)) {
      out.push(block);
      continue;
    }
    const next = stripDescPrefix(desc, block);
    if (next !== block) {
      changed = true;
      if (next.trim() === "") {
        // Drop this block; collapse double separator with neighbors later
        out.push("");
      } else {
        out.push(next);
      }
    } else {
      out.push(block);
    }
  }
  let merged = out.join("");
  merged = merged.replace(/\n{3,}/g, "\n\n");
  merged = merged.replace(/^\n+/, "");
  if (merged !== content) changed = true;
  return { content: merged, changed };
}

const roots = process.argv.slice(2).length
  ? process.argv.slice(2).map((r) => path.join(ROOT, r))
  : [path.join(ROOT, "content/hiking"), path.join(ROOT, "content/photography")];

let total = 0;
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const file of walkMdx(root)) {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content: body } = matter(raw);
    const { content: nextBody, changed } = processBody(data.description, body);
    if (!changed) continue;
    const out = matter.stringify(nextBody, data);
    fs.writeFileSync(file, out);
    total++;
    console.log(path.relative(ROOT, file));
  }
}
console.error(`Updated ${total} files.`);
