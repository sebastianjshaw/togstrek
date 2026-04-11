import { describe, expect, it } from "vitest";

import { serializeTogstrekJsonLd } from "./togstrek-json-ld";

describe("serializeTogstrekJsonLd", () => {
  it("escapes angle brackets for script embedding", () => {
    const s = serializeTogstrekJsonLd({ html: "<script>evil()</script>" });
    expect(s).not.toContain("<script>");
    expect(s).toContain("\\u003c");
    expect(s).toContain("\\u003e");
  });

  it("preserves JSON structure for normal objects", () => {
    const s = serializeTogstrekJsonLd({ "@type": "WebSite", name: "Test" });
    expect(JSON.parse(s)).toEqual({ "@type": "WebSite", name: "Test" });
  });

  it("escapes U+2028 and U+2029 line separators", () => {
    const s = serializeTogstrekJsonLd({ note: "a\u2028b\u2029c" });
    const parsed = JSON.parse(s) as { note: string };
    expect(parsed.note).toBe("a\u2028b\u2029c");
  });
});
