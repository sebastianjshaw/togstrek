"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type PagefindSearchResult = {
  id: string;
  data: () => Promise<{
    url: string;
    meta?: { title?: string };
    excerpt?: string;
  }>;
};

type PagefindApi = {
  options: (opts: Record<string, unknown>) => Promise<void>;
  search: (term: string) => Promise<{
    results: PagefindSearchResult[];
  }>;
  destroy?: () => void;
};

const PAGEFIND_BUNDLE_PATH = "/pagefind/pagefind.js";
const TOGSTREK_SEARCH_RESULTS_LIMIT = 20;

function stripHtml(input: string): string {
  return input.replaceAll(/<[^>]*>/g, "").trim();
}

function normalizeInternalHref(rawUrl: string): string {
  const input = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (!input) return "/";

  // Pagefind may surface legacy URLs with `.html`; normalize to the app routes.
  // Examples:
  // - `/europe/sweden/skane.html` -> `/europe/sweden/skane`
  // - `https://www.togstrek.com/europe/sweden/skane.html` -> `/europe/sweden/skane`
  try {
    const parsed = input.startsWith("http") ? new URL(input) : new URL(input, "https://togstrek.com");
    // Be resilient: some legacy inventories include `.html/` (or other oddities) and
    // Pagefind may preserve them. Strip `.html` at the end of a path segment.
    const pathname = parsed.pathname
      .replace(/\.html?(?=\/$)/i, "")
      .replace(/\.html?$/i, "");
    const search = parsed.search || "";
    const hash = parsed.hash || "";
    return `${pathname}${search}${hash}`;
  } catch {
    return input
      .replace(/\.html?(?=\/$)/i, "")
      .replace(/\.html?$/i, "");
  }
}

