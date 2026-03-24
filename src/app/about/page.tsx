import type { Metadata } from "next";

import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { TOGSTREK_PAGE_SECTION_Y } from "@/lib/togstrek-layout";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      <TogstrekContentWidth max="prose" className={TOGSTREK_PAGE_SECTION_Y}>
        <TogstrekPageTitle>About</TogstrekPageTitle>
        <p className="mt-[var(--tt-space-6)] font-tt-body text-tt-text-secondary">
          Content for this page will come from your Markdown migration. This route
          exists so the homepage &ldquo;About the tog&rdquo; link resolves during
          development.
        </p>
      </TogstrekContentWidth>
    </main>
  );
}
