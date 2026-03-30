"use client";

import Image from "next/image";
import { memo, useEffect, useId } from "react";

import { togstrekUnoptimizedRemoteImageInDev } from "@/lib/togstrek-dev-remote-image";

import { useTogstrekMdxPhotoGallery } from "./togstrek-mdx-photo-gallery";
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
 */
export const TogstrekMdxImageLightbox = memo(function TogstrekMdxImageLightbox(
  props: TogstrekMdxImageLightboxProps,
) {
  const { src, alt, width, height, className } = props;
  const ctx = useTogstrekMdxLightbox();
  const inPhotoGallery = useTogstrekMdxPhotoGallery();
  const instanceId = useId();

  const altText = typeof alt === "string" ? alt : "";
  if (!src || typeof src !== "string") return null;

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
    return ctx.register({ id: instanceId, src, alt: altText });
  }, [ctx, instanceId, src, altText]);

  const onOpen = () => {
    if (ctx) ctx.open(instanceId);
  };

  return (
    <figure
      className={`togstrek-place-mdx-figure w-full ${inPhotoGallery ? "" : "my-[var(--tt-space-10)]"} ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="togstrek-mdx-image-lightbox-trigger group block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tt-surface-base"
        aria-label={altText ? `View larger: ${altText}` : "View larger image"}
      >
        <span className="togstrek-place-mdx-figure-frame relative block overflow-hidden rounded-none border border-tt-border-muted bg-tt-surface-muted">
          <Image
            src={src}
            alt={altText}
            width={safeW}
            height={safeH}
            sizes={
              inPhotoGallery
                ? "(max-width: 767px) 100vw, 50vw"
                : "(max-width: 768px) 100vw, min(42rem, 92vw)"
            }
            loading="lazy"
            unoptimized={togstrekUnoptimizedRemoteImageInDev(src)}
            className={`h-auto w-full object-contain ${inPhotoGallery ? "max-h-[min(52vh,440px)] md:max-h-[min(58vh,520px)]" : "max-h-[min(72vh,620px)]"}`}
          />
        </span>
      </button>
      {altText ? (
        <figcaption
          className={`mt-[var(--tt-space-3)] text-center font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary ${inPhotoGallery ? "line-clamp-2" : ""}`}
        >
          {altText}
        </figcaption>
      ) : null}
    </figure>
  );
});

TogstrekMdxImageLightbox.displayName = "TogstrekMdxImageLightbox";
