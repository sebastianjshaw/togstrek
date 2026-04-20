import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";

import { remarkTogstrekJumpTo } from "@/lib/remark-togstrek-jump-to";
import { remarkTogstrekPhotoGallery } from "@/lib/remark-togstrek-photo-gallery";

/**
 * Shared remark pipeline for MDX that renders place-style prose + images:
 * GFM; legacy “Jump to…” lists → `TogstrekJumpTo`, else auto-inject when ≥2 headings
 * and no nav (optional `<TogstrekJumpTo />` pins placement); unwrap lone images from
 * paragraphs; group consecutive standalone images into `PhotoGallery`.
 */
export const togstrekMdxRemarkPlugins = [
  remarkGfm,
  remarkTogstrekJumpTo,
  remarkUnwrapImages,
  remarkTogstrekPhotoGallery,
];
