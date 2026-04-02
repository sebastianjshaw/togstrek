const DEFAULT_GA_MEASUREMENT_ID = "G-WFPJ519GNZ";

/**
 * Google Analytics 4 Measurement ID (public, safe in client bundles).
 *
 * - Set **`NEXT_PUBLIC_GA_MEASUREMENT_ID`** to override the default property.
 * - Set it to an **empty string** to disable GA (e.g. local dev).
 * - When unset: loads **`G-WFPJ519GNZ`** in production only; omits in `development`
 *   so local sessions do not pollute reports (set the env var locally to test).
 */
export function getGoogleAnalyticsMeasurementId(): string | null {
  const explicit = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (explicit === "") return null;
  if (explicit?.trim()) return explicit.trim();
  if (process.env.NODE_ENV !== "production") return null;
  return DEFAULT_GA_MEASUREMENT_ID;
}
