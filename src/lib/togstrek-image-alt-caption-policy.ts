import {
  isLikelyCameraExifCaption,
  isTechnicalImageFilenameAlt,
} from "@/lib/togstrek-mdx-image-caption";

/**
 * Policy for MDX markdown images `![alt](url)` (single alt field).
 *
 * **Visible caption** (`<figcaption>` — what sighted readers see under the photo)
 * 1. EXIF / camera line when `alt` is detected as EXIF.
 * 2. Otherwise human **description** when `alt` is plain-language (not technical filename).
 * 3. Otherwise no caption (technical filename or empty alt).
 *
 * **Accessible name** (`<img alt="…">` — screen readers)
 * 1. **Descriptive** prose in `alt` (best).
 * 2. **AI- or script-generated** text — not applied at runtime; use
 *    `npm run media:suggest-alt-heuristic` / future AI tooling to rewrite MDX.
 * 3. **EXIF** string when that is all we have (same field as caption for EXIF-only images).
 * 4. **Empty** when nothing is available; run `npm run media:audit-image-alt` for a manual
 *    review list (`migration/image-alt-manual-review.jsonl`).
 *
 * Technical filenames and empty alts resolve to `""` here so content can be fixed in MDX.
 */

export type TogstrekImageAltKind =
  | "descriptive"
  | "exif"
  | "technical_filename"
  | "empty";

export function classifyMarkdownImageAlt(altRaw: string): TogstrekImageAltKind {
  const alt = typeof altRaw === "string" ? altRaw.trim() : "";
  if (alt.length === 0) return "empty";
  if (isLikelyCameraExifCaption(alt)) return "exif";
  if (isTechnicalImageFilenameAlt(alt)) return "technical_filename";
  return "descriptive";
}

/**
 * Text shown under the image when a caption is appropriate (may duplicate `alt` visually;
 * use `aria-hidden` on the figcaption when it matches {@link resolveAccessibilityAlt}).
 */
export function resolveVisibleCaption(altRaw: string): string | null {
  const kind = classifyMarkdownImageAlt(altRaw);
  const alt = typeof altRaw === "string" ? altRaw.trim() : "";
  if (kind === "exif" || kind === "descriptive") return alt;
  return null;
}

/**
 * String for the `alt` attribute. Empty means fix in content or use audit report.
 */
export function resolveAccessibilityAlt(altRaw: string): string {
  const kind = classifyMarkdownImageAlt(altRaw);
  const alt = typeof altRaw === "string" ? altRaw.trim() : "";
  if (kind === "descriptive" || kind === "exif") return alt;
  return "";
}

/**
 * Fallback label for lightbox UI / zoom control when MDX `alt` is still empty or technical
 * (see audit script). Not used as `img alt` when policy says blank — use `""` there.
 */
export const TOGSTREK_IMAGE_LIGHTBOX_FALLBACK_LABEL = "Photograph";

/** Shared labels for MDX inline preview + fullscreen lightbox (keep in sync). */
export type TogstrekMdxImagePresentation = {
  /** `alt` on inline `Image` and overlay `<img>`. */
  imageAlt: string;
  /** Figcaption / overlay caption line; `null` when nothing is shown under the inline image. */
  visibleCaption: string | null;
  kind: TogstrekImageAltKind;
};

export function resolveMdxImagePresentation(
  altRaw: string,
): TogstrekMdxImagePresentation {
  const kind = classifyMarkdownImageAlt(altRaw);
  const accessibilityAlt = resolveAccessibilityAlt(altRaw);
  const imageAlt =
    accessibilityAlt.length > 0
      ? accessibilityAlt
      : TOGSTREK_IMAGE_LIGHTBOX_FALLBACK_LABEL;
  const visibleCaption = resolveVisibleCaption(altRaw);
  return { imageAlt, visibleCaption, kind };
}
