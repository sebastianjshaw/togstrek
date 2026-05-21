import { getTogstrekMediaBaseUrl } from "@/config/togstrek-media";

/** Widths emitted in `srcset` when CDN resize is enabled (keep in sync with layout slots). */
export const TOGSTREK_CDN_SRCSET_WIDTHS = [
  384, 480, 640, 768, 960, 1200, 1440, 1536, 1920,
] as const;

export type TogstrekCdnImageSlot =
  | "hero"
  | "heroArticle"
  | "regionFeatured"
  | "regionGrid"
  | "regionCompact"
  | "editorialCard"
  | "adventureFeatured"
  | "adventurePanel"
  | "adventureCard"
  | "megaFeatured"
  | "megaCard"
  | "mdxInline"
  | "mdxGallery"
  | "mdxGalleryDense"
  | "aboutColumn"
  | "aboutColumnNarrow"
  | "hikingHub"
  | "hikingHubCard"
  | "otherWorkCard"
  | "photographyCard"
  | "photographyHub";

/**
 * `sizes` + width ladder per UI slot — documents expected CDN bytes when
 * `NEXT_PUBLIC_CDN_IMAGE_RESIZE=true` (Cloudflare `/cdn-cgi/image/` on the media zone).
 */
export const TOGSTREK_CDN_IMAGE_SLOT_CONFIG: Record<
  TogstrekCdnImageSlot,
  { sizes: string; widths: readonly number[] }
> = {
  hero: {
    sizes: "100vw",
    widths: [640, 960, 1280, 1536, 1920],
  },
  heroArticle: {
    sizes: "100vw",
    widths: [640, 960, 1280, 1536, 1920],
  },
  regionFeatured: {
    sizes: "(max-width: 768px) 100vw, 90rem",
    widths: [640, 960, 1200, 1440],
  },
  regionGrid: {
    sizes: "(max-width: 768px) 100vw, 50vw",
    widths: [480, 640, 768, 960, 1200],
  },
  regionCompact: {
    sizes: "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
    widths: [384, 480, 640, 768, 960],
  },
  editorialCard: {
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    widths: [384, 480, 640, 768, 960, 1200],
  },
  adventureFeatured: {
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    widths: [384, 480, 640, 768, 960, 1200],
  },
  adventurePanel: {
    sizes: "(max-width: 768px) 100vw, 42vw",
    widths: [480, 640, 768, 960, 1200],
  },
  adventureCard: {
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    widths: [384, 480, 640, 768, 960],
  },
  megaFeatured: {
    sizes: "(max-width: 1024px) 40vw, 22rem",
    widths: [480, 640, 768, 960],
  },
  megaCard: {
    sizes: "(max-width: 768px) 100vw, 33vw",
    widths: [480, 640, 768, 960],
  },
  hikingHubCard: {
    sizes: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
    widths: [384, 480, 640, 768, 960],
  },
  mdxInline: {
    sizes: "(max-width: 768px) 100vw, min(42rem, 92vw)",
    widths: [480, 640, 768, 960, 1200],
  },
  mdxGallery: {
    sizes: "(max-width: 767px) 100vw, 50vw",
    widths: [480, 640, 768, 960, 1200],
  },
  mdxGalleryDense: {
    sizes:
      "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 34vw, 26vw",
    widths: [384, 480, 640, 768, 960],
  },
  aboutColumn: {
    sizes: "(max-width: 768px) 100vw, 58vw",
    widths: [480, 640, 768, 960, 1200],
  },
  aboutColumnNarrow: {
    sizes: "(max-width: 768px) 100vw, 42vw",
    widths: [480, 640, 768, 960],
  },
  hikingHub: {
    sizes: "100vw",
    widths: [640, 960, 1280, 1536],
  },
  otherWorkCard: {
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw",
    widths: [384, 480, 640, 768],
  },
  photographyCard: {
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    widths: [384, 480, 640, 768, 960],
  },
  photographyHub: {
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 18vw",
    widths: [384, 480, 640, 768],
  },
};

export function isTogstrekCdnImageResizeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CDN_IMAGE_RESIZE === "true";
}

export function isTogstrekMediaCdnUrl(src: string): boolean {
  if (!src.startsWith("http://") && !src.startsWith("https://")) return false;
  try {
    const base = new URL(getTogstrekMediaBaseUrl());
    return new URL(src).hostname === base.hostname;
  } catch {
    return false;
  }
}

/**
 * Cloudflare Image Resizing URL (requires Image Resizing on the `media.*` zone).
 * @see https://developers.cloudflare.com/images/transform-images/transform-via-url/
 */
export function togstrekCdnResizeUrl(
  src: string,
  width: number,
  options?: { quality?: number },
): string {
  const url = new URL(src);
  const quality = options?.quality ?? 85;
  const path = url.pathname.replace(/^\//, "");
  return `${url.origin}/cdn-cgi/image/width=${width},quality=${quality},format=auto/${path}`;
}

export function buildTogstrekCdnSrcSet(
  src: string,
  widths: readonly number[],
): string | undefined {
  if (!isTogstrekCdnImageResizeEnabled() || !isTogstrekMediaCdnUrl(src)) {
    return undefined;
  }
  const capped = widths.filter((w) => w > 0 && w <= 3840);
  if (capped.length === 0) return undefined;
  return capped
    .map((w) => `${togstrekCdnResizeUrl(src, w)} ${w}w`)
    .join(", ");
}

export function pickTogstrekCdnFallbackWidth(
  widths: readonly number[],
): number {
  return widths[widths.length - 1] ?? 1920;
}
