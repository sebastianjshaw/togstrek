import Link from "next/link";

import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";

const togstrekSiteFooterNavLinkClassName =
  "rounded-sm font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary underline-offset-2 transition-colors hover:text-tt-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tt-surface-base";

export function TogstrekSiteFooter() {
  return (
    <footer className="togstrek-site-footer border-t border-tt-border-muted bg-tt-surface-base py-[max(var(--tt-space-12),env(safe-area-inset-bottom))]">
      <TogstrekContentWidth max="content">
        <nav
          className="togstrek-site-footer-nav flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6"
          aria-label="Footer"
        >
          <Link href="/about" className={togstrekSiteFooterNavLinkClassName}>
            About
          </Link>
          <span
            className="select-none text-[length:var(--tt-text-small)] text-tt-text-tertiary/80"
            aria-hidden
          >
            ·
          </span>
          <Link href="/hiking" className={togstrekSiteFooterNavLinkClassName}>
            Hiking
          </Link>
          <span
            className="select-none text-[length:var(--tt-text-small)] text-tt-text-tertiary/80"
            aria-hidden
          >
            ·
          </span>
          <Link href="/photography" className={togstrekSiteFooterNavLinkClassName}>
            Photography
          </Link>
          <span
            className="select-none text-[length:var(--tt-text-small)] text-tt-text-tertiary/80"
            aria-hidden
          >
            ·
          </span>
          <Link href="/search" className={togstrekSiteFooterNavLinkClassName}>
            Search
          </Link>
          <span
            className="select-none text-[length:var(--tt-text-small)] text-tt-text-tertiary/80"
            aria-hidden
          >
            ·
          </span>
          <Link href="/copyright" className={togstrekSiteFooterNavLinkClassName}>
            Usage & copyright
          </Link>
        </nav>
        <p className="mt-[var(--tt-space-6)] text-center font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary [overflow-wrap:anywhere]">
          Unless noted, photographs and text © Sebastian Shaw
        </p>
      </TogstrekContentWidth>
    </footer>
  );
}
