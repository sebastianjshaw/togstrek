/**
 * Emit `src/data/togstrek-other-work-section-featured.ts` from
 * `migration/other-work-section-featured.json` (edit that JSON to add/change cards).
 *
 *   npx tsx scripts/refresh-other-work-section-featured.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";

const REPO = process.cwd();
const JSON_PATH = path.join(REPO, "migration/other-work-section-featured.json");
const OUT_PATH = path.join(REPO, "src/data/togstrek-other-work-section-featured.ts");

type Row = { title: string; href: string; imageSrc: string; date: string };

function main(): void {
  const raw = fs.readFileSync(JSON_PATH, "utf8");
  const data = JSON.parse(raw) as Record<string, Row[]>;
  const keys = Object.keys(data).sort();

  let ts = `/**
 * Featured journal links per portfolio section — powers \`TogstrekOtherWorkSectionFeatured\`.
 * Source: \`migration/other-work-section-featured.json\` — run \`npx tsx scripts/refresh-other-work-section-featured.ts\` after edits.
 */
import type { TogstrekOtherWorkHubFeatured } from "@/data/togstrek-other-work-hub";

type TogstrekOtherWorkSectionFeaturedRow = {
  title: string;
  href: string;
  imageSrc: string;
  date: string;
};

function toFeatured(rows: TogstrekOtherWorkSectionFeaturedRow[]): TogstrekOtherWorkHubFeatured[] {
  return rows.map((r) => ({
    title: r.title,
    href: r.href,
    imageSrc: r.imageSrc,
    imageAlt: r.title,
    date: r.date,
  }));
}

export const TOGSTREK_OTHER_WORK_SECTION_FEATURED: Record<
  string,
  TogstrekOtherWorkHubFeatured[]
> = {
`;

  for (const k of keys) {
    ts += `  ${JSON.stringify(k)}: toFeatured(${JSON.stringify(data[k], null, 2)}),\n`;
  }

  ts += `};

export function getTogstrekOtherWorkSectionFeatured(
  section: string,
): TogstrekOtherWorkHubFeatured[] {
  return TOGSTREK_OTHER_WORK_SECTION_FEATURED[section] ?? [];
}
`;

  fs.writeFileSync(OUT_PATH, ts, "utf8");
  console.log(`Wrote ${path.relative(REPO, OUT_PATH)} (${keys.length} sections)`);
}

main();
