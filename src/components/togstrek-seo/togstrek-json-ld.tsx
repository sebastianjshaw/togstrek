type TogstrekJsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * Inline JSON-LD for rich results (safe: JSON.stringify on server-built objects only).
 */
export function TogstrekJsonLd({ data }: TogstrekJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
