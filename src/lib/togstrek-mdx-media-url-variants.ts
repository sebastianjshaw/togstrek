const APOSTROPHE_FORMS = ["'", "\u2019", "%27", "%E2%80%99"] as const;

/**
 * Candidate CDN URLs to try when the literal MDX string returns 404.
 * Assumes the asset exists but encoding (Unicode, apostrophe, percent-encoding) differs.
 */
export function buildTogstrekMediaUrlVariants(url: string): string[] {
  const variants = new Set<string>();
  variants.add(url);

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return [url];
  }

  const pathnameVariants = new Set<string>([
    parsed.pathname,
    safeDecodeUriPath(parsed.pathname),
    encodeURI(parsed.pathname),
    encodeURI(safeDecodeUriPath(parsed.pathname)),
    doubleEncodeExistingPercents(parsed.pathname),
    parsed.pathname.normalize("NFC"),
    parsed.pathname.normalize("NFD"),
    stripCombiningMarks(parsed.pathname),
    safeDecodeUriPath(parsed.pathname).normalize("NFC"),
    safeDecodeUriPath(parsed.pathname).normalize("NFD"),
    stripCombiningMarks(safeDecodeUriPath(parsed.pathname)),
    encodeNonAsciiPathSegments(parsed.pathname),
    encodeNonAsciiPathSegments(safeDecodeUriPath(parsed.pathname)),
  ]);

  for (const pathname of pathnameVariants) {
    variants.add(`${parsed.origin}${pathname}`);
    for (const from of APOSTROPHE_FORMS) {
      for (const to of APOSTROPHE_FORMS) {
        if (from === to) continue;
        const swapped = pathname.split(from).join(to);
        if (swapped !== pathname) variants.add(`${parsed.origin}${swapped}`);
      }
    }
  }

  return [...variants];
}

function safeDecodeUriPath(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

/** CDN keys sometimes store `%22` literally as `%2522` (R2 upload of encoded filenames). */
function doubleEncodeExistingPercents(pathname: string): string {
  if (!pathname.includes("%")) return pathname;
  return pathname.replace(/%/g, "%25");
}

function stripCombiningMarks(pathname: string): string {
  return pathname.normalize("NFD").replace(/\p{M}/gu, "");
}

/** Encode only non-ASCII code units; keep `+` as space separator. */
function encodeNonAsciiPathSegments(pathname: string): string {
  return pathname
    .split("/")
    .map((segment) =>
      [...segment]
        .map((ch) =>
          ch.charCodeAt(0) < 128 ? ch : encodeURIComponent(ch),
        )
        .join(""),
    )
    .join("/");
}
