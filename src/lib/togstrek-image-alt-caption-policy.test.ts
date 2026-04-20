import { describe, expect, it } from "vitest";

import {
  classifyMarkdownImageAlt,
  resolveAccessibilityAlt,
  resolveVisibleCaption,
} from "@/lib/togstrek-image-alt-caption-policy";

describe("togstrek-image-alt-caption-policy", () => {
  it("classifies EXIF camera line", () => {
    const exif =
      "Canon EOS R5 EF17-40mm f/4L USM, 20mm, f11, 1/200, ISO100";
    expect(classifyMarkdownImageAlt(exif)).toBe("exif");
    expect(resolveVisibleCaption(exif)).toBe(exif);
    expect(resolveAccessibilityAlt(exif)).toBe(exif);
  });

  it("classifies descriptive alt", () => {
    const d = "Sunset over the medina walls.";
    expect(classifyMarkdownImageAlt(d)).toBe("descriptive");
    expect(resolveVisibleCaption(d)).toBe(d);
    expect(resolveAccessibilityAlt(d)).toBe(d);
  });

  it("classifies technical filename alt", () => {
    const f = "20240814-export-003A4043.jpg";
    expect(classifyMarkdownImageAlt(f)).toBe("technical_filename");
    expect(resolveVisibleCaption(f)).toBeNull();
    expect(resolveAccessibilityAlt(f)).toBe("");
  });

  it("classifies empty alt", () => {
    expect(classifyMarkdownImageAlt("")).toBe("empty");
    expect(resolveVisibleCaption("")).toBeNull();
    expect(resolveAccessibilityAlt("")).toBe("");
  });
});
