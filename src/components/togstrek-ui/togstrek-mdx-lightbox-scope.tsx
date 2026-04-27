"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type TogstrekMdxLightboxEntry = {
  id: string;
  src: string;
  alt: string;
};

type TogstrekMdxLightboxContextValue = {
  register: (entry: TogstrekMdxLightboxEntry) => () => void;
  open: (id: string) => void;
};

const TogstrekMdxLightboxContext =
  createContext<TogstrekMdxLightboxContextValue | null>(null);

export function useTogstrekMdxLightbox(): TogstrekMdxLightboxContextValue | null {
  return useContext(TogstrekMdxLightboxContext);
}

/**
 * Wraps MDX article content so inline images can open a shared fullscreen lightbox
 * with keyboard (Escape, arrows) and prev/next when multiple images exist.
 */
const clientMountedSubscribe = () => () => {};
function clientMountedSnapshot() {
  return true;
}
function clientMountedServerSnapshot() {
  return false;
}

export function TogstrekMdxLightboxScope({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<TogstrekMdxLightboxEntry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    clientMountedSubscribe,
    clientMountedSnapshot,
    clientMountedServerSnapshot,
  );
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const focusBeforeOpenRef = useRef<HTMLElement | null>(null);
  const prevOpenIdRef = useRef<string | null>(null);
  const dialogTitleId = useId();

  const register = useCallback((entry: TogstrekMdxLightboxEntry) => {
    setEntries((prev) => [...prev, entry]);
    return () => {
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      setOpenId((cur) => (cur === entry.id ? null : cur));
    };
  }, []);

  const open = useCallback((id: string) => setOpenId(id), []);

  const value = useMemo(
    () => ({ register, open }),
    [register, open],
  );

  const resolvedOpenId = useMemo((): string | null => {
    if (openId == null) return null;
    return entries.some((e) => e.id === openId) ? openId : null;
  }, [openId, entries]);

  const activeIdx = resolvedOpenId
    ? entries.findIndex((e) => e.id === resolvedOpenId)
    : -1;
  const active = activeIdx >= 0 ? entries[activeIdx] : null;
  const canPrev = activeIdx > 0;
  const canNext = activeIdx >= 0 && activeIdx < entries.length - 1;

  const close = useCallback(() => setOpenId(null), []);

  const goPrev = useCallback(() => {
    if (!canPrev) return;
    setOpenId(entries[activeIdx - 1]!.id);
  }, [entries, activeIdx, canPrev]);

  const goNext = useCallback(() => {
    if (!canNext) return;
    setOpenId(entries[activeIdx + 1]!.id);
  }, [entries, activeIdx, canNext]);

  useEffect(() => {
    const wasOpen = prevOpenIdRef.current !== null;
    const nowOpen = resolvedOpenId !== null;
    prevOpenIdRef.current = resolvedOpenId;

    if (nowOpen && !wasOpen) {
      focusBeforeOpenRef.current = document.activeElement as HTMLElement | null;
      closeButtonRef.current?.focus();
    } else if (!nowOpen && wasOpen) {
      focusBeforeOpenRef.current?.focus?.();
      focusBeforeOpenRef.current = null;
    }
  }, [resolvedOpenId]);

  useEffect(() => {
    if (!resolvedOpenId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [resolvedOpenId, close, goPrev, goNext]);

  const overlay =
    mounted &&
    active &&
    createPortal(
      <div
        className="togstrek-mdx-lightbox-overlay fixed inset-0 z-[10050] flex flex-col items-center justify-center bg-black/88 p-[var(--tt-space-4)] backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        onClick={close}
      >
        <h2 id={dialogTitleId} className="sr-only">
          Image viewer
        </h2>
        <button
          ref={closeButtonRef}
          type="button"
          className="togstrek-mdx-lightbox-overlay-close absolute right-[var(--tt-space-4)] top-[var(--tt-space-4)] z-[2] rounded-[var(--tt-radius-sm)] border border-white/20 bg-white/10 px-[var(--tt-space-3)] py-[var(--tt-space-2)] font-tt-body text-[length:var(--tt-text-small)] text-white transition-colors hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
        >
          Close
        </button>

        {entries.length > 1 ? (
          <>
            <button
              type="button"
              disabled={!canPrev}
              className="togstrek-mdx-lightbox-overlay-nav togstrek-mdx-lightbox-overlay-nav-prev absolute left-[var(--tt-space-2)] top-1/2 z-[2] -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-[var(--tt-space-3)] text-white shadow-lg transition-colors hover:bg-black/60 disabled:pointer-events-none disabled:opacity-30 sm:left-[var(--tt-space-6)]"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
            >
              <span aria-hidden className="block text-lg leading-none">
                ‹
              </span>
            </button>
            <button
              type="button"
              disabled={!canNext}
              className="togstrek-mdx-lightbox-overlay-nav togstrek-mdx-lightbox-overlay-nav-next absolute right-[var(--tt-space-2)] top-1/2 z-[2] -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-[var(--tt-space-3)] text-white shadow-lg transition-colors hover:bg-black/60 disabled:pointer-events-none disabled:opacity-30 sm:right-[var(--tt-space-6)]"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
            >
              <span aria-hidden className="block text-lg leading-none">
                ›
              </span>
            </button>
          </>
        ) : null}

        <div
          className="togstrek-mdx-lightbox-overlay-inner relative z-[1] flex max-h-[100dvh] w-full max-w-[min(100vw,1400px)] flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- fullscreen arbitrary remote URLs */}
          <img
            src={active.src}
            alt={active.alt || ""}
            className="togstrek-mdx-lightbox-overlay-img max-h-[min(100dvh,900px)] w-auto max-w-full object-contain"
          />
          {active.alt ? (
            <p
              aria-hidden
              className="togstrek-mdx-lightbox-overlay-caption mt-[var(--tt-space-4)] max-w-2xl text-center font-tt-body text-[length:var(--tt-text-small)] text-white/85"
            >
              {active.alt}
            </p>
          ) : null}
          {entries.length > 1 ? (
            <p
              aria-live="polite"
              aria-atomic="true"
              className="togstrek-mdx-lightbox-overlay-count mt-2 font-tt-body text-[length:var(--tt-text-small)] text-white/55"
            >
              {activeIdx + 1} / {entries.length}
            </p>
          ) : null}
        </div>
      </div>,
      document.body,
    );

  return (
    <TogstrekMdxLightboxContext.Provider value={value}>
      {children}
      {overlay}
    </TogstrekMdxLightboxContext.Provider>
  );
}
