import fs from "node:fs";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";

import { getTogstrekAdventureMdxComponents } from "@/components/togstrek-adventures/togstrek-adventure-mdx-components";
import { adventureMdxFilePath } from "@/lib/togstrek-adventure-content-fs";
import {
  parseTogstrekAdventureFrontmatter,
  type TogstrekAdventureMdxFrontmatter,
} from "@/lib/togstrek-adventure-frontmatter";
import { shouldOmitVisibleDescriptionLead } from "@/lib/togstrek-mdx-description-lead-dedupe";
import rehypeSlug from "rehype-slug";

import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";

export type TogstrekAdventureMdxResult = {
  frontmatter: TogstrekAdventureMdxFrontmatter;
  content: ReactNode;
  omitDescriptionLead: boolean;
};

export async function loadTogstrekAdventureMdx(
  slug: string,
): Promise<TogstrekAdventureMdxResult> {
  const fp = adventureMdxFilePath(slug);
  const source = fs.readFileSync(fp, "utf8");
  const { data, content: mdBody } = matter(source);
  const frontmatter = parseTogstrekAdventureFrontmatter(
    data as Record<string, unknown>,
    slug,
  );
  const omitDescriptionLead = shouldOmitVisibleDescriptionLead(
    frontmatter.description,
    mdBody,
  );

  // next-mdx-remote RSC strips JSX attrs written as `{expr}` (e.g. imageSrc={...},
  // excerpt={...}); use string literals in MDX — encode & in URLs as %26, " in text as &quot;.
  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [...togstrekMdxRemarkPlugins],
        // Adventure MDX is mostly JSX layout components + intro wrappers; full
        // `rehype-sanitize` strips those HAST nodes (see togstrek-mdx-sanitize-schema).
        rehypePlugins: [rehypeSlug],
      },
    },
    components: getTogstrekAdventureMdxComponents(),
  });

  return { frontmatter, content, omitDescriptionLead };
}

export {
  adventureMdxExists,
  adventureMdxFilePath,
  discoverTogstrekAdventureSlugParams,
  discoverTogstrekAdventureSlugs,
  loadTogstrekAdventureFrontmatterOnly,
} from "@/lib/togstrek-adventure-content-fs";
