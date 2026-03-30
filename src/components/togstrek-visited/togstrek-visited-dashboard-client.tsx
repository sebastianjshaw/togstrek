"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import type { TogstrekMapPlace } from "@/components/togstrek-explore-map";
import {
  countryMarkersToMapPlaces,
  countryMarkersToVisitedIso2,
} from "@/lib/togstrek-visited-map-helpers";
import type {
  TogstrekVisitedContinentId,
  TogstrekVisitedTravelDataset,
} from "@/lib/togstrek-visited-travel-data";

const TogstrekExploreMap = dynamic(
  () =>
    import("@/components/togstrek-explore-map").then((m) => m.TogstrekExploreMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[min(40vh,20rem)] items-center justify-center rounded-none border border-tt-border-muted bg-tt-surface-muted font-tt-body text-tt-text-secondary sm:h-[min(48vh,26rem)] lg:h-[min(56vh,35rem)]"
        role="status"
      >
        Loading map…
      </div>
    ),
  },
);

type TogstrekVisitedDashboardClientProps = {
  data: TogstrekVisitedTravelDataset;
  lockedContinent?: TogstrekVisitedContinentId;
  className?: string;
};

type MapMode = "countries" | "cities";
type ScopeMode = "global" | TogstrekVisitedContinentId;

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function statCard(label: string, value: string, emphasis?: string) {
  return (
    <article className="rounded-none border border-tt-border-muted bg-tt-surface-muted px-4 py-4">
      <p className="font-tt-body text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-overline)] text-tt-text-tertiary">
        {label}
      </p>
      <p className="mt-2 font-tt-display text-[clamp(1.25rem,2vw,1.8rem)] font-extrabold text-tt-text-primary">
        {value}
      </p>
      {emphasis ? (
        <p className="mt-1 font-tt-body text-[length:var(--tt-text-small)] text-tt-text-secondary">
          {emphasis}
        </p>
      ) : null}
    </article>
  );
}

