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
import { shouldOmitVisibleDescriptionLead } from "@/lib/togstrek-mdx-description-lead-dedupe";
import { togstrekMdxRehypePlugins } from "@/lib/togstrek-mdx-rehype-plugins";
import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";

export type TogstrekHikingMdxResult = {
  frontmatter: TogstrekHikingMdxFrontmatter;
  content: ReactNode;
  omitDescriptionLead: boolean;
};

export async function loadTogstrekHikingMdx(
  slugSegments: string[],
): Promise<TogstrekHikingMdxResult> {
  const fp = hikingMdxFilePath(slugSegments);
  const source = fs.readFileSync(fp, "utf8");
  const { data, content: mdBody } = matter(source);
  const baseFm = parseTogstrekHikingFrontmatter(data as Record<string, unknown>);
  const frontmatter = mergeTogstrekHikingTrailFactsFromBody(baseFm, mdBody);
  const omitDescriptionLead = shouldOmitVisibleDescriptionLead(
    frontmatter.description,
    mdBody,
  );

  const { content } = await compileMDX({
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

  return { frontmatter, content, omitDescriptionLead };
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
