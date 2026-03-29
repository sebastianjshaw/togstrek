import type { Metadata } from "next";

import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";

const CONTACT_DESCRIPTION =
  "How to reach the person behind Tog’s Trek — questions about places, hikes, photography, or broken links on the site.";

export const metadata: Metadata = buildTogstrekMetadata({
  title: "Contact",
  description: CONTACT_DESCRIPTION,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="togstrek-contact-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekPageTitle id="togstrek-contact-title">Contact</TogstrekPageTitle>
        <p className="togstrek-contact-lead mt-[var(--tt-space-8)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          {CONTACT_DESCRIPTION}
        </p>
        <p className="togstrek-contact-body mt-[var(--tt-space-6)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          The fastest way to get in touch is usually the channel you already use to
          follow the project (for example the site’s linked social profiles from
          the footer or About page). If you are reporting a technical problem,
          include the page URL and what you expected to happen.
        </p>
      </TogstrekContentWidth>
    </main>
  );
}
