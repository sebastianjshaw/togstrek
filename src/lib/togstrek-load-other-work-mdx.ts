import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import { TogstrekOtherWorkHubBody } from "@/components/togstrek-other-work/togstrek-other-work-hub-body";
import { TogstrekOtherWorkSectionFeatured } from "@/components/togstrek-other-work/togstrek-other-work-section-featured";
import { getTogstrekOtherWorkMdxComponents } from "@/components/togstrek-other-work/togstrek-other-work-mdx-components";
import {
  parseTogstrekOtherWorkFrontmatter,
  type TogstrekOtherWorkMdxFrontmatter,
} from "@/lib/togstrek-other-work-frontmatter";
import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";

const OTHER_WORK_ROOT = path.join(process.cwd(), "content", "other-work");

export type TogstrekOtherWorkMdxResult = {
  frontmatter: TogstrekOtherWorkMdxFrontmatter;
  content: ReactNode;
};

export function otherWorkMdxFilePath(slugSegments: string[]): string {
  if (slugSegments.length === 0) {
    return path.join(OTHER_WORK_ROOT, "index.mdx");
  }
  const folderIndex = path.join(OTHER_WORK_ROOT, ...slugSegments, "index.mdx");
  const singleFile = path.join(OTHER_WORK_ROOT, ...slugSegments) + ".mdx";
  if (fs.existsSync(folderIndex)) return folderIndex;
  return singleFile;
}

export function otherWorkMdxExists(slugSegments: string[]): boolean {
  if (slugSegments.length === 0) {
    try {
      return fs.statSync(path.join(OTHER_WORK_ROOT, "index.mdx")).isFile();
    } catch {
      return false;
    }
  }
  const folderIndex = path.join(OTHER_WORK_ROOT, ...slugSegments, "index.mdx");
  const singleFile = path.join(OTHER_WORK_ROOT, ...slugSegments) + ".mdx";
  try {
    if (fs.statSync(folderIndex).isFile()) return true;
  } catch {
    /* continue */
  }
  try {
    return fs.statSync(singleFile).isFile();
  } catch {
    return false;
  }
}

export function loadTogstrekOtherWorkFrontmatterOnly(
  slugSegments: string[],
): TogstrekOtherWorkMdxFrontmatter {
  const fp = otherWorkMdxFilePath(slugSegments);
  const raw = fs.readFileSync(fp, "utf8");
  const { data } = matter(raw);
  return parseTogstrekOtherWorkFrontmatter(data as Record<string, unknown>);
}

export async function loadTogstrekOtherWorkMdx(
  slugSegments: string[],
): Promise<TogstrekOtherWorkMdxResult> {
  const fp = otherWorkMdxFilePath(slugSegments);
  const source = fs.readFileSync(fp, "utf8");

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

  return { frontmatter, content };
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
        walk(full, [...rel, ent.name]);
      } else if (ent.isFile() && ent.name.endsWith(".mdx")) {
        const base = ent.name.replace(/\.mdx$/, "");
        if (base === "index") {
          out.push(rel.length === 0 ? [] : rel);
        } else {
          out.push([...rel, base]);
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
