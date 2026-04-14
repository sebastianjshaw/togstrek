import rehypeSlug from "rehype-slug";

/**
 * Shared rehype pipeline for MDX: stable `id` on headings so in-page anchors
 * (`#section-name`) and “jump to” lists resolve correctly.
 */
export const togstrekMdxRehypePlugins = [rehypeSlug];
