import { describe, expect, it } from "vitest";

import {
  isFilenameLikeImageAlt,
  isTechnicalImageFilenameAlt,
  shouldReplaceAltWithExif,
} from "./togstrek-mdx-image-caption";

describe("isFilenameLikeImageAlt", () => {
  it("matches migration-style TogsTrek filenames", () => {
    expect(
      isFilenameLikeImageAlt(
        "20240814-Animals-20240814 - TogsTrek - 003A4043.jpg",
      ),
    ).toBe(true);
  });

  it("rejects prose captions", () => {
    expect(isFilenameLikeImageAlt("Camels beside the road near Darvaza")).toBe(
      false,
    );
  });
});

describe("isTechnicalImageFilenameAlt", () => {
  it("treats filename alt as technical when it is not an EXIF line", () => {
    expect(
      isTechnicalImageFilenameAlt(
        "20240814-Animals-20240814 - TogsTrek - 003A4043.jpg",
      ),
    ).toBe(true);
  });

  it("does not treat camera EXIF captions as technical filenames", () => {
    expect(
      isTechnicalImageFilenameAlt(
        "Canon EOS R5, 24mm, f8, 1/250, ISO400",
      ),
    ).toBe(false);
  });
});

describe("shouldReplaceAltWithExif", () => {
  it("targets empty and filename-like alts", () => {
    expect(shouldReplaceAltWithExif("")).toBe(true);
    expect(shouldReplaceAltWithExif("  ")).toBe(true);
    expect(shouldReplaceAltWithExif("x.jpg")).toBe(true);
    expect(shouldReplaceAltWithExif("The crater at dawn")).toBe(false);
  });
});