export function TogstrekVisitedDashboardClient({
  data,
  lockedContinent,
  className = "",
}: TogstrekVisitedDashboardClientProps) {
  const [scope, setScope] = useState<ScopeMode>(lockedContinent ?? "global");
  const [mapMode, setMapMode] = useState<MapMode>("countries");

  useEffect(() => {
    if (lockedContinent) {
      setScope(lockedContinent);
    }
  }, [lockedContinent]);

  const availableContinents = data.continents.filter((c) => c.totalCountries > 0);

  const summary = useMemo(() => {
    if (scope === "global") {
      return {
        label: "Global",
        visitedCountries: data.global.visitedCountries,
        totalCountries: data.global.totalCountries,
        visitedCities: data.global.visitedCities,
        coveragePercent: data.global.coveragePercent,
      };
    }
    const c = data.continents.find((x) => x.id === scope);
    if (!c) {
      return {
        label: "Global",
        visitedCountries: data.global.visitedCountries,
        totalCountries: data.global.totalCountries,
        visitedCities: data.global.visitedCities,
        coveragePercent: data.global.coveragePercent,
      };
    }
    return {
      label: c.label,
      visitedCountries: c.visitedCountries,
      totalCountries: c.totalCountries,
      visitedCities: c.visitedCities,
      coveragePercent: c.coveragePercent,
    };
  }, [data, scope]);

  const countryPoints = useMemo<TogstrekMapPlace[]>(() => {
    const rows =
      scope === "global"
        ? data.countryMarkers
        : data.countryMarkers.filter((p) => p.continent === scope);
    return countryMarkersToMapPlaces(rows);
  }, [data.countryMarkers, scope]);

  const cityPoints = useMemo<TogstrekMapPlace[]>(() => {
    const rows =
      scope === "global"
        ? data.cityMarkers
        : data.cityMarkers.filter((p) => p.continent === scope);
    return rows.map((row) => ({
      id: row.id,
      href: row.href,
      title: row.title,
      excerpt: row.excerpt,
      longitude: row.longitude,
      latitude: row.latitude,
      thumbnailSrc: row.thumbnailSrc,
      thumbnailAlt: row.thumbnailAlt,
    }));
  }, [data.cityMarkers, scope]);

  const mapPlaces = mapMode === "countries" ? countryPoints : cityPoints;

  const visitedCountryIso2 = useMemo(() => {
    const rows =
      scope === "global"
        ? data.countryMarkers
        : data.countryMarkers.filter((p) => p.continent === scope);
    return countryMarkersToVisitedIso2(rows);
  }, [data.countryMarkers, scope]);

  const topCountries = useMemo(() => {
    const rows =
      scope === "global"
        ? data.countryMarkers
        : data.countryMarkers.filter((p) => p.continent === scope);
    return [...rows].sort((a, b) => b.citiesVisited - a.citiesVisited).slice(0, 5);
  }, [data.countryMarkers, scope]);

  const sectionTitle =
    scope === "global" ? "Visited countries map" : `${summary.label} visited map`;

  return (
    <section className={`togstrek-visited-dashboard ${className}`}>
      {lockedContinent ? null : (
        <div className="mb-[var(--tt-space-8)] flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setScope("global")}
            className={`min-h-10 border px-4 font-tt-display text-[length:var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] transition-colors ${
              scope === "global"
                ? "border-tt-accent bg-tt-accent text-tt-text-inverse"
                : "border-tt-border-muted bg-tt-surface-base text-tt-text-primary hover:border-tt-accent hover:text-tt-accent"
            }`}
          >
            Global
          </button>
          {availableContinents.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setScope(c.id)}
              className={`min-h-10 border px-4 font-tt-display text-[length:var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] transition-colors ${
                scope === c.id
                  ? "border-tt-accent bg-tt-accent text-tt-text-inverse"
                  : "border-tt-border-muted bg-tt-surface-base text-tt-text-primary hover:border-tt-accent hover:text-tt-accent"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCard(
          "Countries visited",
          `${summary.visitedCountries}`,
          `${summary.totalCountries} total`,
        )}
        {statCard("Coverage", formatPercent(summary.coveragePercent))}
        {statCard("Places Visited", `${summary.visitedCities}`)}
        {statCard(
          "Map mode",
          mapMode === "countries" ? "Countries" : "Places",
          mapMode === "countries"
            ? "Aggregated by country centroid"
            : "All place stories",
        )}
      </div>

      <div className="mt-[var(--tt-space-6)] flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-tt-display text-[length:var(--tt-text-title)] font-bold text-tt-text-primary">
          {sectionTitle}
        </h3>
        <div className="inline-flex border border-tt-border-muted">
          <button
            type="button"
            onClick={() => setMapMode("countries")}
            className={`min-h-10 px-4 font-tt-display text-[length:var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] ${
              mapMode === "countries"
                ? "bg-tt-accent text-tt-text-inverse"
                : "bg-tt-surface-base text-tt-text-primary hover:text-tt-accent"
            }`}
          >
            Countries
          </button>
          <button
            type="button"
            onClick={() => setMapMode("cities")}
            className={`min-h-10 border-l border-tt-border-muted px-4 font-tt-display text-[length:var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] ${
              mapMode === "cities"
                ? "bg-tt-accent text-tt-text-inverse"
                : "bg-tt-surface-base text-tt-text-primary hover:text-tt-accent"
            }`}
          >
            Places
          </button>
        </div>
      </div>

      <div className="mt-[var(--tt-space-5)]">
        <TogstrekExploreMap
          places={mapPlaces}
          visitedCountryIso2={visitedCountryIso2}
          aria-label={`${sectionTitle}: ${mapPlaces.length} points`}
        />
      </div>

      <div className="mt-[var(--tt-space-6)] rounded-none border border-tt-border-muted bg-tt-surface-muted px-4 py-4">
        <p className="font-tt-display text-[length:var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-primary">
          Most explored countries in this view
        </p>
        {topCountries.length === 0 ? (
          <p className="mt-2 font-tt-body text-[length:var(--tt-text-small)] text-tt-text-secondary">
            No mapped countries yet.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {topCountries.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between border border-tt-border-muted/70 bg-tt-surface-base px-3 py-2 font-tt-body text-[length:var(--tt-text-small)]"
              >
                <span className="text-tt-text-primary">{c.countryLabel}</span>
                <span className="font-semibold text-tt-text-secondary">
                  {c.citiesVisited}{" "}
                  {c.citiesVisited === 1 ? "place" : "places"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
