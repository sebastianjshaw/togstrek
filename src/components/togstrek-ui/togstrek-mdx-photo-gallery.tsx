"use client";

import { Children, createContext, useContext, type ReactNode } from "react";

export type TogstrekMdxPhotoGalleryLayout = "default" | "dense";

type TogstrekMdxPhotoGalleryContextValue = {
  inGallery: boolean;
  layout: TogstrekMdxPhotoGalleryLayout;
};

const togstrekMdxPhotoGalleryContextDefault: TogstrekMdxPhotoGalleryContextValue =
  { inGallery: false, layout: "default" };

const TogstrekMdxPhotoGalleryContext =
  createContext<TogstrekMdxPhotoGalleryContextValue>(
    togstrekMdxPhotoGalleryContextDefault,
  );

export function useTogstrekMdxPhotoGallery(): boolean {
  return useContext(TogstrekMdxPhotoGalleryContext).inGallery;
}

export function useTogstrekMdxPhotoGalleryLayout(): TogstrekMdxPhotoGalleryLayout {
  return useContext(TogstrekMdxPhotoGalleryContext).layout;
}

export type TogstrekMdxPhotoGalleryProps = {
  children: ReactNode;
  /**
   * `dense` — more columns on large viewports + shorter thumbnails for long sets
   * (e.g. 12+ images). Use with explicit `<PhotoGallery layout="dense">` in MDX.
   */
  layout?: TogstrekMdxPhotoGalleryLayout | string;
};

function normalizeLayout(
  raw: TogstrekMdxPhotoGalleryProps["layout"],
): TogstrekMdxPhotoGalleryLayout {
  return raw === "dense" ? "dense" : "default";
}

/** Count real image entries, ignoring the whitespace text nodes MDX leaves between them. */
function countGalleryItems(children: ReactNode): number {
  return Children.toArray(children).filter((child) => {
    if (child == null) return false;
    if (typeof child === "string") return child.trim() !== "";
    return true;
  }).length;
}

/** MDX: wrap consecutive `![alt](url)` blocks for a grid + shared lightbox. */
export function TogstrekMdxPhotoGallery({
  children,
  layout: layoutProp,
}: TogstrekMdxPhotoGalleryProps) {
  const layout = normalizeLayout(layoutProp);
  /**
   * `default` layout only ever reaches 2 columns, so exactly 3 images wrap
   * 2-then-1. At desktop width they should read as one row of three instead.
   * `dense` already opens a 3-column track at `lg`, so it needs no help.
   */
  const isTriad = layout === "default" && countGalleryItems(children) === 3;
  const wrapClass = [
    "togstrek-mdx-photo-gallery-wrap",
    layout === "dense" ? "togstrek-mdx-photo-gallery-wrap--dense" : "",
    isTriad ? "togstrek-mdx-photo-gallery-wrap--triad" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TogstrekMdxPhotoGalleryContext.Provider
      value={{ inGallery: true, layout }}
    >
      <div
        className={`${wrapClass} w-full min-w-0 max-w-none`}
        role="group"
        aria-label="Photo gallery"
      >
        {children}
      </div>
    </TogstrekMdxPhotoGalleryContext.Provider>
  );
}
