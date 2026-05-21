import type { Metadata } from "next";

import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { togstrekMainLandmarkProps } from "@/lib/togstrek-main-landmark";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";

const COPYRIGHT_DESCRIPTION =
  "Copyright and usage notes for text and photographs published on A Tog’s Trek.";

export const metadata: Metadata = buildTogstrekMetadata({
  title: "Copyright",
  description: COPYRIGHT_DESCRIPTION,
  path: "/copyright",
});

export default function CopyrightPage() {
  return (
    <main
      {...togstrekMainLandmarkProps}
      className="togstrek-copyright-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]"
    >
      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekPageTitle id="togstrek-copyright-title">
          Copyright
        </TogstrekPageTitle>
        <p className="togstrek-copyright-lead mt-[var(--tt-space-8)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          {COPYRIGHT_DESCRIPTION}
        </p>
        <p className="togstrek-copyright-body mt-[var(--tt-space-6)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          Unless otherwise noted, original text and photographs on this site are
          © Sebastian Shaw. All rights reserved. Please do not reproduce or
          redistribute images or long excerpts without permission; short quotes
          with attribution and a link back to the relevant page are welcome.
        </p>
        <p className="togstrek-copyright-body mt-[var(--tt-space-6)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          Third-party logos, map data, and embedded services remain the property
          of their respective owners and are used only where the site’s
          functionality requires them.
        </p>
      </TogstrekContentWidth>
    </main>
  );
}
