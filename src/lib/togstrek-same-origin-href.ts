import { getTogstrekSiteOrigin } from "@/lib/togstrek-site-url";

function canonicalHostnames(): Set<string> {
  const origin = getTogstrekSiteOrigin();
  let canonical: string;
  try {
    canonical = new URL(origin).hostname;
  } catch {
    canonical = "www.togstrek.com";
  }
  const hosts = new Set<string>([canonical]);
  if (canonical === "www.togstrek.com") hosts.add("togstrek.com");
  if (canonical === "togstrek.com") hosts.add("www.togstrek.com");
  return hosts;
}

function isTogstrekSiteHostname(hostname: string): boolean {
  return canonicalHostnames().has(hostname);
}

/**
 * When `href` targets this site, returns a pathname (+ search + hash) suitable for
 * `next/link`. Otherwise `null` (external, special scheme, or off-site absolute URL).
 */
export function resolveTogstrekInternalPathname(
  href: string | undefined,
): string | null {
  if (href == null) return null;
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//")) {
      try {
        const u = new URL(trimmed, getTogstrekSiteOrigin());
        if (!isTogstrekSiteHostname(u.hostname)) return null;
        return `${u.pathname}${u.search}${u.hash}`;
      } catch {
        return null;
      }
    }
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      if (!isTogstrekSiteHostname(u.hostname)) return null;
      return `${u.pathname}${u.search}${u.hash}`;
    } catch {
      return null;
    }
  }

  return null;
}

export function isTogstrekExternalHref(href: string | undefined): boolean {
  if (href == null) return false;
  const trimmed = href.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("//");
}
