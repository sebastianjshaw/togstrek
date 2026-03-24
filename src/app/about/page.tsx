import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-[var(--tt-layout-max-prose)] flex-1 px-[var(--tt-layout-gutter)] py-[var(--tt-space-16)] [overflow-wrap:anywhere]">
      <h1 className="font-tt-display text-[length:var(--tt-text-display)] font-bold tracking-[var(--tt-tracking-tight)] text-tt-text-primary">
        About
      </h1>
      <p className="mt-[var(--tt-space-6)] font-tt-body text-tt-text-secondary">
        Content for this page will come from your Markdown migration. This route
        exists so the homepage &ldquo;About the tog&rdquo; link resolves during
        development.
      </p>
    </main>
  );
}
