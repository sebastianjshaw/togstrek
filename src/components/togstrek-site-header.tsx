import Image from "next/image";
import Link from "next/link";

import { TogstrekSiteHeaderPrimaryNav } from "@/components/togstrek-site-header-primary-nav";
import {
  buildTogstrekMegaMenuLinksForNavContinents,
  getTogstrekContinentMegaMenuTaglinesForNav,
  togstrekMegaMenuAdventureLinks,
} from "@/data/togstrek-continent-mega-menu";

const togstrekHeaderMegaMenuNavLinks =
  buildTogstrekMegaMenuLinksForNavContinents();
const togstrekHeaderMegaMenuTaglines =
  getTogstrekContinentMegaMenuTaglinesForNav();

export function TogstrekSiteHeader() {
  return (
    <header className="togstrek-site-header sticky top-0 z-50 border-b border-tt-border-muted bg-tt-surface-base/90 backdrop-blur-md">
      <div className="togstrek-site-header-inner mx-auto flex h-[var(--tt-layout-header-height)] max-w-[var(--tt-layout-max-wide)] items-center justify-between gap-2 px-[var(--tt-layout-gutter)] sm:gap-4">
        <Link
          href="/"
          className="togstrek-site-header-brand group flex min-w-0 shrink items-center gap-2 sm:gap-3"
        >
          <Image
            src="/brand/togstrek-logo.png"
            alt="A Tog's Trek"
            width={48}
            height={48}
            className="h-9 w-9 shrink-0 object-contain transition-transform duration-[var(--tt-duration-normal)] ease-[var(--tt-ease-out)] group-hover:scale-[1.03] sm:h-10 sm:w-10"
            priority
          />
          <span className="togstrek-site-header-title truncate font-tt-display text-[1rem] font-semibold tracking-[var(--tt-tracking-tight)] text-tt-text-primary sm:text-[1.05rem] md:text-[1.15rem]">
            A Tog&apos;s Trek
          </span>
        </Link>

        <TogstrekSiteHeaderPrimaryNav
          megaMenuNavLinks={togstrekHeaderMegaMenuNavLinks}
          megaMenuTaglines={togstrekHeaderMegaMenuTaglines}
          adventureLinks={togstrekMegaMenuAdventureLinks}
        />
      </div>
    </header>
  );
}
