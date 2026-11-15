import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";

import { remarkTogstrekJumpTo } from "@/lib/remark-togstrek-jump-to";
import { remarkTogstrekPhotoGallery } from "@/lib/remark-togstrek-photo-gallery";

/**
 * Shared remark pipeline for MDX that renders place-style prose + images:
 * GFM; unwrap lone images from paragraphs; group consecutive standalone images into
 * `PhotoGallery`; then legacy “Jump to…” lists → `TogstrekJumpTo`, else auto-inject when
 * ≥2 headings and no nav (optional `<TogstrekJumpTo />` pins placement).
 *
 * Jump-to must run **after** gallery grouping: it injects a node after the first root
 * paragraph, which used to land between two photos and split one gallery into two.
 */
export const togstrekMdxRemarkPlugins = [
  remarkGfm,
  remarkUnwrapImages,
  remarkTogstrekPhotoGallery,
  remarkTogstrekJumpTo,
];
