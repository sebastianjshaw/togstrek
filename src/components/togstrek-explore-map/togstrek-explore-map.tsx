"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./togstrek-explore-map.css";

import type { FilterSpecification, Map as MapLibreMap } from "maplibre-gl";
import type { ComponentProps } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  type MapRef,
  Marker,
  NavigationControl,
  Popup,
  Source,
} from "react-map-gl/maplibre";
import Supercluster from "supercluster";

import { TogstrekCtaOutlineAccentLink } from "@/components/togstrek-ui/togstrek-cta-outline-accent-link";

import type { TogstrekExploreMapProps, TogstrekMapPlace } from "./types";

const TOGSTREK_MAP_DARK_STYLE = {
  version: 8 as const,
  name: "togstrek-carto-dark",
  sources: {
    carto: {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    },
  },
  layers: [
    {
      id: "carto",
      type: "raster" as const,
      source: "carto",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

/**
 * Natural Earth 110m admin-0 countries. Some rows use `ISO_A2: "-99"` and put
 * real alpha-2 codes on `WB_A2` and/or `ISO_A2_EH` (e.g. France, Norway).
 */
const TOGSTREK_MAP_NE110_COUNTRIES_GEOJSON =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

type ClusterFeature = GeoJSON.Feature<
  GeoJSON.Point,
  {
    cluster?: boolean;
    cluster_id?: number;
    point_count?: number;
    point_count_abbreviated?: string | number;
    id?: string;
    href?: string;
    title?: string;
    excerpt?: string;
    thumbnailSrc?: string;
    thumbnailAlt?: string;
  }
>;

type MapPointProps = {
  id: string;
  href: string;
  title: string;
  excerpt: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
};

function placesToIndex(places: TogstrekMapPlace[]) {
  const sc = new Supercluster<MapPointProps>({
    radius: 78,
    maxZoom: 20,
    minZoom: 0,
    minPoints: 2,
  });
  const features: GeoJSON.Feature<GeoJSON.Point, MapPointProps>[] = places.map(
    (p) => ({
      type: "Feature",
      properties: {
        id: p.id,
        href: p.href,
        title: p.title,
        excerpt: p.excerpt,
        thumbnailSrc: p.thumbnailSrc ?? "",
        thumbnailAlt: p.thumbnailAlt ?? "",
      },
      geometry: {
        type: "Point",
        coordinates: [p.longitude, p.latitude],
      },
    }),
  );
  sc.load(features);
  return sc;
}

export function TogstrekExploreMap({
  places,
  className = "",
  "aria-label": ariaLabel = "Places on the map",
  popupCtaLabel = "Open story",
  initialViewState,
  visitedCountryIso2,
}: TogstrekExploreMapProps) {
  const placesFitKey = useMemo(
    () => places.map((p) => `${p.id}:${p.longitude}:${p.latitude}`).join("|"),
    [places],
  );

  if (places.length === 0) {
    return (
      <div
        className={`togstrek-explore-map-empty rounded-[var(--tt-radius-photo)] border border-tt-border-muted bg-tt-surface-muted px-6 py-12 text-center font-tt-body text-tt-text-secondary ${className}`}
        role="status"
      >
        No places to show on the map yet.
      </div>
    );
  }

  return (
    <TogstrekExploreMapWithPlaces
      key={placesFitKey}
      places={places}
      className={className}
      aria-label={ariaLabel}
      popupCtaLabel={popupCtaLabel}
      initialViewState={initialViewState}
      visitedCountryIso2={visitedCountryIso2}
      placesFitKey={placesFitKey}
    />
  );
}

function TogstrekExploreMapWithPlaces({
  places,
  className = "",
  "aria-label": ariaLabel = "Places on the map",
  popupCtaLabel = "Open story",
  initialViewState,
  visitedCountryIso2,
  placesFitKey,
}: TogstrekExploreMapProps & { placesFitKey: string }) {
  const mapRef = useRef<MapRef>(null);
  const index = useMemo(() => placesToIndex(places), [places]);

  const [bounds, setBounds] = useState<[number, number, number, number]>([
    -20, 35, 45, 72,
  ]);
  const [zoom, setZoom] = useState(3.4);
  const [selected, setSelected] = useState<TogstrekMapPlace | null>(null);

  const zCluster = Math.max(0, Math.floor(zoom));
  const clusters = useMemo(
    () => index.getClusters(bounds, zCluster) as ClusterFeature[],
    [index, bounds, zCluster],
  );

  const onMoveEnd = useCallback((evt: { target: MapLibreMap }) => {
    const b = evt.target.getBounds();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    setZoom(evt.target.getZoom());
  }, []);

  const fitToPlaces = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || places.length === 0) return;
    const lngs = places.map((p) => p.longitude);
    const lats = places.map((p) => p.latitude);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 72, maxZoom: 12, duration: 0 },
    );
  }, [places]);

  const onClusterClick = useCallback(
    (clusterId: number, lng: number, lat: number) => {
      const expansion = index.getClusterExpansionZoom(clusterId);
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom: expansion,
        duration: 480,
      });
    },
    [index],
  );

  const openPlaceFromFeature = useCallback((f: ClusterFeature) => {
    const p = f.properties;
    if (!p?.id || !p.href || !p.title) return;
    setSelected({
      id: p.id,
      href: p.href,
      title: p.title,
      excerpt: p.excerpt ?? "",
      longitude: f.geometry.coordinates[0],
      latitude: f.geometry.coordinates[1],
      thumbnailSrc: p.thumbnailSrc || undefined,
      thumbnailAlt: p.thumbnailAlt || undefined,
    });
  }, []);

  const startView =
    initialViewState ?? {
      longitude: 15,
      latitude: 55,
      zoom: 3.4,
    };

  const visitedIso2Codes = useMemo(
    () =>
      (visitedCountryIso2 ?? []).filter(
        (c) => typeof c === "string" && c.length === 2,
      ),
    [visitedCountryIso2],
  );

  const visitedCountryFillFilter: FilterSpecification | undefined =
    visitedIso2Codes.length > 0
      ? [
          "any",
          ["in", ["get", "ISO_A2"], ["literal", visitedIso2Codes]],
          ["in", ["get", "WB_A2"], ["literal", visitedIso2Codes]],
          ["in", ["get", "ISO_A2_EH"], ["literal", visitedIso2Codes]],
        ]
      : undefined;

  return (
    <div
      className={`togstrek-explore-map relative h-[min(40vh,20rem)] w-full min-h-0 overflow-hidden rounded-[var(--tt-radius-photo)] border border-tt-border-default shadow-[var(--tt-shadow-sm)] sm:h-[min(48vh,26rem)] lg:h-[min(56vh,35rem)] ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      <Map
        key={placesFitKey}
        ref={mapRef}
        initialViewState={startView}
        mapStyle={
          TOGSTREK_MAP_DARK_STYLE as ComponentProps<typeof Map>["mapStyle"]
        }
        style={{ width: "100%", height: "100%" }}
        onMoveEnd={onMoveEnd}
        onLoad={fitToPlaces}
      >
        {visitedCountryFillFilter ? (
          <Source
            id="togstrek-ne-110m-countries"
            type="geojson"
            data={TOGSTREK_MAP_NE110_COUNTRIES_GEOJSON}
          >
            <Layer
              id="togstrek-visited-countries-fill"
              type="fill"
              paint={{
                "fill-color": "rgba(227, 25, 55, 0.22)",
                "fill-outline-color": "rgba(227, 25, 55, 0.42)",
              }}
              filter={visitedCountryFillFilter}
            />
          </Source>
        ) : null}

        <NavigationControl position="top-right" showCompass={false} />

        {clusters.map((feature) => {
          const [lng, lat] = feature.geometry.coordinates;
          const props = feature.properties;
          const isCluster = props.cluster === true;

          if (isCluster && props.cluster_id != null) {
            const count = props.point_count ?? 0;
            return (
              <Marker
                key={`cluster-${props.cluster_id}`}
                longitude={lng}
                latitude={lat}
                anchor="center"
              >
                <button
                  type="button"
                  className="togstrek-explore-map-cluster flex cursor-pointer items-center justify-center rounded-full border-[2px] border-tt-accent bg-[color-mix(in_srgb,var(--tt-color-surface-inverse)_92%,transparent)] font-tt-display text-[0.85rem] font-bold tabular-nums text-tt-text-inverse shadow-[var(--tt-map-cluster-shadow)] transition-transform duration-[var(--tt-duration-fast)] hover:scale-105 hover:border-tt-accent-hover"
                  style={{
                    width: "var(--tt-map-cluster-size)",
                    height: "var(--tt-map-cluster-size)",
                  }}
                  aria-label={`${count} places in this area — zoom in`}
                  onClick={() =>
                    onClusterClick(props.cluster_id as number, lng, lat)
                  }
                >
                  {count > 99 ? "99+" : count}
                </button>
              </Marker>
            );
          }

          const placeId = props.id;
          if (!placeId) return null;

          const isSelected = selected?.id === placeId;

          return (
            <Marker
              key={placeId}
              longitude={lng}
              latitude={lat}
              anchor="bottom"
            >
              <button
                type="button"
                className="togstrek-explore-map-pin relative block h-0 w-0 cursor-pointer border-0 bg-transparent p-0"
                aria-label={props.title ?? "Open place"}
                onClick={() => openPlaceFromFeature(feature)}
              >
                <span
                  className={`absolute bottom-0 left-1/2 block h-3 w-3 -translate-x-1/2 rotate-45 border-[2px] shadow-[var(--tt-map-cluster-shadow)] ${
                    isSelected
                      ? "border-tt-text-inverse bg-tt-accent"
                      : "border-tt-accent bg-tt-surface-inverse"
                  }`}
                  aria-hidden
                />
              </button>
            </Marker>
          );
        })}

        {selected && (
          <Popup
            longitude={selected.longitude}
            latitude={selected.latitude}
            anchor="bottom"
            offset={28}
            onClose={() => setSelected(null)}
            closeButton={false}
            closeOnClick={false}
            maxWidth="320px"
          >
            <article className="togstrek-explore-map-card text-left">
              <div className="flex items-start justify-between gap-3 border-b border-tt-border-muted px-4 py-3">
                <h3 className="font-tt-display text-[length:var(--tt-text-title)] font-bold leading-[var(--tt-leading-snug)] tracking-[var(--tt-tracking-tight)] text-tt-text-primary">
                  {selected.title}
                </h3>
                <button
                  type="button"
                  className="shrink-0 font-tt-body text-[length:var(--tt-text-small)] font-semibold text-tt-text-tertiary hover:text-tt-text-primary"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              {selected.thumbnailSrc ? (
                <div className="relative aspect-[16/10] w-full bg-tt-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- map popup: avoid layout shift with remote URLs */}
                  <img
                    src={selected.thumbnailSrc}
                    alt={selected.thumbnailAlt ?? ""}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <p className="px-4 py-3 font-tt-body text-[length:var(--tt-text-small)] leading-[var(--tt-leading-normal)] text-tt-text-secondary">
                {selected.excerpt}
              </p>
              <div className="border-t border-tt-border-muted px-4 py-3">
                <TogstrekCtaOutlineAccentLink
                  href={selected.href}
                  size="compact"
                  className="w-full"
                >
                  {popupCtaLabel}
                </TogstrekCtaOutlineAccentLink>
              </div>
            </article>
          </Popup>
        )}
      </Map>
    </div>
  );
}
