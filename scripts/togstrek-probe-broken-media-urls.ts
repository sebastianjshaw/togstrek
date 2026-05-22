/**
 * Probe URLs listed in migration/media-url-still-broken.jsonl with extended variants.
 * Writes migration/media-url-resolved.jsonl when a working CDN key is found.
 *
 *   npx tsx scripts/togstrek-probe-broken-media-urls.ts
 *   npx tsx scripts/togstrek-probe-broken-media-urls.ts --apply
 */

import fs from "node:fs";
import path from "node:path";

import { buildTogstrekMediaUrlVariants } from "@/lib/togstrek-mdx-media-url-variants";

const ROOT = process.cwd();
const BROKEN_PATH = path.join(ROOT, "migration/media-url-still-broken.jsonl");
const RESOLVED_PATH = path.join(ROOT, "migration/media-url-resolved.jsonl");

type BrokenRow = { url: string; files: string[] };

async function urlExists(url: string): Promise<boolean> {
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (res.ok) return true;
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        redirect: "follow",
      });
      return res.ok;
    }
    return false;
  } catch {
    return false;
  }
}

function parseBroken(): BrokenRow[] {
  if (!fs.existsSync(BROKEN_PATH)) return [];
  return fs
    .readFileSync(BROKEN_PATH, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as BrokenRow);
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const rows = parseBroken();
  if (rows.length === 0) {
    console.log("No broken URLs in", path.relative(ROOT, BROKEN_PATH));
    return;
  }

  const resolved: { from: string; to: string; files: string[] }[] = [];

  for (const row of rows) {
    let found: string | null = null;
    for (const variant of buildTogstrekMediaUrlVariants(row.url)) {
      if (await urlExists(variant)) {
        found = variant;
        break;
      }
    }
    if (found && found !== row.url) {
      resolved.push({ from: row.url, to: found, files: row.files });
      console.log(`RESOLVE ${row.url}`);
      console.log(`   -> ${found}`);
    }
  }

  fs.writeFileSync(
    RESOLVED_PATH,
    resolved.map((r) => JSON.stringify(r)).join("\n") + (resolved.length ? "\n" : ""),
    "utf8",
  );
  console.log("Resolvable:", resolved.length, "/", rows.length);
  console.log("Written:", path.relative(ROOT, RESOLVED_PATH));

  if (!apply || resolved.length === 0) return;

  let replaceCount = 0;
  for (const { from, to, files } of resolved) {
    for (const rel of files) {
      const fp = path.join(ROOT, rel);
      const text = fs.readFileSync(fp, "utf8");
      if (!text.includes(from)) continue;
      fs.writeFileSync(fp, text.split(from).join(to), "utf8");
      replaceCount++;
    }
  }
  console.log("Applied replacements:", replaceCount);
}

void main();
