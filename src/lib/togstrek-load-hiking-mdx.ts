import fs from "node:fs";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";

import { getTogstrekPlaceMdxComponents } from "@/components/togstrek-place/togstrek-place-mdx-components";
import {
  hikingMdxFilePath,
  mergeTogstrekHikingTrailFactsFromBody,
} from "@/lib/togstrek-hiking-content-fs";
import {
  parseTogstrekHikingFrontmatter,
  type TogstrekHikingMdxFrontmatter,
} from "@/lib/togstrek-hiking-frontmatter";
import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";

export type TogstrekHikingMdxResult = {
  frontmatter: TogstrekHikingMdxFrontmatter;
  content: ReactNode;
};

export async function loadTogstrekHikingMdx(
  slugSegments: string[],
): Promise<TogstrekHikingMdxResult> {
  const fp = hikingMdxFilePath(slugSegments);
  const source = fs.readFileSync(fp, "utf8");
  const { data, content: mdBody } = matter(source);
  const baseFm = parseTogstrekHikingFrontmatter(data as Record<string, unknown>);
  const frontmatter = mergeTogstrekHikingTrailFactsFromBody(baseFm, mdBody);

  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [...togstrekMdxRemarkPlugins],
      },
    },
    components: getTogstrekPlaceMdxComponents(),
  });

  return { frontmatter, content };
}

// Re-export FS helpers so existing `@/lib/togstrek-load-hiking-mdx` imports keep working.
export {
  discoverTogstrekHikingSlugLists,
  discoverTogstrekHikingSlugParams,
  hikingMdxExists,
  hikingMdxFilePath,
  loadTogstrekHikingFrontmatterOnly,
  resolveTogstrekHikingRoute,
  type TogstrekHikingResolvedRoute,
} from "@/lib/togstrek-hiking-content-fs";
