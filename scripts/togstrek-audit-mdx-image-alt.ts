/**
 * Scan MDX for `![alt](url)` images and classify alts (see `togstrek-image-alt-caption-policy`).
 * Writes `migration/image-alt-manual-review.jsonl` for empty / technical alts that need
 * descriptive text or AI-assisted rewrites (per site policy).
 *
 *   npx tsx scripts/togstrek-audit-mdx-image-alt.ts
 *   npx tsx scripts/togstrek-audit-mdx-image-alt.ts --content content/places
 */

import fs from "node:fs";
import path from "node:path";

import {
  classifyMarkdownImageAlt,
  type TogstrekImageAltKind,
} from "@/lib/togstrek-image-alt-caption-policy";

const ROOT = process.cwd();

const MDX_IMG = /!\[([^\]]*)\]\(\s*([^)\s]+)\s*\)/g;

function parseArgs(): { contentRoots: string[] } {
  const a = process.argv.slice(2);
  const roots: string[] = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--content" && a[i + 1]) {
      roots.push(path.resolve(ROOT, a[i + 1]!));
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
  return { contentRoots: roots };
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

type ReviewRow = {
  file: string;
  altRaw: string;
  url: string;
  kind: TogstrekImageAltKind;
  needsManualReview: boolean;
  note: string;
};

function main(): void {
  const { contentRoots } = parseArgs();
  const files: string[] = [];
  for (const r of contentRoots) walkMdxFiles(r, files);
  files.sort();

  const counts: Record<TogstrekImageAltKind | "total", number> = {
    descriptive: 0,
    exif: 0,
    technical_filename: 0,
    empty: 0,
    total: 0,
  };

  const review: ReviewRow[] = [];

  for (const fp of files) {
    const text = fs.readFileSync(fp, "utf8");
    let m: RegExpExecArray | null;
    MDX_IMG.lastIndex = 0;
    while ((m = MDX_IMG.exec(text))) {
      const altRaw = m[1] ?? "";
      const url = m[2] ?? "";
      const kind = classifyMarkdownImageAlt(altRaw);
      counts[kind]++;
      counts.total++;

      const needsManualReview = kind === "empty" || kind === "technical_filename";
      if (needsManualReview) {
        review.push({
          file: path.relative(ROOT, fp),
          altRaw,
          url,
          kind,
          needsManualReview: true,
          note:
            kind === "empty"
              ? "Add descriptive alt (policy: prefer prose; EXIF-only in caption path is OK after exif:fill-mdx)"
              : "Replace filename alt with descriptive text; optional: run media:suggest-alt-heuristic for a draft",
        });
      }
    }
  }

  const outDir = path.join(ROOT, "migration");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "image-alt-manual-review.jsonl");
  fs.writeFileSync(
    outPath,
    review.map((r) => JSON.stringify(r)).join("\n") + (review.length ? "\n" : ""),
    "utf8",
  );

  console.log("MDX image alt audit");
  console.log("Files scanned:", files.length);
  console.log("Images total:", counts.total);
  console.log("  descriptive:", counts.descriptive);
  console.log("  exif:", counts.exif);
  console.log("  technical_filename:", counts.technical_filename);
  console.log("  empty:", counts.empty);
  console.log("Needs manual / AI follow-up:", review.length);
  console.log("Written:", path.relative(ROOT, outPath));
}

main();
