import path from "node:path";

/**
 * URL path segments derived from routes must be strict slugs so `path.join`
 * cannot escape content roots (`..`, absolute paths, separators).
 *
 * Matches folder/file names used across `content/` (lowercase, digits, hyphens).
 */
const TOGSTREK_SAFE_URL_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const MAX_SEGMENT_LENGTH = 128;

export function isTogstrekSafeUrlPathSegment(segment: string): boolean {
  return (
    segment.length > 0 &&
    segment.length <= MAX_SEGMENT_LENGTH &&
    TOGSTREK_SAFE_URL_SEGMENT.test(segment)
  );
}

export function areTogstrekSafeUrlPathSegments(segments: string[]): boolean {
  return segments.every(isTogstrekSafeUrlPathSegment);
}

export function areTogstrekCountryHubRouteParamsSafe(
  continent: string,
  country: string,
): boolean {
  return (
    isTogstrekSafeUrlPathSegment(continent) &&
    isTogstrekSafeUrlPathSegment(country)
  );
}

export function areTogstrekPlaceRouteParamsSafe(
  continent: string,
  country: string,
  placeSegments: string[],
): boolean {
  return (
    areTogstrekCountryHubRouteParamsSafe(continent, country) &&
    areTogstrekSafeUrlPathSegments(placeSegments)
  );
}

/**
 * Ensures `candidatePath` resolves inside `rootDir` (defence in depth after slug checks).
 */
export function isTogstrekPathWithinRoot(
  candidatePath: string,
  rootDir: string,
): boolean {
  const resolvedFile = path.resolve(candidatePath);
  const resolvedRoot = path.resolve(rootDir);
  if (resolvedFile === resolvedRoot) return false;
  const rel = path.relative(resolvedRoot, resolvedFile);
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}
