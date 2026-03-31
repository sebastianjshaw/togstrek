/**
 * Set markdown image alt text from EXIF for `https://media.togstrek.com/...` when:
 * - empty alt: `![](url)` → `![caption](url)`, or
 * - filename-like alt (e.g. ends with `.jpg`): `![IMG_001.jpg](url)` → `![caption](url)`.
 *
 * Skips real captions (non-empty alt that does not look like a filename).
 * If EXIF cannot produce a camera-style caption, the line is left unchanged.
 *
 * Usage:
 *   npx tsx scripts/togstrek-fill-mdx-empty-image-exif.ts --dry-run
 *   npx tsx scripts/togstrek-fill-mdx-empty-image-exif.ts --concurrency 4 --delay-ms 120
 */

import fs from "node:fs";
import path from "node:path";

import {
  escapeMarkdownImageAlt,
  fetchExifCaptionForMediaUrl,
  TOGSTREK_MEDIA_HOST,
} from "./lib/togstrek-exif-from-url";
import { shouldReplaceAltWithExif } from "./lib/togstrek-mdx-image-alt";

const PLACES_ROOT = path.join(process.cwd(), "content", "places");

/** `![alt](https://media.togstrek.com/...)` — group 1 alt, group 2 URL. */
const MEDIA_IMG = new RegExp(
  String.raw`!\[([^\]]*)\]\(\s*(https://${TOGSTREK_MEDIA_HOST.replace(/\./g, String.raw`\.`)}[^)\s]+)\s*\)`,
  "g",
);

function parseArgs(): {
  dryRun: boolean;
  concurrency: number;
  delayMs: number;
  limitFiles: number;
} {
  const a = process.argv.slice(2);
  let dryRun = false;
  let concurrency = 4;
  let delayMs = 120;
  let limitFiles = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--dry-run") dryRun = true;
    else if (a[i] === "--concurrency" && a[i + 1]) {
      concurrency = Math.max(1, Math.min(16, Number.parseInt(a[i + 1]!, 10) || 4));
      i++;
    } else if (a[i] === "--delay-ms" && a[i + 1]) {
      delayMs = Math.max(0, Number.parseInt(a[i + 1]!, 10) || 0);
      i++;
    } else if (a[i] === "--limit-files" && a[i + 1]) {
      limitFiles = Math.max(0, Number.parseInt(a[i + 1]!, 10) || 0);
      i++;
    }
  }
  return { dryRun, concurrency, delayMs, limitFiles };
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

function findReplaceableMediaImages(
  text: string,
): Array<{ start: number; end: number; url: string; full: string }> {
  const hits: Array<{ start: number; end: number; url: string; full: string }> = [];
  let m: RegExpExecArray | null;
  MEDIA_IMG.lastIndex = 0;
  while ((m = MEDIA_IMG.exec(text))) {
    const altRaw = m[1] ?? "";
    if (!shouldReplaceAltWithExif(altRaw)) continue;
    hits.push({
      start: m.index,
      end: m.index + m[0]!.length,
      url: m[2]!.trim(),
      full: m[0]!,
    });
  }
  return hits;
}

function applyReplacementsFromEnd(
  text: string,
  replacements: Array<{ start: number; end: number; replacement: string }>,
): string {
  const sorted = [...replacements].sort((a, b) => b.start - a.start);
  let out = text;
  for (const r of sorted) {
    out = out.slice(0, r.start) + r.replacement + out.slice(r.end);
  }
  return out;
}

async function main(): Promise<void> {
  const { dryRun, concurrency, delayMs, limitFiles } = parseArgs();

  const allFiles: string[] = [];
  if (!fs.existsSync(PLACES_ROOT)) {
    console.error("Missing", PLACES_ROOT);
    process.exit(1);
  }
  walkMdxFiles(PLACES_ROOT, allFiles);
  allFiles.sort();
  const files = limitFiles > 0 ? allFiles.slice(0, limitFiles) : allFiles;

  const urlSet = new Set<string>();
  for (const fp of files) {
    const text = fs.readFileSync(fp, "utf8");
    for (const h of findReplaceableMediaImages(text)) urlSet.add(h.url);
  }
  const uniqueUrls = [...urlSet].sort();

  console.log(
    `EXIF fill MDX: ${files.length} files` +
      (limitFiles > 0 ? ` (of ${allFiles.length})` : "") +
      ` · ${uniqueUrls.length} unique URLs (empty alt or filename-like alt)` +
      ` · concurrency ${concurrency} · delay ${delayMs}ms` +
      (dryRun ? " · DRY RUN" : ""),
  );

  const captionByUrl = new Map<string, string | null>();

  async function resolveOne(url: string): Promise<void> {
    const cap = await fetchExifCaptionForMediaUrl(url);
    captionByUrl.set(url, cap);
  }

  const queue = [...uniqueUrls];
  let next = 0;
  let done = 0;
  const workers: Promise<void>[] = [];
  for (let w = 0; w < concurrency; w++) {
    workers.push(
      (async () => {
        while (true) {
          const i = next++;
          if (i >= queue.length) break;
          const url = queue[i]!;
          await resolveOne(url);
          done++;
          if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
          if (done % 50 === 0 || done === queue.length) {
            process.stdout.write(`  … resolved ${done}/${queue.length}\r`);
          }
        }
      })(),
    );
  }
  await Promise.all(workers);
  process.stdout.write("\n");

  let filesChanged = 0;
  let slotsFilled = 0;
  let slotsSkippedNoCaption = 0;

  for (const fp of files) {
    const text = fs.readFileSync(fp, "utf8");
    const hits = findReplaceableMediaImages(text);
    const replacements: Array<{ start: number; end: number; replacement: string }> = [];

    for (const h of hits) {
      const cap = captionByUrl.get(h.url);
      if (cap === undefined || cap === null || cap === "") {
        slotsSkippedNoCaption++;
        continue;
      }
      const esc = escapeMarkdownImageAlt(cap);
      replacements.push({
        start: h.start,
        end: h.end,
        replacement: `![${esc}](${h.url})`,
      });
      slotsFilled++;
    }

    if (replacements.length === 0) continue;

    const nextText = applyReplacementsFromEnd(text, replacements);
    if (nextText === text) continue;

    filesChanged++;
    if (dryRun) {
      console.log(`[dry-run] would write ${fp} (${replacements.length} image(s))`);
    } else {
      fs.writeFileSync(fp, nextText, "utf8");
      console.log(`wrote ${fp} (${replacements.length} image(s))`);
    }
  }

  console.log("\n--- Summary ---");
  console.log(
    JSON.stringify(
      {
        filesChanged: dryRun ? 0 : filesChanged,
        dryRunFilesThatWouldChange: dryRun ? filesChanged : 0,
        slotsFilled,
        slotsSkippedNoExifOrNoCaption: slotsSkippedNoCaption,
        uniqueUrlsCandidates: uniqueUrls.length,
        note:
          "Targets empty ![](…) or ![*.jpg|*.png|…](media…) alts. slotsFilled is per MDX line.",
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
