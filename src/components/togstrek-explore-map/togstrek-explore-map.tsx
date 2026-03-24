"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./togstrek-explore-map.css";

import Link from "next/link";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  type MapRef,
  Marker,
  NavigationControl,
  Popup,
} from "react-map-gl/maplibre";
import Supercluster from "supercluster";

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
  initialViewState,
}: TogstrekExploreMapProps) {
  const mapRef = useRef<MapRef>(null);
  const index = useMemo(() => placesToIndex(places), [places]);

  const [bounds, setBounds] = useState<[number, number, number, number]>([
    -20, 35, 45, 72,
  ]);
  const [zoom, setZoom] = useState(3.4);
  const [clusters, setClusters] = useState<ClusterFeature[]>([]);
  const [selected, setSelected] = useState<TogstrekMapPlace | null>(null);

  const updateClusters = useCallback(() => {
    const z = Math.max(0, Math.floor(zoom));
    const next = index.getClusters(bounds, z) as ClusterFeature[];
    setClusters(next);
  }, [index, bounds, zoom]);

  useEffect(() => {
    updateClusters();
  }, [updateClusters]);

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

  if (places.length === 0) {
    return (
      <div
        className={`togstrek-explore-map-empty rounded-[var(--tt-radius-sm)] border border-tt-border-muted bg-tt-surface-muted px-6 py-12 text-center font-tt-body text-tt-text-secondary ${className}`}
        role="status"
      >
        No places to show on the map yet.
      </div>
    );
  }

  const startView =
    initialViewState ?? {
      longitude: 15,
      latitude: 55,
      zoom: 3.4,
    };

  return (
    <div
      className={`togstrek-explore-map relative h-[min(40vh,20rem)] w-full min-h-0 overflow-hidden rounded-[var(--tt-radius-sm)] border border-tt-border-default shadow-[var(--tt-shadow-sm)] sm:h-[min(48vh,26rem)] lg:h-[min(56vh,35rem)] ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      <Map
        ref={mapRef}
        initialViewState={startView}
        mapStyle={
          TOGSTREK_MAP_DARK_STYLE as ComponentProps<typeof Map>["mapStyle"]
        }
        style={{ width: "100%", height: "100%" }}
        onMoveEnd={onMoveEnd}
        onLoad={fitToPlaces}
        reuseMaps
      >
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
                <Link
                  href={selected.href}
                  className="inline-flex min-h-10 w-full items-center justify-center border-[length:var(--tt-border-width-thick)] border-tt-accent bg-transparent font-tt-display text-[length:var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-accent transition-colors hover:bg-tt-accent hover:text-tt-text-inverse"
                >
                  Open story
                </Link>
              </div>
            </article>
          </Popup>
        )}
      </Map>
    </div>
  );
}
