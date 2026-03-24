"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { TogstrekSiteHeaderAdventuresMegaPanel } from "@/components/togstrek-site-header-adventures-mega-panel";
import type { TogstrekMegaMenuNavLinks } from "@/data/togstrek-continent-mega-menu";
import {
  togstrekContinentNavMegaItems,
  type TogstrekNavMegaContinentId,
} from "@/data/togstrek-continent-nav-mega-items";
import {
  togstrekAdventuresMegaFeaturedCards,
  togstrekAdventuresMegaTagline,
} from "@/data/togstrek-adventures-mega-menu";
import {
  togstrekSectionMegaMenuByKey,
  togstrekSectionMegaMenuList,
  type TogstrekSectionMegaAside,
  type TogstrekSectionMegaKey,
} from "@/data/togstrek-section-mega-menu";

const MEGA_CLOSE_MS = 200;

function isSectionMegaKey(
  key: OpenMegaKey,
): key is TogstrekSectionMegaKey {
  return key === "hiking" || key === "other-work";
}

type OpenMegaKey =
  | TogstrekNavMegaContinentId
  | TogstrekSectionMegaKey
  | "adventures";

/** Reusable expandable nav group for mobile menu. */
function MobileExpandableNavGroup({
  label,
  topHref,
  topLinkLabel,
  links,
  footer,
}: {
  label: string;
  topHref: string;
  topLinkLabel: string;
  links: { href: string; label: string }[];
  footer?: ReactNode;
}) {
  return (
    <li className="min-w-0">
      <details className="togstrek-site-header-mobile-nav-group rounded-tt-sm">
        <summary className="cursor-pointer list-none px-3 py-2 font-tt-display text-tt-small font-semibold text-tt-text-primary [&::-webkit-details-marker]:hidden">
          <span className="flex min-h-9 items-center justify-between gap-2">
            {label}
            <span className="text-tt-text-tertiary" aria-hidden={true}>+</span>
          </span>
        </summary>
        <ul className="border-t border-tt-border-muted bg-tt-surface-muted/60 py-1 pl-2 pr-1">
          <li>
            <Link
              href={topHref}
              className="block min-h-10 rounded-tt-sm px-2 py-2 text-tt-small font-semibold text-tt-accent [overflow-wrap:anywhere]"
            >
              {topLinkLabel}
            </Link>
          </li>
          {links.map((l) => (
            <li key={`${l.href}-${l.label}`}>
              <Link
                href={l.href}
                className="block min-h-10 rounded-tt-sm px-2 py-2 text-tt-small text-tt-text-secondary [overflow-wrap:anywhere] hover:bg-tt-surface-base hover:text-tt-accent"
              >
                {l.label}
              </Link>
            </li>
          ))}
          {footer}
        </ul>
      </details>
    </li>
  );
}

