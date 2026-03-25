"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { TogstrekSiteHeaderAdventuresMegaPanel } from "@/components/togstrek-site-header-adventures-mega-panel";
import { TogstrekCtaOutlineAccentLink } from "@/components/togstrek-ui/togstrek-cta-outline-accent-link";
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
    <div className="togstrek-site-header-mega-panel-inner mx-auto grid max-w-[var(--tt-layout-max-wide)] gap-10 px-[var(--tt-layout-gutter)] py-[var(--tt-space-10)] lg:grid-cols-[minmax(0,1fr)_min(14rem,28%)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_min(16rem,26%)]">
      <div className="togstrek-site-header-mega-panel-main min-w-0">
        <p className="font-tt-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold uppercase leading-[var(--tt-leading-tight)] tracking-[var(--tt-tracking-tight)] text-tt-text-primary [overflow-wrap:anywhere]">
          {panelHeading}
        </p>
        {tagline ? (
          <p className="mt-[var(--tt-space-4)] max-w-[52ch] font-tt-body text-[length:var(--tt-text-small)] font-bold uppercase leading-snug tracking-[var(--tt-tracking-wide)] text-tt-text-primary [overflow-wrap:anywhere]">
            {tagline}
          </p>
        ) : null}
        <div
          className="togstrek-site-header-mega-panel-divider my-[var(--tt-space-8)] h-px w-full bg-tt-border-muted"
          aria-hidden
        />
        {links.length > 0 ? (
          <ul className="togstrek-site-header-mega-panel-link-grid grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {links.map((l) => (
              <li key={`${l.href}-${l.label}`}>
                <Link
                  href={l.href}
                  onClick={onNavigate}
                  className="togstrek-site-header-mega-panel-grid-link block py-1 font-tt-body text-[length:var(--tt-text-small)] text-tt-text-secondary transition-colors hover:text-tt-accent [overflow-wrap:anywhere]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary">
            {emptyStateMessage}
          </p>
        )}
        <div className="mt-[var(--tt-space-10)] flex justify-center lg:justify-start">
          <TogstrekCtaOutlineAccentLink
            href={ctaHref}
            onClick={onNavigate}
            className="max-w-xs text-center"
          >
            {ctaLabel}
          </TogstrekCtaOutlineAccentLink>
        </div>
      </div>
      <aside
        className="togstrek-site-header-mega-panel-aside min-w-0 border-tt-border-muted lg:border-l lg:pl-10"
        aria-labelledby={asideHeadingId}
      >
        <h2
          id={asideHeadingId}
          className="font-tt-display text-[length:var(--tt-text-title)] font-bold text-tt-text-primary"
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
          <ul className="mt-[var(--tt-space-6)] space-y-2">
            {aside.links.map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  onClick={onNavigate}
                  className="togstrek-site-header-mega-panel-aside-link block py-1 font-tt-body text-[length:var(--tt-text-small)] text-tt-text-secondary transition-colors hover:text-tt-accent [overflow-wrap:anywhere]"
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

  const panelVisible = openMegaKey !== null;

  return (
    <>
      <nav
        className="togstrek-site-header-primary-nav-desktop hidden lg:block"
        aria-label="Primary"
      >
        <ul className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[var(--tt-text-small)] font-medium tracking-wide">
          <li
            className="togstrek-site-header-mega-trigger relative"
            onMouseEnter={() => openMega("adventures")}
            onMouseLeave={scheduleClose}
          >
            <Link
              href="/adventures"
              className="text-tt-text-secondary transition-colors duration-[var(--tt-duration-fast)] hover:text-tt-accent"
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
                className="text-tt-text-secondary transition-colors duration-[var(--tt-duration-fast)] hover:text-tt-accent"
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
                className="text-tt-text-secondary transition-colors duration-[var(--tt-duration-fast)] hover:text-tt-accent"
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
        className={`togstrek-site-header-mega-panel fixed inset-x-0 z-[100] border-b shadow-[var(--tt-shadow-elevated)] transition-[opacity,visibility] duration-[var(--tt-duration-fast)] ease-[var(--tt-ease-out)] ${
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
        {openMegaKey && isSectionMegaKey(openMegaKey) ? (
          <TogstrekSiteHeaderMegaMenuPanelBase
            {...(() => {
              const def = togstrekSectionMegaMenuByKey[openMegaKey];
              return {
                panelHeading: def.panelHeading,
                tagline: def.tagline,
                links: def.links,
                ctaLabel: def.ctaLabel,
                ctaHref: def.ctaHref,
                aside: def.aside,
                emptyStateMessage: def.emptyStateMessage,
                asideHeadingId: `togstrek-site-header-mega-aside-${def.key}`,
              };
            })()}
            onNavigate={closeMega}
          />
        ) : null}
      </div>

      <details className="togstrek-site-header-mobile-nav relative shrink-0 lg:hidden">
        <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-[var(--tt-radius-sm)] border border-tt-border-default px-3 font-tt-display text-[var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-primary touch-manipulation [&::-webkit-details-marker]:hidden">
          Menu
        </summary>
        <div className="absolute right-0 z-[var(--tt-z-dropdown)] mt-2 w-[min(calc(100vw-2*var(--tt-layout-gutter)),22rem)] max-w-[calc(100vw-1rem)] border border-tt-border-default bg-tt-surface-base py-2 shadow-[var(--tt-shadow-elevated)]">
          <ul className="flex max-h-[min(75vh,36rem)] flex-col gap-0.5 overflow-y-auto overscroll-contain px-2">
            <li className="min-w-0">
              <details className="togstrek-site-header-mobile-adventures-mega rounded-[var(--tt-radius-sm)]">
                <summary className="cursor-pointer list-none px-3 py-2 font-tt-display text-[var(--tt-text-small)] font-semibold text-tt-text-primary [&::-webkit-details-marker]:hidden">
                  <span className="flex min-h-9 items-center justify-between gap-2">
                    Adventures
                    <span className="text-tt-text-tertiary" aria-hidden>
                      +
                    </span>
                  </span>
                </summary>
                <ul className="border-t border-tt-border-muted bg-tt-surface-muted/60 py-1 pl-2 pr-1">
                  <li>
                    <Link
                      href="/adventures"
                      className="block min-h-10 rounded-[var(--tt-radius-sm)] px-2 py-2 text-[var(--tt-text-small)] font-semibold text-tt-accent [overflow-wrap:anywhere]"
                    >
                      See all adventures →
                    </Link>
                  </li>
                  {togstrekAdventuresMegaFeaturedCards.map((card) => (
                    <li key={card.href}>
                      <Link
                        href={card.href}
                        className="block min-h-10 rounded-[var(--tt-radius-sm)] px-2 py-2 text-[var(--tt-text-small)] text-tt-text-secondary [overflow-wrap:anywhere] hover:bg-tt-surface-base hover:text-tt-accent"
                      >
                        {card.title}
                      </Link>
                    </li>
                  ))}
                  <li className="px-2 py-2">
                    <p className="text-[length:0.7rem] font-semibold uppercase leading-snug tracking-wide text-tt-text-tertiary [overflow-wrap:anywhere]">
                      {togstrekAdventuresMegaTagline}
                    </p>
                  </li>
                </ul>
              </details>
            </li>
            {togstrekContinentNavMegaItems.map((c) => {
              const sub = megaMenuNavLinks[c.continentId];
              if (sub.length === 0) {
                return (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      className="block min-h-11 rounded-[var(--tt-radius-sm)] px-3 py-3 text-[var(--tt-text-small)] leading-snug text-tt-text-secondary transition-colors hover:bg-tt-surface-muted hover:text-tt-accent sm:py-2.5"
                    >
                      {c.label}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={c.href} className="min-w-0">
                  <details className="togstrek-site-header-mobile-continent rounded-[var(--tt-radius-sm)]">
                    <summary className="cursor-pointer list-none px-3 py-2 font-tt-display text-[var(--tt-text-small)] font-semibold text-tt-text-primary [&::-webkit-details-marker]:hidden">
                      <span className="flex min-h-9 items-center justify-between gap-2">
                        {c.label}
                        <span className="text-tt-text-tertiary" aria-hidden>
                          +
                        </span>
                      </span>
                    </summary>
                    <ul className="border-t border-tt-border-muted bg-tt-surface-muted/60 py-1 pl-2 pr-1">
                      <li>
                        <Link
                          href={c.href}
                          className="block min-h-10 rounded-[var(--tt-radius-sm)] px-2 py-2 text-[var(--tt-text-small)] font-semibold text-tt-accent [overflow-wrap:anywhere]"
                        >
                          Explore {c.label} →
                        </Link>
                      </li>
                      {sub.map((l) => (
                        <li key={`${l.href}-${l.label}`}>
                          <Link
                            href={l.href}
                            className="block min-h-10 rounded-[var(--tt-radius-sm)] px-2 py-2 text-[var(--tt-text-small)] text-tt-text-secondary [overflow-wrap:anywhere] hover:bg-tt-surface-base hover:text-tt-accent"
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              );
            })}
            {togstrekSectionMegaMenuList.map((section) => (
              <li key={section.key} className="min-w-0">
                <details className="togstrek-site-header-mobile-section-mega rounded-[var(--tt-radius-sm)]">
                  <summary className="cursor-pointer list-none px-3 py-2 font-tt-display text-[var(--tt-text-small)] font-semibold text-tt-text-primary [&::-webkit-details-marker]:hidden">
                    <span className="flex min-h-9 items-center justify-between gap-2">
                      {section.navLabel}
                      <span className="text-tt-text-tertiary" aria-hidden>
                        +
                      </span>
                    </span>
                  </summary>
                  <ul className="border-t border-tt-border-muted bg-tt-surface-muted/60 py-1 pl-2 pr-1">
                    <li>
                      <Link
                        href={section.navHref}
                        className="block min-h-10 rounded-[var(--tt-radius-sm)] px-2 py-2 text-[var(--tt-text-small)] font-semibold text-tt-accent [overflow-wrap:anywhere]"
                      >
                        {section.ctaLabel} →
                      </Link>
                    </li>
                    {section.links.map((l) => (
                      <li key={`${l.href}-${l.label}`}>
                        <Link
                          href={l.href}
                          className="block min-h-10 rounded-[var(--tt-radius-sm)] px-2 py-2 text-[var(--tt-text-small)] text-tt-text-secondary [overflow-wrap:anywhere] hover:bg-tt-surface-base hover:text-tt-accent"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </>
  );
}
