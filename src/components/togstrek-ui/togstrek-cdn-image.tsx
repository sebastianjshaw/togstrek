import Image, { type ImageProps } from "next/image";

import {
  buildTogstrekCdnSrcSet,
  isTogstrekCdnImageResizeEnabled,
  isTogstrekMediaCdnUrl,
  pickTogstrekCdnFallbackWidth,
  togstrekCdnResizeUrl,
  TOGSTREK_CDN_IMAGE_SLOT_CONFIG,
  type TogstrekCdnImageSlot,
} from "@/lib/togstrek-cdn-image";
import { togstrekUnoptimizedRemoteImageInDev } from "@/lib/togstrek-dev-remote-image";

type TogstrekCdnImageBaseProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  loading?: ImageProps["loading"];
  "aria-hidden"?: boolean;
  /** When set, `sizes` and width ladder come from {@link TOGSTREK_CDN_IMAGE_SLOT_CONFIG}. */
  slot?: TogstrekCdnImageSlot;
  sizes?: string;
};

type TogstrekCdnImageFillProps = TogstrekCdnImageBaseProps & {
  fill: true;
  width?: never;
  height?: never;
};

type TogstrekCdnImageFixedProps = TogstrekCdnImageBaseProps & {
  fill?: false;
  width: number;
  height: number;
};

export type TogstrekCdnImageProps =
  | TogstrekCdnImageFillProps
  | TogstrekCdnImageFixedProps;

/**
 * Remote CDN images: optional Cloudflare `srcset` when resize is enabled; otherwise
 * defers to `next/image` with `unoptimized` (no Vercel image optimizer).
 */
export function TogstrekCdnImage(props: TogstrekCdnImageProps) {
  const {
    src,
    alt,
    className,
    priority,
    loading,
    slot,
    fill,
    width,
    height,
    sizes: sizesProp,
    "aria-hidden": ariaHidden,
  } = props;

  const slotConfig = slot ? TOGSTREK_CDN_IMAGE_SLOT_CONFIG[slot] : undefined;
  const sizes = sizesProp ?? slotConfig?.sizes ?? "100vw";
  const widths = slotConfig?.widths ?? [640, 960, 1280, 1920];

  const useResponsiveCdn =
    isTogstrekCdnImageResizeEnabled() && isTogstrekMediaCdnUrl(src);
  const srcSet = useResponsiveCdn
    ? buildTogstrekCdnSrcSet(src, widths)
    : undefined;

  if (!srcSet) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        priority={priority}
        loading={loading}
        unoptimized={togstrekUnoptimizedRemoteImageInDev(src)}
        className={className}
        aria-hidden={ariaHidden}
      />
    );
  }

  const fallbackW = pickTogstrekCdnFallbackWidth(widths);
  const fallbackSrc = togstrekCdnResizeUrl(src, fallbackW);

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- intentional CDN srcset (not Vercel optimizer)
      <img
        src={fallbackSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        aria-hidden={ariaHidden}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : (loading ?? "lazy")}
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- intentional CDN srcset (not Vercel optimizer)
    <img
      src={fallbackSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      aria-hidden={ariaHidden}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      loading={priority ? "eager" : (loading ?? "lazy")}
      className={className}
    />
  );
}
