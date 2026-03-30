import type { MDXComponents } from "mdx/types.js";

import { TogstrekAdventureFeaturedPlace } from "@/components/togstrek-adventures/togstrek-adventure-featured-place";
import { TogstrekAdventureFeaturedSection } from "@/components/togstrek-adventures/togstrek-adventure-featured-section";
import { getTogstrekPlaceMdxComponents } from "@/components/togstrek-place/togstrek-place-mdx-components";

/** Adventure MDX: shared place prose + featured-place grid components. */
export function getTogstrekAdventureMdxComponents(): MDXComponents {
  return {
    ...getTogstrekPlaceMdxComponents(),
    TogstrekAdventureFeaturedSection,
    TogstrekAdventureFeaturedPlace,
  };
}
