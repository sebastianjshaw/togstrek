import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import type { Pluggable } from "unified";

import { togstrekMdxSanitizeSchema } from "@/lib/togstrek-mdx-sanitize-schema";

/**
 * Shared rehype pipeline for MDX:
 * - `rehype-slug` — stable `id` on headings for in-page anchors and jump-to nav
 * - `rehype-sanitize` — strip unsafe HTML in authored MDX (defense in depth; JSX components are separate)
 */
export const togstrekMdxRehypePlugins: Pluggable[] = [
  rehypeSlug,
  [rehypeSanitize, togstrekMdxSanitizeSchema],
];
