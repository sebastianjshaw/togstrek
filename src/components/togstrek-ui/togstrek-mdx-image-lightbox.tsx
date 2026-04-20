"use client";

import Image from "next/image";
import { memo, useEffect, useId } from "react";

import { togstrekUnoptimizedRemoteImageInDev } from "@/lib/togstrek-dev-remote-image";
import {
  classifyMarkdownImageAlt,
  resolveAccessibilityAlt,
  resolveVisibleCaption,
  TOGSTREK_IMAGE_LIGHTBOX_FALLBACK_LABEL,
} from "@/lib/togstrek-image-alt-caption-policy";
import { isLikelyCameraExifCaption } from "@/lib/togstrek-mdx-image-caption";

import {
  useTogstrekMdxPhotoGallery,
  useTogstrekMdxPhotoGalleryLayout,
} from "./togstrek-mdx-photo-gallery";
import { useTogstrekMdxLightbox } from "./togstrek-mdx-lightbox-scope";

type TogstrekMdxImageLightboxProps = {
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
};

/**
 * MDX `img` replacement: modest on-page preview (contain + max height) and
 * lightbox open via shared {@link TogstrekMdxLightboxScope}.
 *
 * Caption vs `alt` follows `togstrek-image-alt-caption-policy`.
 */
export const TogstrekMdxImageLightbox = memo(function TogstrekMdxImageLightbox(
  props: TogstrekMdxImageLightboxProps,
) {
  const { src, alt, width, height, className } = props;
  const ctx = useTogstrekMdxLightbox();
  const inPhotoGallery = useTogstrekMdxPhotoGallery();
  const photoGalleryLayout = useTogstrekMdxPhotoGalleryLayout();
  const instanceId = useId();

  const altText = typeof alt === "string" ? alt.trim() : "";
  if (!src || typeof src !== "string") return null;

  const captionText = resolveVisibleCaption(altText);
  const accessibilityAlt = resolveAccessibilityAlt(altText);
  /** Policy: blank `alt` for technical/empty MDX until content or audit pass fills it. */
  const imageAltForImg = accessibilityAlt;

  const isExifCaption =
    captionText !== null &&
    captionText.length > 0 &&
    isLikelyCameraExifCaption(captionText);

  const captionDuplicatesAccessibleName =
    captionText !== null &&
    captionText.length > 0 &&
    captionText === accessibilityAlt;

  const lightboxCaptionAlt =
    accessibilityAlt.length > 0
      ? accessibilityAlt
      : TOGSTREK_IMAGE_LIGHTBOX_FALLBACK_LABEL;

  const w =
    typeof width === "number" ? width : Number.parseInt(String(width), 10);
  const h =
    typeof height === "number"
      ? height
      : Number.parseInt(String(height), 10);
  const safeW = Number.isFinite(w) && w > 0 ? w : 1200;
  const safeH = Number.isFinite(h) && h > 0 ? h : 800;

  useEffect(() => {
    if (!ctx) return;
    return ctx.register({
      id: instanceId,
      src,
      alt: lightboxCaptionAlt,
    });
  }, [ctx, instanceId, src, lightboxCaptionAlt]);

  const onOpen = () => {
    if (ctx) ctx.open(instanceId);
  };

  const kind = classifyMarkdownImageAlt(altText);
  const zoomAriaLabel =
    kind === "descriptive" && accessibilityAlt.length > 0
      ? `View larger: ${accessibilityAlt}`
      : "View larger photograph";

  return (
    <figure
      className={`togstrek-place-mdx-figure w-full ${inPhotoGallery ? "" : "my-[var(--tt-space-10)]"} ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="togstrek-mdx-image-lightbox-trigger group block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tt-surface-base"
        aria-label={zoomAriaLabel}
      >
        <span className="togstrek-place-mdx-figure-frame togstrek-place-mdx-figure-frame--elevated relative block overflow-hidden border border-tt-border-muted/90 bg-tt-surface-muted">
          <Image
            src={src}
            alt={imageAltForImg}
            width={safeW}
            height={safeH}
            sizes={
              inPhotoGallery
                ? photoGalleryLayout === "dense"
                  ? "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 34vw, 26vw"
                  : "(max-width: 767px) 100vw, 50vw"
                : "(max-width: 768px) 100vw, min(42rem, 92vw)"
            }
            loading="lazy"
            unoptimized={togstrekUnoptimizedRemoteImageInDev(src)}
            className={`h-auto w-full object-contain ${
              inPhotoGallery
                ? photoGalleryLayout === "dense"
                  ? "max-h-[min(38vh,220px)] sm:max-h-[min(40vh,240px)] md:max-h-[min(42vh,260px)] lg:max-h-[min(44vh,280px)] xl:max-h-[min(46vh,300px)]"
                  : "max-h-[min(52vh,440px)] md:max-h-[min(58vh,520px)]"
                : "max-h-[min(72vh,620px)]"
            }`}
          />
        </span>
      </button>
      {captionText !== null && captionText.length > 0 ? (
        <figcaption
          className={`togstrek-mdx-image-caption mt-[var(--tt-space-3)] text-center font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary ${isExifCaption ? "togstrek-mdx-image-caption--exif font-mono text-[0.85em] leading-snug tracking-tight text-tt-text-tertiary/95" : ""} ${inPhotoGallery ? "line-clamp-2" : ""}`}
          {...(captionDuplicatesAccessibleName ? { "aria-hidden": true } : {})}
        >
          {captionText}
        </figcaption>
      ) : null}
    </figure>
  );
});

TogstrekMdxImageLightbox.displayName = "TogstrekMdxImageLightbox";
