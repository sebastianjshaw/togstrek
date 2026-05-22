/**
 * HEAD-check every media CDN URL in content MDX (catches 404s after migration).
 *
 *   npm run media:audit-urls
 *   npx tsx scripts/togstrek-audit-mdx-media-urls.ts --content content/hiking
 *   npx tsx scripts/togstrek-audit-mdx-media-urls.ts --list-only
 */

import fs from "node:fs";
import path from "node:path";

import { getTogstrekMediaBaseUrl } from "@/config/togstrek-media";
import {
  extractTogstrekMdxMediaUrls,
  isTogstrekMdxMediaUrlWellFormed,
} from "@/lib/togstrek-mdx-media-urls";

const ROOT = process.cwd();
const DEFAULT_CONCURRENCY = 8;
const FETCH_TIMEOUT_MS = 20_000;

type UrlRef = { url: string; files: string[] };

function parseArgs(): {
  contentRoots: string[];
  listOnly: boolean;
  concurrency: number;
} {
  const a = process.argv.slice(2);
  const roots: string[] = [];
  let listOnly = false;
  let concurrency = DEFAULT_CONCURRENCY;

  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--content" && a[i + 1]) {
      roots.push(path.resolve(ROOT, a[i + 1]!));
      i++;
    } else if (a[i] === "--list-only") {
      listOnly = true;
    } else if (a[i] === "--concurrency" && a[i + 1]) {
      concurrency = Math.max(1, Number.parseInt(a[i + 1]!, 10) || DEFAULT_CONCURRENCY);
      i++;
    }
  }

  if (roots.length === 0) {
    for (const rel of [
      "content/places",
      "content/adventures",
      "content/hiking",
      "content/photography",
      "content/other-work",
      "content/blog",
    ]) {
      const p = path.join(ROOT, rel);
      if (fs.existsSync(p)) roots.push(p);
    }
  }

  return { contentRoots: roots, listOnly, concurrency };
}

function walkMdxFiles(dir: string, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMdxFiles(full, out);
    else if (ent.isFile() && ent.name.endsWith(".mdx")) out.push(full);
  }
}

function indexUrlsByFile(files: string[]): Map<string, UrlRef> {
  const byUrl = new Map<string, UrlRef>();

  for (const fp of files) {
    const text = fs.readFileSync(fp, "utf8");
    const rel = path.relative(ROOT, fp);
    for (const url of extractTogstrekMdxMediaUrls(text)) {
      if (!isTogstrekMdxMediaUrlWellFormed(url)) continue;
      const existing = byUrl.get(url);
      if (existing) {
        if (!existing.files.includes(rel)) existing.files.push(rel);
      } else {
        byUrl.set(url, { url, files: [rel] });
      }
    }
  }

  return byUrl;
}

async function headCheckUrl(url: string): Promise<{
  ok: boolean;
  status: number;
  error?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "togstrek-media-url-audit/1.0" },
    });
    if (res.ok) return { ok: true, status: res.status };
    if (res.status === 405 || res.status === 501) {
      const getRes = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: { Range: "bytes=0-0", "User-Agent": "togstrek-media-url-audit/1.0" },
      });
      return { ok: getRes.ok, status: getRes.status };
    }
    return { ok: false, status: res.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, error: message };
  } finally {
    clearTimeout(timer);
  }
}

async function runPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function runWorker(): Promise<void> {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]!);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()),
  );
  return results;
}

async function main(): Promise<void> {
  const { contentRoots, listOnly, concurrency } = parseArgs();
  const files: string[] = [];
  for (const r of contentRoots) walkMdxFiles(r, files);
  files.sort();

  const byUrl = indexUrlsByFile(files);
  const urls = [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url));

  console.log("MDX media URL audit");
  console.log("CDN base:", getTogstrekMediaBaseUrl());
  console.log("Files scanned:", files.length);
  console.log("Unique URLs:", urls.length);

  if (listOnly) {
    for (const { url, files: refs } of urls) {
      console.log(url);
      for (const f of refs) console.log(`  ${f}`);
    }
    return;
  }

  const checks = await runPool(urls, concurrency, async (ref) => {
    const result = await headCheckUrl(ref.url);
    return { ref, ...result };
  });

  const failed = checks.filter((c) => !c.ok);

  for (const c of checks) {
    if (c.ok) continue;
    const statusLabel = c.status ? String(c.status) : (c.error ?? "error");
    console.log(`FAIL [${statusLabel}] ${c.ref.url}`);
    for (const f of c.ref.files) console.log(`  ${f}`);
  }

  console.log("OK:", checks.length - failed.length);
  console.log("Failed:", failed.length);

  if (failed.length > 0) process.exit(1);
}

void main();
