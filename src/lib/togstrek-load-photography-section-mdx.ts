import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import rehypeSlug from "rehype-slug";

import { TogstrekPhotographyCollectionPosts } from "@/components/togstrek-photography/togstrek-photography-collection-posts";
import { TogstrekPhotographyHubBody } from "@/components/togstrek-photography/togstrek-photography-hub-body";
import { getTogstrekPlaceMdxComponents } from "@/components/togstrek-place/togstrek-place-mdx-components";
import { shouldOmitVisibleDescriptionLead } from "@/lib/togstrek-mdx-description-lead-dedupe";
import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";
import {
  isTogstrekPathWithinRoot,
  isTogstrekSafeUrlPathSegment,
} from "@/lib/togstrek-path-safety";
import {
  parseTogstrekPhotographyFrontmatter,
  type TogstrekPhotographyMdxFrontmatter,
} from "@/lib/togstrek-photography-frontmatter";

/**
 * The Other Work hub and its collection pages sit beside the posts:
 * `content/photography/index.mdx` (hub) and
 * `content/photography/<collection>/_collection.mdx`. The leading underscore
 * keeps the collection file out of post discovery.
 */
const PHOTOGRAPHY_ROOT = path.join(process.cwd(), "content", "photography");

/** Path to the hub (no `collection`) or a collection's intro page. */
function resolveSectionMdxPath(collection?: string): string | null {
  const fp =
    collection === undefined
      ? path.join(PHOTOGRAPHY_ROOT, "index.mdx")
      : isTogstrekSafeUrlPathSegment(collection)
        ? path.join(PHOTOGRAPHY_ROOT, collection, "_collection.mdx")
        : null;
  if (!fp || !isTogstrekPathWithinRoot(fp, PHOTOGRAPHY_ROOT)) return null;
  return fp;
}

export function photographySectionMdxExists(collection?: string): boolean {
  const fp = resolveSectionMdxPath(collection);
  if (!fp) return false;
  try {
    return fs.statSync(fp).isFile();
  } catch {
    return false;
  }
}

export function photographySectionMdxFilePath(collection?: string): string {
  const fp = resolveSectionMdxPath(collection);
  if (!fp) throw new Error("Invalid photography section path parameters");
  return fp;
}

export function loadTogstrekPhotographySectionFrontmatterOnly(
  collection?: string,
): TogstrekPhotographyMdxFrontmatter {
  const raw = fs.readFileSync(photographySectionMdxFilePath(collection), "utf8");
  return parseTogstrekPhotographyFrontmatter(
    matter(raw).data as Record<string, unknown>,
  );
}

export type TogstrekPhotographySectionMdxResult = {
  frontmatter: TogstrekPhotographyMdxFrontmatter;
  content: ReactNode;
  omitDescriptionLead: boolean;
};

export async function loadTogstrekPhotographySectionMdx(
  collection?: string,
): Promise<TogstrekPhotographySectionMdxResult> {
  const source = fs.readFileSync(photographySectionMdxFilePath(collection), "utf8");

  const parsed = matter(source);
  const fmDedupe = parseTogstrekPhotographyFrontmatter(
    parsed.data as Record<string, unknown>,
  );
  const omitDescriptionLead =
    collection !== undefined &&
    shouldOmitVisibleDescriptionLead(fmDedupe.description, parsed.content);

  const { content, frontmatter: rawFm } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [...togstrekMdxRemarkPlugins],
        // Hub/collection MDX is mostly layout components; `rehype-sanitize`
        // would strip them (see togstrek-mdx-sanitize-schema).
        rehypePlugins: [rehypeSlug],
      },
    },
    components: {
      ...getTogstrekPlaceMdxComponents(),
      TogstrekPhotographyHubBody,
      TogstrekPhotographyCollectionPosts,
    },
  });

  return {
    frontmatter: parseTogstrekPhotographyFrontmatter(
      rawFm as Record<string, unknown>,
    ),
    content,
    omitDescriptionLead,
  };
}
