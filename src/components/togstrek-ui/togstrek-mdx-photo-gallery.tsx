"use client";

import { createContext, useContext, type ReactNode } from "react";

const TogstrekMdxPhotoGalleryContext = createContext(false);

export function useTogstrekMdxPhotoGallery(): boolean {
  return useContext(TogstrekMdxPhotoGalleryContext);
}

export type TogstrekMdxPhotoGalleryProps = {
  children: ReactNode;
};

/** MDX: wrap consecutive `![alt](url)` blocks for a 2-col grid (md+) + shared lightbox. */
export function TogstrekMdxPhotoGallery({ children }: TogstrekMdxPhotoGalleryProps) {
  return (
    <TogstrekMdxPhotoGalleryContext.Provider value={true}>
      <div
        className="togstrek-mdx-photo-gallery-wrap w-full min-w-0 max-w-none"
        role="group"
        aria-label="Photo gallery"
      >
        {children}
      </div>
    </TogstrekMdxPhotoGalleryContext.Provider>
  );
}
