/**
 * Fix MDX media URLs that 404 due to encoding/formatting (parentheses, apostrophes, Unicode).
 * Re-checks each literal URL in content and swaps in the first working variant.
 *
 *   npm run media:fix-urls -- --dry-run
 *   npm run media:fix-urls
 */

import fs from "node:fs";
import path from "node:path";

import { buildTogstrekMediaUrlVariants } from "@/lib/togstrek-mdx-media-url-variants";
import { extractTogstrekMdxMediaUrls } from "@/lib/togstrek-mdx-media-urls";

const ROOT = process.cwd();
const FETCH_TIMEOUT_MS = 20_000;

type Options = {
  contentRoots: string[];
  dryRun: boolean;
  concurrency: number;
};

function parseArgs(): Options {
  const a = process.argv.slice(2);
  const roots: string[] = [];
  let dryRun = false;
  let concurrency = 8;

  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--content" && a[i + 1]) {
      roots.push(path.resolve(ROOT, a[i + 1]!));
      i++;
    } else if (a[i] === "--dry-run") dryRun = true;
    else if (a[i] === "--concurrency" && a[i + 1]) {
      concurrency = Math.max(1, Number.parseInt(a[i + 1]!, 10) || 8);
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

  return { contentRoots: roots, dryRun, concurrency };
}

function walkMdxFiles(dir: string, out: string[] = []): string[] {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMdxFiles(full, out);
    else if (ent.isFile() && ent.name.endsWith(".mdx")) out.push(full);
  }
  return out;
}

async function urlExists(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    let res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "togstrek-fix-mdx-media-urls/1.0" },
    });
    if (res.ok) return true;
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: {
          Range: "bytes=0-0",
          "User-Agent": "togstrek-fix-mdx-media-urls/1.0",
        },
      });
      return res.ok;
    }
    return false;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveWorkingUrl(broken: string): Promise<string | null> {
  if (await urlExists(broken)) return broken;
  for (const variant of buildTogstrekMediaUrlVariants(broken)) {
    if (variant === broken) continue;
    if (await urlExists(variant)) return variant;
  }
  return null;
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
  const { contentRoots, dryRun, concurrency } = parseArgs();
  const files = contentRoots.flatMap((r) => walkMdxFiles(r)).sort();

  const urlToFiles = new Map<string, Set<string>>();
  for (const fp of files) {
    const rel = path.relative(ROOT, fp);
    for (const url of extractTogstrekMdxMediaUrls(fs.readFileSync(fp, "utf8"))) {
      const set = urlToFiles.get(url) ?? new Set();
      set.add(rel);
      urlToFiles.set(url, set);
    }
  }

  const uniqueUrls = [...urlToFiles.keys()].sort();
  console.log("MDX media URL fix");
  console.log("Files:", files.length);
  console.log("Unique URLs:", uniqueUrls.length);
  console.log(dryRun ? "Mode: dry-run" : "Mode: write");

  const resolutions = await runPool(uniqueUrls, concurrency, async (url) => {
    const working = await resolveWorkingUrl(url);
    return { url, working };
  });

  const replacements = resolutions.filter(
    (r): r is { url: string; working: string } =>
      r.working != null && r.working !== r.url,
  );
  const stillBroken = resolutions.filter((r) => r.working == null);

  let filesTouched = 0;
  let replaceCount = 0;

  if (!dryRun && replacements.length > 0) {
    const byFile = new Map<string, Array<{ from: string; to: string }>>();
    for (const { url, working } of replacements) {
      for (const rel of urlToFiles.get(url) ?? []) {
        const list = byFile.get(rel) ?? [];
        list.push({ from: url, to: working });
        byFile.set(rel, list);
      }
    }

    for (const [rel, swaps] of byFile) {
      const fp = path.join(ROOT, rel);
      let text = fs.readFileSync(fp, "utf8");
      const original = text;
      for (const { from, to } of swaps) {
        if (!text.includes(from)) continue;
        text = text.split(from).join(to);
        replaceCount++;
      }
      if (text !== original) {
        fs.writeFileSync(fp, text, "utf8");
        filesTouched++;
      }
    }
  }

  for (const { url, working } of replacements) {
    console.log(`FIX ${url}`);
    console.log(` -> ${working}`);
    for (const f of urlToFiles.get(url) ?? []) console.log(`    ${f}`);
  }

  console.log("Already OK / unchanged:", uniqueUrls.length - replacements.length - stillBroken.length);
  console.log("Fixed URL mappings:", replacements.length);
  console.log("Replacements in files:", dryRun ? "(dry-run)" : replaceCount);
  console.log("Files touched:", dryRun ? "(dry-run)" : filesTouched);
  console.log("Still broken:", stillBroken.length);

  const outDir = path.join(ROOT, "migration");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "media-url-still-broken.jsonl");
  fs.writeFileSync(
    outPath,
    stillBroken
      .map((r) =>
        JSON.stringify({
          url: r.url,
          files: [...(urlToFiles.get(r.url) ?? [])],
        }),
      )
      .join("\n") + (stillBroken.length ? "\n" : ""),
    "utf8",
  );
  console.log("Written:", path.relative(ROOT, outPath));

  if (stillBroken.length > 0) process.exit(1);
}

void main();