export function TogstrekPagefindUi() {
  const inputId = useMemo(() => "togstrek-search-input", []);
  const hintId = useMemo(() => "togstrek-search-hint", []);
  const statusId = useMemo(() => "togstrek-search-status", []);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<
    { url: string; title: string; excerpt?: string }[]
  >([]);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [status, setStatus] = useState<string | null>(null);
  const apiRef = useRef<PagefindApi | null>(null);
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const onUnhandledRejection = (evt: PromiseRejectionEvent) => {
      const msg =
        typeof evt.reason === "string"
          ? evt.reason
          : (evt.reason as { message?: string } | null | undefined)?.message;
      if (msg?.includes("Cannot find module '/pagefind/pagefind.js'")) {
        evt.preventDefault();
        setIsUnavailable(true);
        setIsLoading(false);
      }
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    setIsLoading(true);
    setStatus(null);

    const init = async () => {
      try {
        // `webpackIgnore` is important: this file only exists after indexing.
        const mod = (await import(
          /* webpackIgnore: true */ PAGEFIND_BUNDLE_PATH
        )) as PagefindApi;
        if (cancelled) return;
        apiRef.current = mod;
        await mod.options({
          excerptLength: 22,
        });
        if (cancelled) return;
        setIsLoading(false);
      } catch {
        if (cancelled) return;
        setIsUnavailable(true);
        setIsLoading(false);
      }
    };

    void init();

    return () => {
      cancelled = true;
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      try {
        apiRef.current?.destroy?.();
      } catch {
        /* ignore teardown errors */
      }
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isUnavailable || isLoading) return;
    const api = apiRef.current;
    if (!api) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    const trimmed = term.trim();
    if (!trimmed) {
      setResults([]);
      setTotalMatches(0);
      setStatus(null);
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      void (async () => {
        try {
          setStatus("Searching…");
          const search = await api.search(trimmed);
          const total = search.results.length;
          setTotalMatches(total);
          const enriched = await Promise.all(
            search.results.slice(0, TOGSTREK_SEARCH_RESULTS_LIMIT).map(async (r) => {
              const d = await r.data();
              const title =
                d.meta?.title?.trim() ||
                stripHtml(d.excerpt ?? "").slice(0, 64) ||
                d.url;
              return {
                url: normalizeInternalHref(d.url),
                title,
                excerpt: d.excerpt ? stripHtml(d.excerpt) : undefined,
              };
            }),
          );
          setResults(enriched);
          if (total > TOGSTREK_SEARCH_RESULTS_LIMIT) {
            setStatus(
              `Showing ${TOGSTREK_SEARCH_RESULTS_LIMIT} of ${total} results — refine your search to narrow it down.`,
            );
          } else {
            setStatus(`${total} result${total === 1 ? "" : "s"}`);
          }
        } catch {
          setStatus("Search failed. Please try again.");
        }
      })();
    }, 180);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [term, isLoading, isUnavailable]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditableTarget =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // Quick-focus search (like many editorial sites): press `/` from anywhere.
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isEditableTarget) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      // Escape clears the current term when focus is in the search input.
      if (e.key === "Escape" && target === inputRef.current) {
        if (term.trim()) {
          e.preventDefault();
          setTerm("");
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [term]);

  const suggestionTerms = useMemo(
    () => ["Kungsleden", "Istanbul", "Tulum", "Bohusleden", "street photography", "Svalbard"],
    [],
  );

  if (isUnavailable) {
    return (
      <div className="togstrek-search-pagefind-unavailable rounded-[var(--tt-radius-lg)] border border-tt-border-muted bg-tt-surface-muted/60 px-[var(--tt-space-6)] py-[var(--tt-space-6)]">
        <p className="font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          Search isn’t available right now.
        </p>
        <p className="mt-[var(--tt-space-2)] font-tt-body text-[length:var(--tt-text-small)] leading-[var(--tt-leading-relaxed)] text-tt-text-tertiary">
          If you’re visiting the live site, try again in a moment. If you’re
          running the site locally, the search index may not have been generated
          yet.
        </p>
        <details className="mt-[var(--tt-space-4)]">
          <summary className="cursor-pointer select-none font-tt-body text-[length:var(--tt-text-small)] font-semibold text-tt-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tt-surface-base rounded-sm">
            Local setup hint
          </summary>
          <div className="mt-[var(--tt-space-3)] rounded-[var(--tt-radius-md)] border border-tt-border-muted bg-tt-surface-base px-4 py-3">
            <code className="block font-mono text-[0.9em] text-tt-text-secondary">
              npm run build
            </code>
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="togstrek-search-pagefind-ui-root">
      <label
        htmlFor={inputId}
        className="block font-tt-body text-[length:var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-tertiary"
      >
        Search
      </label>
      <p
        id={hintId}
        className="mt-[var(--tt-space-2)] font-tt-body text-[length:var(--tt-text-small)] leading-[var(--tt-leading-relaxed)] text-tt-text-tertiary"
      >
        Tip: press{" "}
        <kbd className="inline-flex items-center rounded-[var(--tt-radius-sm)] border border-tt-border-muted bg-tt-surface-base px-2 py-0.5 font-tt-mono text-[0.92em] text-tt-text-secondary shadow-[var(--tt-shadow-sm)]">
          /
        </kbd>{" "}
        to jump here,{" "}
        <kbd className="inline-flex items-center rounded-[var(--tt-radius-sm)] border border-tt-border-muted bg-tt-surface-base px-2 py-0.5 font-tt-mono text-[0.92em] text-tt-text-secondary shadow-[var(--tt-shadow-sm)]">
          Esc
        </kbd>{" "}
        to clear.
      </p>
      <input
        id={inputId}
        ref={inputRef}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Try “Kungsleden”, “Istanbul”, “Tulum”…"
        spellCheck={false}
        aria-describedby={`${hintId} ${statusId}`}
        className="togstrek-search-input mt-[var(--tt-space-3)] w-full rounded-[var(--tt-radius-md)] border border-tt-border-muted bg-tt-surface-base px-4 py-3 font-tt-body text-[length:var(--tt-text-body)] text-tt-text-primary shadow-sm outline-none placeholder:text-tt-text-tertiary transition-[border-color,box-shadow,transform] duration-[var(--tt-duration-fast)] ease-[var(--tt-ease-out)] focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tt-surface-base motion-safe:focus-visible:-translate-y-px"
      />

      <div
        id={statusId}
        className="mt-[var(--tt-space-3)] min-h-5 font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary"
        aria-live="polite"
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-tt-accent/70 motion-safe:animate-pulse" />
            Loading search…
          </span>
        ) : (
          status
        )}
      </div>

      {results.length > 0 ? (
        <ul className="togstrek-search-results mt-[var(--tt-space-6)] space-y-4">
          {results.map((r) => (
            <li
              key={r.url}
              className="togstrek-search-result rounded-[var(--tt-radius-lg)] border border-tt-border-muted bg-tt-surface-base p-4 transition-[border-color,box-shadow,transform] duration-[var(--tt-duration-normal)] ease-[var(--tt-ease-out)] hover:border-tt-accent/40 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--tt-shadow-elevated)]"
            >
              <Link
                href={r.url}
                className="togstrek-search-result-title font-tt-display text-[length:var(--tt-text-lead)] font-bold leading-[var(--tt-leading-snug)] text-tt-text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tt-surface-base rounded-sm"
              >
                {r.title}
              </Link>
              {r.excerpt ? (
                <p className="togstrek-search-result-excerpt mt-[var(--tt-space-2)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
                  {r.excerpt}
                </p>
              ) : null}
              <p className="togstrek-search-result-url mt-[var(--tt-space-2)] font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary [overflow-wrap:anywhere]">
                {r.url}
              </p>
            </li>
          ))}
        </ul>
      ) : term.trim() && !isLoading ? (
        <div className="togstrek-search-empty mt-[var(--tt-space-6)] rounded-[var(--tt-radius-lg)] border border-tt-border-muted bg-tt-surface-muted/60 px-[var(--tt-space-6)] py-[var(--tt-space-6)]">
          <p className="font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
            Nothing matched <span className="font-semibold text-tt-text-primary">“{term.trim()}”</span>.
          </p>
          <p className="mt-[var(--tt-space-2)] font-tt-body text-[length:var(--tt-text-small)] leading-[var(--tt-leading-relaxed)] text-tt-text-tertiary">
            Try a place name, a trail, or a topic — these usually work well:
          </p>
          <ul className="mt-[var(--tt-space-4)] flex flex-wrap gap-2">
            {suggestionTerms.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => {
                    setTerm(t);
                    inputRef.current?.focus();
                  }}
                  className="togstrek-search-empty-suggestion inline-flex items-center rounded-full border border-tt-border-muted bg-tt-surface-base px-3 py-1 font-tt-body text-[length:var(--tt-text-small)] text-tt-text-secondary transition-[border-color,transform,box-shadow] duration-[var(--tt-duration-fast)] ease-[var(--tt-ease-out)] hover:border-tt-accent/40 motion-safe:hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tt-surface-muted/60"
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
