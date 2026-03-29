import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import { getTogstrekPlaceMdxComponents } from "@/components/togstrek-place/togstrek-place-mdx-components";
import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";
import { shouldOmitVisibleDescriptionLead } from "@/lib/togstrek-mdx-description-lead-dedupe";
import {
  parseTogstrekOtherWorkFrontmatter,
  type TogstrekOtherWorkMdxFrontmatter,
} from "@/lib/togstrek-other-work-frontmatter";

const PHOTOGRAPHY_ROOT = path.join(process.cwd(), "content", "photography");

export type TogstrekPhotographyMdxResult = {
  frontmatter: TogstrekOtherWorkMdxFrontmatter;
  content: ReactNode;
  /** When true, body already opens with the same copy as `description` — hide the lead. */
  omitDescriptionLead: boolean;
};

export function photographyMdxFilePath(slugSegments: string[]): string {
  const folderIndex = path.join(PHOTOGRAPHY_ROOT, ...slugSegments, "index.mdx");
  const singleFile = path.join(PHOTOGRAPHY_ROOT, ...slugSegments) + ".mdx";
  if (fs.existsSync(folderIndex)) return folderIndex;
  return singleFile;
}

export function photographyMdxExists(slugSegments: string[]): boolean {
  if (slugSegments.length === 0) return false;
  const folderIndex = path.join(PHOTOGRAPHY_ROOT, ...slugSegments, "index.mdx");
  const singleFile = path.join(PHOTOGRAPHY_ROOT, ...slugSegments) + ".mdx";
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

export function loadTogstrekPhotographyFrontmatterOnly(
  slugSegments: string[],
): TogstrekOtherWorkMdxFrontmatter {
  const fp = photographyMdxFilePath(slugSegments);
  const raw = fs.readFileSync(fp, "utf8");
  const { data } = matter(raw);
  return parseTogstrekOtherWorkFrontmatter(data as Record<string, unknown>);
}

export async function loadTogstrekPhotographyMdx(
  slugSegments: string[],
): Promise<TogstrekPhotographyMdxResult> {
  const fp = photographyMdxFilePath(slugSegments);
  const source = fs.readFileSync(fp, "utf8");

  const parsed = matter(source);
  const fmDedupe = parseTogstrekOtherWorkFrontmatter(
    parsed.data as Record<string, unknown>,
  );
  const omitDescriptionLead = shouldOmitVisibleDescriptionLead(
    fmDedupe.description,
    parsed.content,
  );

  const { content, frontmatter: rawFm } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [...togstrekMdxRemarkPlugins],
      },
    },
    components: getTogstrekPlaceMdxComponents(),
  });

  const fm = rawFm as Record<string, unknown>;
  const frontmatter = parseTogstrekOtherWorkFrontmatter(fm);

  return { frontmatter, content, omitDescriptionLead };
}

export function discoverTogstrekPhotographySlugLists(): string[][] {
  if (!fs.existsSync(PHOTOGRAPHY_ROOT)) return [];
  const out: string[][] = [];

  function walk(dir: string, rel: string[]): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name.startsWith(".")) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "_https_") continue;
        walk(full, [...rel, ent.name]);
      } else if (ent.isFile() && ent.name.endsWith(".mdx")) {
        const base = ent.name.replace(/\.mdx$/, "");
        if (base === "index") {
          if (rel.length > 0) out.push(rel);
        } else {
          out.push([...rel, base]);
        }
      }
    }
  }

  walk(PHOTOGRAPHY_ROOT, []);
  return out;
}

export function discoverTogstrekPhotographySlugParams(): { slug: string[] }[] {
  return discoverTogstrekPhotographySlugLists().map((slug) => ({ slug }));
}
