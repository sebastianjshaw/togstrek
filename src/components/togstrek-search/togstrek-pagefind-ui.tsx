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

export function TogstrekPagefindUi() {
  const inputId = useMemo(() => "togstrek-search-input", []);
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
                url: d.url,
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
      <input
        id={inputId}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Try “Kungsleden”, “Istanbul”, “Tulum”…"
        spellCheck={false}
        className="togstrek-search-input mt-[var(--tt-space-3)] w-full rounded-[var(--tt-radius-md)] border border-tt-border-muted bg-tt-surface-base px-4 py-3 font-tt-body text-[length:var(--tt-text-body)] text-tt-text-primary shadow-sm outline-none placeholder:text-tt-text-tertiary focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tt-surface-base"
      />

      <div
        className="mt-[var(--tt-space-3)] min-h-5 font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary"
        aria-live="polite"
      >
        {isLoading ? "Loading search…" : status}
      </div>

      {results.length > 0 ? (
        <ul className="togstrek-search-results mt-[var(--tt-space-6)] space-y-4">
          {results.map((r) => (
            <li
              key={r.url}
              className="togstrek-search-result rounded-[var(--tt-radius-lg)] border border-tt-border-muted bg-tt-surface-base p-4 transition-colors hover:border-tt-accent/40"
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
      ) : null}
    </div>
  );
}
