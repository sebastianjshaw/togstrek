"use client";

import type { Marker as MarkerInstance } from "maplibre-gl";
import { forwardRef, useLayoutEffect, useRef } from "react";
import { Marker, type MarkerProps } from "react-map-gl/maplibre";

/**
 * MapLibre wraps custom marker children in a focusable `role="button"` shell,
 * which nests with our inner `<button>` pins/clusters. Strip the shell so
 * the inner control is the only interactive element (axe nested-interactive).
 */
export const TogstrekExploreMapMarker = forwardRef<
  MarkerInstance,
  MarkerProps
>(function TogstrekExploreMapMarker(props, forwardedRef) {
  const markerRef = useRef<MarkerInstance | null>(null);

  useLayoutEffect(() => {
    const el = markerRef.current?.getElement();
    if (!el) return;

    const stripMarkerShellInteractivity = () => {
      el.removeAttribute("role");
      el.removeAttribute("aria-label");
      el.removeAttribute("tabindex");
    };

    stripMarkerShellInteractivity();
    const observer = new MutationObserver(stripMarkerShellInteractivity);
    observer.observe(el, {
      attributes: true,
      attributeFilter: ["role", "aria-label", "tabindex"],
    });
    return () => observer.disconnect();
  });

  return (
    <Marker
      {...props}
      ref={(instance) => {
        markerRef.current = instance;
        if (typeof forwardedRef === "function") {
          forwardedRef(instance);
        } else if (forwardedRef) {
          forwardedRef.current = instance;
        }
      }}
    />
  );
});
