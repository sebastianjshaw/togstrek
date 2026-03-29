/**
 * Rewrites `heroImage.alt` in hiking MDX when it duplicates the page title
 * or is missing, using the description (clipped) as a scene-oriented alt.
 *
 *   npx tsx scripts/roll-hiking-hero-alt.ts
 */

import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

const HIKING_ROOT = path.join(process.cwd(), "content/hiking");

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

function clipDescription(raw: string, maxLen: number): string {
  const oneLine = raw.replace(/\s+/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  const cut = oneLine.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${base}…`;
}

function deriveHeroAlt(title: string, description: string, currentAlt: string) {
  const desc = description.replace(/\s+/g, " ").trim();
  if (desc.length >= 24) {
    return clipDescription(desc, 160);
  }
  const t = title.trim();
  if (norm(currentAlt) !== norm(t) && currentAlt.trim().length >= 12) {
    return currentAlt.trim();
  }
  return `${t} — outdoor photograph along the trail`;
}

async function walkMdx(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkMdx(full)));
    } else if (e.isFile() && e.name.endsWith(".mdx")) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const files = await walkMdx(HIKING_ROOT);
  let updated = 0;
  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    const { data, content } = matter(raw);
    const title = typeof data.title === "string" ? data.title : "";
    const description =
      typeof data.description === "string" ? data.description : "";
    const hero = data.heroImage;
    if (!hero || typeof hero !== "object") continue;
    const hi = hero as Record<string, unknown>;
    const currentAlt = typeof hi.alt === "string" ? hi.alt : "";
    if (!title.trim()) continue;

    const shouldReplace =
      !currentAlt.trim() || norm(currentAlt) === norm(title);

    if (!shouldReplace) continue;

    const nextAlt = deriveHeroAlt(title, description, currentAlt);
    if (nextAlt === currentAlt) continue;

    hi.alt = nextAlt;
    data.heroImage = hi;
    const nextBody = matter.stringify(content, data);
    await fs.writeFile(file, nextBody, "utf8");
    updated += 1;
  }
  console.log(`Updated heroImage.alt in ${updated} file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
