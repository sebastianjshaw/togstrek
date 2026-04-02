/**
 * Fill `imageSrc` / `imageAlt` on `<TogstrekAdventureFeaturedPlace>` from the linked
 * place or hiking post’s `heroImage` frontmatter (most adventures only had text tiles).
 *
 *   npx tsx scripts/togstrek-fill-adventure-featured-images.ts --dry-run
 *   npx tsx scripts/togstrek-fill-adventure-featured-images.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

import matter from "gray-matter";

const REPO_ROOT = process.cwd();
const ADVENTURES_DIR = path.join(REPO_ROOT, "content", "adventures");
const PLACES_DIR = path.join(REPO_ROOT, "content", "places");

const BLOCK_RE =
  /  <TogstrekAdventureFeaturedPlace\n([\s\S]*?)\n  \/>/g;

function parseArgs(): { dryRun: boolean } {
  return { dryRun: process.argv.includes("--dry-run") };
}

function safeJsxAttr(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 320);
}

function existsMdx(abs: string): string | null {
  return fs.existsSync(abs) ? abs : null;
}

/** Extra place paths for legacy / renamed adventure hrefs. */
function extraPlaceCandidates(p: string): string[] {
  const out: string[] = [];
  const add = (rel: string) => out.push(path.join(PLACES_DIR, `${rel}.mdx`));

  if (p === "europe/reykjavik") add("europe/iceland/reykjavik");

  if (p.startsWith("antarctica/") && !p.startsWith("antarctica/antarctic/")) {
    add(`antarctica/antarctic/${p.slice("antarctica/".length)}`);
  }

  if (p.startsWith("north-america/usa/")) {
    add(
      p.replace(
        /^north-america\/usa\//,
        "north-america/united-states-of-america/",
      ),
    );
  }

  if (p.startsWith("asia/turkey/")) {
    add(p.replace(/^asia\/turkey\//, "europe/turkiye/"));
  }

  return out;
}

function resolveLinkedMdx(href: string): string | null {
  const p = href.replace(/^\//, "").replace(/\/$/, "");
  if (!p) return null;

  if (p.startsWith("hiking/")) {
    let rest = p.slice("hiking/".length);
    rest = rest.replace(/^kungleden\//, "kungsleden/");
    const f = path.join(REPO_ROOT, "content", "hiking", `${rest}.mdx`);
    const hit = existsMdx(f);
    if (hit) return hit;
  }

  const tryList = [
    path.join(PLACES_DIR, `${p}.mdx`),
    ...extraPlaceCandidates(p),
  ];

  if (p.startsWith("europe/") && !p.startsWith("europe/sweden/")) {
    tryList.push(
      path.join(PLACES_DIR, "europe", "sweden", `${p.slice("europe/".length)}.mdx`),
    );
  }

  for (const f of tryList) {
    const hit = existsMdx(f);
    if (hit) return hit;
  }

  return null;
}

function readHero(mdxPath: string): { src: string; alt: string } | null {
  const raw = fs.readFileSync(mdxPath, "utf8");
  const { data } = matter(raw);
  const hi = data?.heroImage as { src?: string; alt?: string } | undefined;
  const src = typeof hi?.src === "string" ? hi.src.trim() : "";
  if (!src) return null;
  const alt =
    typeof hi?.alt === "string" && hi.alt.trim()
      ? hi.alt.trim()
      : String(data?.title ?? "Place photo");
  return { src, alt: alt };
}

function processAdventureFile(abs: string, dryRun: boolean): {
  changed: boolean;
  filled: number;
  skipped: number;
  noHero: number;
  noMdx: number;
} {
  let text = fs.readFileSync(abs, "utf8");
  const orig = text;
  let filled = 0;
  let skipped = 0;
  let noHero = 0;
  let noMdx = 0;

  text = text.replace(BLOCK_RE, (full, inner: string) => {
    if (/\bimageSrc=/.test(inner)) {
      skipped++;
      return full;
    }
    const hrefM = inner.match(/\bhref="([^"]+)"/);
    if (!hrefM) {
      skipped++;
      return full;
    }
    const mdxPath = resolveLinkedMdx(hrefM[1]!);
    if (!mdxPath) {
      console.warn(
        `[no mdx] ${path.relative(REPO_ROOT, abs)} href=${hrefM[1]}`,
      );
      noMdx++;
      return full;
    }
    const hero = readHero(mdxPath);
    if (!hero) {
      console.warn(
        `[no heroImage] ${path.relative(REPO_ROOT, abs)} → ${path.relative(REPO_ROOT, mdxPath)}`,
      );
      noHero++;
      return full;
    }
    const lines = `    imageSrc="${safeJsxAttr(hero.src)}"\n    imageAlt="${safeJsxAttr(hero.alt)}"\n`;
    let nextInner: string;
    if (/\bdateTime=/.test(inner)) {
      nextInner = inner.replace(/(dateTime="[^"]*"\n)/, `$1${lines}`);
    } else if (/\bdate=/.test(inner)) {
      nextInner = inner.replace(/(date="[^"]*"\n)/, `$1${lines}`);
    } else {
      skipped++;
      return full;
    }
    filled++;
    return `  <TogstrekAdventureFeaturedPlace\n${nextInner}\n  />`;
  });

  const changed = text !== orig;
  if (changed && !dryRun) {
    fs.writeFileSync(abs, text, "utf8");
  }
  return { changed, filled, skipped, noHero, noMdx };
}

function main(): void {
  const { dryRun } = parseArgs();
  const files = fs
    .readdirSync(ADVENTURES_DIR)
    .filter((n) => n.endsWith(".mdx"))
    .map((n) => path.join(ADVENTURES_DIR, n))
    .sort();

  let totalFilled = 0;
  let totalChanged = 0;
  let totalNoHero = 0;
  let totalNoMdx = 0;

  for (const f of files) {
    const r = processAdventureFile(f, dryRun);
    totalFilled += r.filled;
    totalNoHero += r.noHero;
    totalNoMdx += r.noMdx;
    if (r.changed) {
      totalChanged++;
      console.log(
        `${dryRun ? "[dry-run] " : ""}${path.relative(REPO_ROOT, f)} (+${r.filled} image props)`,
      );
    }
  }

  console.log(
    `\nAdventure files touched: ${totalChanged} | Featured tiles filled: ${totalFilled} | No hero on target: ${totalNoHero} | No MDX for href: ${totalNoMdx}${dryRun ? "\n(dry-run: no writes)" : ""}`,
  );
}

main();
