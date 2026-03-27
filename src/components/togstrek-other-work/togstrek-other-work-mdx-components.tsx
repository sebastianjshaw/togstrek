import type { MDXComponents } from "mdx/types.js";

import { getTogstrekPlaceMdxComponents } from "@/components/togstrek-place/togstrek-place-mdx-components";

/**
 * Other Work MDX — same rendering as place pages (figures, lazy images, prose).
 */
export function getTogstrekOtherWorkMdxComponents(): MDXComponents {
  return getTogstrekPlaceMdxComponents();
}
