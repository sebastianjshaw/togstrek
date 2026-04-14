import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import { getTogstrekPlaceMdxComponents } from "@/components/togstrek-place/togstrek-place-mdx-components";
import { togstrekMdxRehypePlugins } from "@/lib/togstrek-mdx-rehype-plugins";
import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";
import { shouldOmitVisibleDescriptionLead } from "@/lib/togstrek-mdx-description-lead-dedupe";
import {
  parseTogstrekOtherWorkFrontmatter,
  type TogstrekOtherWorkMdxFrontmatter,
} from "@/lib/togstrek-other-work-frontmatter";
import {
  areTogstrekSafeUrlPathSegments,
  isTogstrekPathWithinRoot,
  isTogstrekSafeUrlPathSegment,
} from "@/lib/togstrek-path-safety";

const PHOTOGRAPHY_ROOT = path.join(process.cwd(), "content", "photography");

function resolvePhotographyMdxPath(slugSegments: string[]): string | null {
  if (
    slugSegments.length === 0 ||
    !areTogstrekSafeUrlPathSegments(slugSegments)
  ) {
    return null;
  }
  const folderIndex = path.join(PHOTOGRAPHY_ROOT, ...slugSegments, "index.mdx");
  const singleFile = path.join(PHOTOGRAPHY_ROOT, ...slugSegments) + ".mdx";
  const fp = fs.existsSync(folderIndex) ? folderIndex : singleFile;
  if (!isTogstrekPathWithinRoot(fp, PHOTOGRAPHY_ROOT)) return null;
  return fp;
}

export type TogstrekPhotographyMdxResult = {
  frontmatter: TogstrekOtherWorkMdxFrontmatter;
  content: ReactNode;
  /** When true, body already opens with the same copy as `description` — hide the lead. */
  omitDescriptionLead: boolean;
};

export function photographyMdxFilePath(slugSegments: string[]): string {
  const fp = resolvePhotographyMdxPath(slugSegments);
  if (!fp) {
    throw new Error("Invalid photography path parameters");
  }
  return fp;
}

export function photographyMdxExists(slugSegments: string[]): boolean {
  const fp = resolvePhotographyMdxPath(slugSegments);
  if (!fp) return false;
  try {
    return fs.statSync(fp).isFile();
  } catch {
    return false;
  }
}

export function loadTogstrekPhotographyFrontmatterOnly(
  slugSegments: string[],
): TogstrekOtherWorkMdxFrontmatter {
  const fp = resolvePhotographyMdxPath(slugSegments);
  if (!fp) {
    throw new Error("Invalid photography path parameters");
  }
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
        rehypePlugins: [...togstrekMdxRehypePlugins],
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
        if (!isTogstrekSafeUrlPathSegment(ent.name)) continue;
        walk(full, [...rel, ent.name]);
      } else if (ent.isFile() && ent.name.endsWith(".mdx")) {
        const base = ent.name.replace(/\.mdx$/, "");
        if (base === "index") {
          if (
            rel.length > 0 &&
            rel.every(isTogstrekSafeUrlPathSegment)
          ) {
            out.push(rel);
          }
        } else if (isTogstrekSafeUrlPathSegment(base)) {
          if (rel.every(isTogstrekSafeUrlPathSegment)) {
            out.push([...rel, base]);
          }
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