function TogstrekSiteHeaderMegaMenuPanelBase({
  panelHeading,
  tagline,
  links,
  ctaLabel,
  ctaHref,
  aside,
  emptyStateMessage,
  asideHeadingId,
  onNavigate,
}: {
  panelHeading: string;
  tagline: string;
  links: { href: string; label: string }[];
  ctaLabel: string;
  ctaHref: string;
  aside: TogstrekSectionMegaAside;
  emptyStateMessage: string;
  asideHeadingId: string;
  onNavigate: () => void;
}) {
  return (
    <div className="togstrek-site-header-mega-panel-inner mx-auto grid max-w-[var(--tt-layout-max-wide)] gap-10 px-tt-gutter py-tt-10 lg:grid-cols-[minmax(0,1fr)_min(14rem,28%)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_min(16rem,26%)]">
      <div className="togstrek-site-header-mega-panel-main min-w-0">
        <p className="font-tt-display text-tt-subhero font-extrabold uppercase leading-tt-tight tracking-tt-tight text-tt-text-primary [overflow-wrap:anywhere]">
          {panelHeading}
        </p>
        {tagline ? (
          <p className="mt-tt-4 max-w-[52ch] font-tt-body text-tt-small font-bold uppercase leading-tt-snug tracking-tt-wide text-tt-text-primary [overflow-wrap:anywhere]">
            {tagline}
          </p>
        ) : null}
        <div
          className="togstrek-site-header-mega-panel-divider my-tt-8 h-px w-full bg-tt-border-muted"
          aria-hidden={true}
        />
        {links.length > 0 ? (
          <ul className="togstrek-site-header-mega-panel-link-grid grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {links.map((l) => (
              <li key={`${l.href}-${l.label}`}>
                <Link
                  href={l.href}
                  onClick={onNavigate}
                  className="togstrek-site-header-mega-panel-grid-link block py-1 font-tt-body text-tt-small text-tt-text-secondary transition-colors hover:text-tt-accent [overflow-wrap:anywhere]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-tt-body text-tt-small text-tt-text-tertiary">
            {emptyStateMessage}
          </p>
        )}
        <div className="mt-tt-10 flex justify-center lg:justify-start">
          <Link
            href={ctaHref}
            onClick={onNavigate}
            className="inline-flex min-h-12 w-full min-w-0 max-w-xs items-center justify-center border-tt-thick border-tt-accent bg-transparent px-8 py-3 text-center font-tt-display text-tt-small font-semibold uppercase leading-tt-snug tracking-tt-wide text-tt-accent transition-colors duration-tt-normal hover:bg-tt-accent hover:text-tt-text-inverse sm:w-auto"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
      <aside
        className="togstrek-site-header-mega-panel-aside min-w-0 border-tt-border-muted lg:border-l lg:pl-10"
        aria-labelledby={asideHeadingId}
      >
        <h2
          id={asideHeadingId}
          className="font-tt-display text-tt-title font-bold text-tt-text-primary"
        >
          {aside.headingHref ? (
            <Link
              href={aside.headingHref}
              onClick={onNavigate}
              className="text-tt-text-primary transition-colors hover:text-tt-accent"
            >
              {aside.heading}
            </Link>
          ) : (
            aside.heading
          )}
        </h2>
        {aside.links.length > 0 ? (
          <ul className="mt-tt-6 space-y-tt-2">
            {aside.links.map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  onClick={onNavigate}
                  className="togstrek-site-header-mega-panel-aside-link block py-1 font-tt-body text-tt-small text-tt-text-secondary transition-colors hover:text-tt-accent [overflow-wrap:anywhere]"
                >
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </aside>
    </div>
  );
}

export type TogstrekSiteHeaderPrimaryNavProps = {
  megaMenuNavLinks: TogstrekMegaMenuNavLinks;
  megaMenuTaglines: Record<TogstrekNavMegaContinentId, string>;
  adventureLinks: { href: string; label: string }[];
};

export function TogstrekSiteHeaderPrimaryNav({
  megaMenuNavLinks,
  megaMenuTaglines,
  adventureLinks,
}: TogstrekSiteHeaderPrimaryNavProps) {
  const [openMegaKey, setOpenMegaKey] = useState<OpenMegaKey | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpenMegaKey(null);
      closeTimer.current = null;
    }, MEGA_CLOSE_MS);
  }, [cancelClose]);

  const openMega = useCallback(
    (id: OpenMegaKey) => {
      cancelClose();
      setOpenMegaKey(id);
    },
    [cancelClose],
  );

  const closeMega = useCallback(() => {
    cancelClose();
    setOpenMegaKey(null);
  }, [cancelClose]);

  useEffect(() => {
    if (!openMegaKey) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMega();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openMegaKey, closeMega]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  const openContinentItem = togstrekContinentNavMegaItems.find(
    (c) => c.continentId === openMegaKey,
  );

  const continentAside: TogstrekSectionMegaAside = {
    heading: "Adventures",
    links: adventureLinks,
  };

  const openSectionDef =
    openMegaKey && isSectionMegaKey(openMegaKey)
      ? togstrekSectionMegaMenuByKey[openMegaKey]
      : null;

  const panelVisible = openMegaKey !== null;

  return (
    <>
      <nav
        className="togstrek-site-header-primary-nav-desktop hidden lg:block"
        aria-label="Primary"
      >
        <ul className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-tt-small font-medium tracking-tt-wide">
          <li
            className="togstrek-site-header-mega-trigger relative"
            onMouseEnter={() => openMega("adventures")}
            onMouseLeave={scheduleClose}
          >
            <Link
              href="/adventures"
              className="text-tt-text-secondary transition-colors duration-tt-fast hover:text-tt-accent"
              aria-expanded={openMegaKey === "adventures"}
              aria-haspopup="true"
            >
              Adventures
            </Link>
          </li>
          {togstrekContinentNavMegaItems.map((item) => (
            <li
              key={item.href}
              className="togstrek-site-header-mega-trigger relative"
              onMouseEnter={() => openMega(item.continentId)}
              onMouseLeave={scheduleClose}
            >
              <Link
                href={item.href}
                className="text-tt-text-secondary transition-colors duration-tt-fast hover:text-tt-accent"
                aria-expanded={openMegaKey === item.continentId}
                aria-haspopup="true"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {togstrekSectionMegaMenuList.map((section) => (
            <li
              key={section.key}
              className="togstrek-site-header-mega-trigger relative"
              onMouseEnter={() => openMega(section.key)}
              onMouseLeave={scheduleClose}
            >
              <Link
                href={section.navHref}
                className="text-tt-text-secondary transition-colors duration-tt-fast hover:text-tt-accent"
                aria-expanded={openMegaKey === section.key}
                aria-haspopup="true"
              >
                {section.navLabel}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={`togstrek-site-header-mega-panel fixed inset-x-0 z-tt-overlay border-b shadow-[var(--tt-shadow-elevated)] transition-[opacity,visibility] duration-tt-fast ease-tt-out ${
          openMegaKey === "adventures"
            ? "border-white/10 bg-tt-surface-inverse"
            : "border-tt-border-muted bg-tt-surface-base"
        } ${
          panelVisible
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
        style={{ top: "var(--tt-layout-header-height)" }}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        {openMegaKey === "adventures" ? (
          <TogstrekSiteHeaderAdventuresMegaPanel onNavigate={closeMega} />
        ) : null}
        {openContinentItem ? (
          <TogstrekSiteHeaderMegaMenuPanelBase
            panelHeading={openContinentItem.label}
            tagline={megaMenuTaglines[openContinentItem.continentId]}
            links={megaMenuNavLinks[openContinentItem.continentId]}
            ctaLabel={`Explore ${openContinentItem.label}`}
            ctaHref={openContinentItem.href}
            aside={continentAside}
            emptyStateMessage="Country hubs are on the way — open the region page for the full introduction."
            asideHeadingId="togstrek-site-header-mega-aside-continent"
            onNavigate={closeMega}
          />
        ) : null}
        {openSectionDef ? (
          <TogstrekSiteHeaderMegaMenuPanelBase
            panelHeading={openSectionDef.panelHeading}
            tagline={openSectionDef.tagline}
            links={openSectionDef.links}
            ctaLabel={openSectionDef.ctaLabel}
            ctaHref={openSectionDef.ctaHref}
            aside={openSectionDef.aside}
            emptyStateMessage={openSectionDef.emptyStateMessage}
            asideHeadingId={`togstrek-site-header-mega-aside-${openSectionDef.key}`}
            onNavigate={closeMega}
          />
        ) : null}
      </div>

      <details className="togstrek-site-header-mobile-nav relative shrink-0 lg:hidden">
        <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-tt-sm border border-tt-border-default px-3 font-tt-display text-tt-small font-semibold uppercase tracking-tt-wide text-tt-text-primary touch-manipulation [&::-webkit-details-marker]:hidden">
          Menu
        </summary>
        <div className="absolute right-0 z-tt-dropdown mt-2 w-[min(calc(100vw-2*var(--tt-layout-gutter)),22rem)] max-w-[calc(100vw-1rem)] border border-tt-border-default bg-tt-surface-base py-2 shadow-[var(--tt-shadow-elevated)]">
          <ul className="flex max-h-[min(75vh,36rem)] flex-col gap-0.5 overflow-y-auto overscroll-contain px-2">
            <MobileExpandableNavGroup
              label="Adventures"
              topHref="/adventures"
              topLinkLabel="See all adventures →"
              links={togstrekAdventuresMegaFeaturedCards.map((card) => ({
                href: card.href,
                label: card.title,
              }))}
              footer={
                <li className="px-2 py-2">
                  <p className="text-[length:0.7rem] font-semibold uppercase leading-tt-snug tracking-tt-wide text-tt-text-tertiary [overflow-wrap:anywhere]">
                    {togstrekAdventuresMegaTagline}
                  </p>
                </li>
              }
            />
            {togstrekContinentNavMegaItems.map((c) => {
              const sub = megaMenuNavLinks[c.continentId];
              if (sub.length === 0) {
                return (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      className="block min-h-11 rounded-tt-sm px-3 py-3 text-tt-small leading-tt-snug text-tt-text-secondary transition-colors hover:bg-tt-surface-muted hover:text-tt-accent sm:py-2.5"
                    >
                      {c.label}
                    </Link>
                  </li>
                );
              }
              return (
                <MobileExpandableNavGroup
                  key={c.href}
                  label={c.label}
                  topHref={c.href}
                  topLinkLabel={`Explore ${c.label} →`}
                  links={sub}
                />
              );
            })}
            {togstrekSectionMegaMenuList.map((section) => (
              <MobileExpandableNavGroup
                key={section.key}
                label={section.navLabel}
                topHref={section.navHref}
                topLinkLabel={`${section.ctaLabel} →`}
                links={section.links}
              />
            ))}
          </ul>
        </div>
      </details>
    </>
  );
}
