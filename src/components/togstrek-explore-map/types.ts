/**
 * One place you can jump to from the explore map (built from your content at build time).
 */
export type TogstrekMapPlace = {
  id: string;
  /** URL path, e.g. /europe/russia/moscow */
  href: string;
  title: string;
  excerpt: string;
  /** WGS84 */
  longitude: number;
  latitude: number;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
};

export type TogstrekExploreMapProps = {
  places: TogstrekMapPlace[];
  /** Map height; keep generous for photography. */
  className?: string;
  /** Accessible label for the map region */
  "aria-label"?: string;
  /** Primary link label in the marker popup (default: “Open story”). */
  popupCtaLabel?: string;
  /** Initial view; if omitted, bounds are fitted to `places`. */
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  /**
   * ISO 3166-1 alpha-2 codes to highlight on the basemap (Natural Earth polygons).
   * Renders a semi-transparent fill under markers.
   */
  visitedCountryIso2?: string[];
};
