type TogstrekJsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * Escape sequences that can break out of `<script type="application/ld+json">` or
 * terminate string literals in older parsers (defence in depth for string fields).
 */
export function serializeTogstrekJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * Inline JSON-LD for rich results — server-built objects only; output is escaped for script context.
 */
export function TogstrekJsonLd({ data }: TogstrekJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeTogstrekJsonLd(data) }}
    />
  );
}
