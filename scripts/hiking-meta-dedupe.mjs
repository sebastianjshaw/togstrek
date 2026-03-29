#!/usr/bin/env node
/**
 * One-off / maintenance: align hiking MDX so frontmatter description is a short
 * meta line and does not repeat the opening body paragraph.
 * Run: node scripts/hiking-meta-dedupe.mjs --apply
 *      node scripts/hiking-meta-dedupe.mjs          (scan only)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "content/hiking");

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  return { fm: m[1], body: m[2], eol: raw.includes("\r\n") ? "\r\n" : "\n" };
}

function extractDescription(fm) {
  const lines = fm.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("description:")) continue;
    let rest = line.slice("description:".length).trim();
    let j = i + 1;
    if (rest === "" || rest === "|" || rest === ">") {
      const parts = [];
      while (j < lines.length && /^\s{2,}/.test(lines[j])) {
        parts.push(lines[j].replace(/^\s+/, ""));
        j++;
      }
      return parts.join(rest === "|" ? "\n" : " ").trim();
    }
    let value = rest;
    while (j < lines.length && /^\s{2,}/.test(lines[j])) {
      value += " " + lines[j].trim();
      j++;
    }
    return value.replace(/^["']|["']$/g, "").trim();
  }
  return "";
}

function setDescription(fm, newDesc) {
  const lines = fm.split(/\r?\n/);
  const out = [];
  let i = 0;
  const quoted = JSON.stringify(newDesc);
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("description:")) {
      out.push(`description: ${quoted}`);
      i++;
      while (i < lines.length && /^\s{2,}/.test(lines[i])) i++;
      continue;
    }
    out.push(line);
    i++;
  }
  return out.join("\n");
}

function norm(s) {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function routeFromEtappTitle(title) {
  const t = title.replace(/^["']|["']$/g, "");
  const m = t.match(/Etapp\s+\d+\s+-\s*(.+)/i);
  return m ? m[1].trim() : t;
}

function stripKungsledenIntro(body) {
  const idx = body.indexOf("## Trail Information");
  if (idx <= 0) return body;
  const prefix = body.slice(0, idx).trim();
  if (!prefix) return body;
  return "\n\n" + body.slice(idx);
}

function stripBohusTrailBlurb(body) {
  const marker = "## Trail Information\n\n";
  const idx = body.indexOf(marker);
  if (idx === -1) return body;
  const start = idx + marker.length;
  const rest = body.slice(start);
  const dm = rest.match(/^\*\*Distance\*\*/m);
  if (!dm) return body;
  const distIdx = rest.indexOf("**Distance**");
  const between = rest.slice(0, distIdx).trim();
  if (!between || between.startsWith("**")) return body;
  return body.slice(0, start) + rest.slice(distIdx);
}

function processKungsleden(fp, apply) {
  const raw = fs.readFileSync(fp, "utf8");
  const p = parseFrontmatter(raw);
  if (!p) return false;
  const titleLine = p.fm.match(/^title:\s*(.+)$/m);
  if (!titleLine) return false;
  let title = titleLine[1].trim();
  if (
    (title.startsWith('"') && title.endsWith('"')) ||
    (title.startsWith("'") && title.endsWith("'"))
  ) {
    title = title.slice(1, -1);
  }
  const route = routeFromEtappTitle(title);
  const newDesc = `Kungsleden: ${route} — stage notes, terrain, and photos.`;
  const nextBody = stripKungsledenIntro(p.body);
  const nextFm = setDescription(p.fm, newDesc);
  const next = `---${p.eol}${nextFm}${p.eol}---${p.eol}${nextBody}`;
  if (next === raw) return false;
  if (apply) fs.writeFileSync(fp, next, "utf8");
  return true;
}

function processBohusEtapp(fp, apply) {
  const raw = fs.readFileSync(fp, "utf8");
  const p = parseFrontmatter(raw);
  if (!p) return false;
  const titleLine = p.fm.match(/^title:\s*(.+)$/m);
  if (!titleLine) return false;
  let title = titleLine[1].trim();
  if (
    (title.startsWith('"') && title.endsWith('"')) ||
    (title.startsWith("'") && title.endsWith("'"))
  ) {
    title = title.slice(1, -1);
  }
  const route = routeFromEtappTitle(title);
  const newDesc = `Bohusleden: ${route} — stage notes and photos.`;
  const nextBody = stripBohusTrailBlurb(p.body);
  const nextFm = setDescription(p.fm, newDesc);
  const next = `---${p.eol}${nextFm}${p.eol}---${p.eol}${nextBody}`;
  if (next === raw) return false;
  if (apply) fs.writeFileSync(fp, next, "utf8");
  return true;
}

/** First prose paragraph (skips headings, hr, bold stat lines, leading images). */
function firstBodyParagraph(body) {
  const lines = body.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    while (i < lines.length && lines[i].trim() === "") i++;
    if (i >= lines.length) return "";
    const t = lines[i].trim();
    if (t.startsWith("#")) {
      i++;
      continue;
    }
    if (t === "* * *" || t.startsWith("---")) {
      i++;
      continue;
    }
    if (t.startsWith("![")) {
      i++;
      continue;
    }
    if (t.startsWith("**") && t.endsWith("**")) {
      i++;
      continue;
    }
    break;
  }
  if (i >= lines.length) return "";
  const buf = [];
  while (i < lines.length) {
    const L = lines[i];
    const tr = L.trim();
    if (tr === "" && buf.length) break;
    if (tr.startsWith("#")) break;
    if (tr === "* * *") break;
    buf.push(L);
    i++;
  }
  return buf.join("\n").trim();
}

function scanAll() {
  const issues = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(fp);
      else if (ent.name.endsWith(".mdx")) {
        const raw = fs.readFileSync(fp, "utf8");
        const p = parseFrontmatter(raw);
        if (!p) continue;
        const d = extractDescription(p.fm);
        const para = firstBodyParagraph(p.body);
        if (!d || !para) continue;
        const nd = norm(d);
        const np = norm(para);
        if (nd === np) issues.push({ fp, kind: "exact" });
        else if (np.startsWith(nd) && nd.length > 40) issues.push({ fp, kind: "prefix" });
        else if (nd.startsWith(np) && np.length > 40) issues.push({ fp, kind: "rev-prefix" });
      }
    }
  }
  walk(ROOT);
  return issues;
}

const apply = process.argv.includes("--apply");

let n = 0;
for (const sub of ["kungsleden", "bohusleden"]) {
  const dir = path.join(ROOT, sub);
  if (!fs.existsSync(dir)) continue;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!ent.name.startsWith("etapp-") || !ent.name.endsWith(".mdx")) continue;
    const fp = path.join(dir, ent.name);
    const fn =
      sub === "kungsleden" ? processKungsleden : processBohusEtapp;
    if (fn(fp, apply)) {
      n++;
      if (apply) console.log("updated", path.relative(ROOT, fp));
    }
  }
}

console.log(apply ? `Applied ${n} etapp file(s).` : `Dry-run would touch ${n} etapp file(s). (pass --apply)`);

const issues = scanAll();
if (issues.length) {
  console.log("\nRemaining description vs first-paragraph issues:");
  for (const { fp, kind } of issues) {
    console.log(kind, path.relative(ROOT, fp));
  }
} else {
  console.log("\nNo exact/prefix dupes in scan.");
}
