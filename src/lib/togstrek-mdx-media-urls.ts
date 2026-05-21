import { getTogstrekMediaBaseUrl } from "@/config/togstrek-media";

const MDX_IMG = /!\[[^\]]*\]\(\s*([^)\s]+)\s*\)/g;

/** `imageSrc="…"`, YAML `src: https://…`, and bare CDN URLs in MDX/frontmatter. */
function buildMediaUrlPattern(): RegExp {
  const base = getTogstrekMediaBaseUrl().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${base}[^\\s)\\]"'<>]+`, "gi");
}

/**
 * Collect unique media CDN URLs referenced in an MDX file (markdown, YAML, JSX attrs).
 */
export function extractTogstrekMdxMediaUrls(fileText: string): string[] {
  const pattern = buildMediaUrlPattern();
  const found = new Set<string>();

  let m: RegExpExecArray | null;
  MDX_IMG.lastIndex = 0;
  while ((m = MDX_IMG.exec(fileText))) {
    const url = normalizeExtractedMediaUrl(m[1] ?? "");
    if (url) found.add(url);
  }

  pattern.lastIndex = 0;
  while ((m = pattern.exec(fileText))) {
    const url = normalizeExtractedMediaUrl(m[0] ?? "");
    if (url) found.add(url);
  }

  return [...found].sort();
}

function normalizeExtractedMediaUrl(raw: string): string | null {
  const trimmed = raw.trim().replace(/[),.;]+$/g, "");
  if (!trimmed.startsWith("http")) return null;
  try {
    const u = new URL(trimmed);
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}
