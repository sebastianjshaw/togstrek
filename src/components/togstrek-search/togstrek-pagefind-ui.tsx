"use client";

import "@pagefind/default-ui/css/ui.css";

import { useEffect, useRef } from "react";

/**
 * Client-only Pagefind default UI. Index lives at `public/pagefind/` after
 * `npm run build` (or `npm run pagefind:index`).
 */
export function TogstrekPagefindUi() {
  const containerRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    void import("@pagefind/default-ui").then(({ PagefindUI }) => {
      if (cancelled || !containerRef.current) return;
      uiRef.current = new PagefindUI({
        element: containerRef.current,
        bundlePath: "/pagefind/",
        showImages: false,
        showSubResults: true,
        resetStyles: false,
        excerptLength: 16,
        debounceTimeoutMs: 200,
      });
    });

    return () => {
      cancelled = true;
      try {
        uiRef.current?.destroy();
      } catch {
        /* ignore teardown errors */
      }
      uiRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="togstrek-search-pagefind-ui-root min-h-[2.75rem]"
    />
  );
}
