import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import { TogstrekOtherWorkHubBody } from "@/components/togstrek-other-work/togstrek-other-work-hub-body";
import { TogstrekOtherWorkSectionFeatured } from "@/components/togstrek-other-work/togstrek-other-work-section-featured";
import { getTogstrekOtherWorkMdxComponents } from "@/components/togstrek-other-work/togstrek-other-work-mdx-components";
import { shouldOmitVisibleDescriptionLead } from "@/lib/togstrek-mdx-description-lead-dedupe";
import {
  parseTogstrekOtherWorkFrontmatter,
  type TogstrekOtherWorkMdxFrontmatter,
} from "@/lib/togstrek-other-work-frontmatter";
import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";
import {
  areTogstrekSafeUrlPathSegments,
  isTogstrekPathWithinRoot,
  isTogstrekSafeUrlPathSegment,
} from "@/lib/togstrek-path-safety";

const OTHER_WORK_ROOT = path.join(process.cwd(), "content", "other-work");

function resolveOtherWorkMdxPath(slugSegments: string[]): string | null {
  if (
    slugSegments.length > 0 &&
    !areTogstrekSafeUrlPathSegments(slugSegments)
  ) {
    return null;
  }
  if (slugSegments.length === 0) {
    const fp = path.join(OTHER_WORK_ROOT, "index.mdx");
    return isTogstrekPathWithinRoot(fp, OTHER_WORK_ROOT) ? fp : null;
  }
  const folderIndex = path.join(OTHER_WORK_ROOT, ...slugSegments, "index.mdx");
  const singleFile = path.join(OTHER_WORK_ROOT, ...slugSegments) + ".mdx";
  const fp = fs.existsSync(folderIndex) ? folderIndex : singleFile;
  if (!isTogstrekPathWithinRoot(fp, OTHER_WORK_ROOT)) return null;
  return fp;
}

export type TogstrekOtherWorkMdxResult = {
  frontmatter: TogstrekOtherWorkMdxFrontmatter;
  content: ReactNode;
  omitDescriptionLead: boolean;
};

export function otherWorkMdxFilePath(slugSegments: string[]): string {
  const fp = resolveOtherWorkMdxPath(slugSegments);
  if (!fp) {
    throw new Error("Invalid other-work path parameters");
  }
  return fp;
}

export function otherWorkMdxExists(slugSegments: string[]): boolean {
  const fp = resolveOtherWorkMdxPath(slugSegments);
  if (!fp) return false;
  try {
    return fs.statSync(fp).isFile();
  } catch {
    return false;
  }
}

export function loadTogstrekOtherWorkFrontmatterOnly(
  slugSegments: string[],
): TogstrekOtherWorkMdxFrontmatter {
  const fp = resolveOtherWorkMdxPath(slugSegments);
  if (!fp) {
    throw new Error("Invalid other-work path parameters");
  }
  const raw = fs.readFileSync(fp, "utf8");
  const { data } = matter(raw);
  return parseTogstrekOtherWorkFrontmatter(data as Record<string, unknown>);
}

export async function loadTogstrekOtherWorkMdx(
  slugSegments: string[],
): Promise<TogstrekOtherWorkMdxResult> {
  const fp = otherWorkMdxFilePath(slugSegments);
  const source = fs.readFileSync(fp, "utf8");

  const parsed = matter(source);
  const fmDedupe = parseTogstrekOtherWorkFrontmatter(
    parsed.data as Record<string, unknown>,
  );
  const omitDescriptionLead =
    slugSegments.length > 0 &&
    shouldOmitVisibleDescriptionLead(fmDedupe.description, parsed.content);

  const baseComponents = getTogstrekOtherWorkMdxComponents();
  const components = {
    ...baseComponents,
    TogstrekOtherWorkSectionFeatured,
    ...(slugSegments.length === 0 ? { TogstrekOtherWorkHubBody } : {}),
  };

  const { content, frontmatter: rawFm } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [...togstrekMdxRemarkPlugins],
      },
    },
    components,
  });

  const fm = rawFm as Record<string, unknown>;
  const frontmatter = parseTogstrekOtherWorkFrontmatter(fm);

  return { frontmatter, content, omitDescriptionLead };
}

export function discoverTogstrekOtherWorkSlugLists(): string[][] {
  if (!fs.existsSync(OTHER_WORK_ROOT)) return [];
  const out: string[][] = [];

  function walk(dir: string, rel: string[]): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name.startsWith(".")) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (!isTogstrekSafeUrlPathSegment(ent.name)) continue;
        walk(full, [...rel, ent.name]);
      } else if (ent.isFile() && ent.name.endsWith(".mdx")) {
        const base = ent.name.replace(/\.mdx$/, "");
        if (base === "index") {
          if (rel.every(isTogstrekSafeUrlPathSegment)) {
            out.push(rel.length === 0 ? [] : rel);
          }
        } else if (isTogstrekSafeUrlPathSegment(base)) {
          if (rel.every(isTogstrekSafeUrlPathSegment)) {
            out.push([...rel, base]);
          }
        }
      }
    }
  }

  walk(OTHER_WORK_ROOT, []);

  const indexPath = path.join(OTHER_WORK_ROOT, "index.mdx");
  if (fs.existsSync(indexPath)) {
    const hasRootIndex = out.some((s) => s.length === 0);
    if (!hasRootIndex) out.unshift([]);
  }

  return out;
}

export function discoverTogstrekOtherWorkSlugParams(): { slug: string[] }[] {
  return discoverTogstrekOtherWorkSlugLists()
    .filter((s) => s.length > 0)
    .map((slug) => ({ slug }));
}
