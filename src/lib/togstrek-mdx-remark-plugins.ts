import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";

import { remarkTogstrekPhotoGallery } from "@/lib/remark-togstrek-photo-gallery";

/**
 * Shared remark pipeline for MDX that renders place-style prose + images:
 * GFM, unwrap lone images from paragraphs, then split multi-image paragraphs
 * and group consecutive standalone images into `PhotoGallery` (grid + lightbox).
 */
export const togstrekMdxRemarkPlugins = [
  remarkGfm,
  remarkUnwrapImages,
  remarkTogstrekPhotoGallery,
];
