import { describe, expect, it } from "vitest";

import { buildSuggestedCaptionFromExif } from "./togstrek-exif-caption";

describe("buildSuggestedCaptionFromExif", () => {
  it("dedupes make when model already starts with make", () => {
    expect(
      buildSuggestedCaptionFromExif({
        Make: "Canon",
        Model: "Canon EOS R5",
        LensModel: "RF16mm F2.8 STM",
        FocalLength: 16,
        FNumber: 3.2,
        ExposureTime: 1 / 250,
        ISO: 6400,
      }),
    ).toBe("Canon EOS R5 RF16mm F2.8 STM, 16mm, f3.2, 1/250, ISO6400");
  });

  it("keeps make + model when model omits brand", () => {
    expect(
      buildSuggestedCaptionFromExif({
        Make: "Canon",
        Model: "EOS R5",
        LensModel: "RF24-105mm",
        FocalLength: 50,
        FNumber: 8,
        ExposureTime: 1 / 500,
        ISO: 200,
      }),
    ).toBe("Canon EOS R5 RF24-105mm, 50mm, f8, 1/500, ISO200");
  });

  it("returns null when no usable fields", () => {
    expect(buildSuggestedCaptionFromExif({})).toBeNull();
  });

  it("falls back to Exif pixel dimensions when camera exposure block is absent", () => {
    expect(
      buildSuggestedCaptionFromExif({
        ExifImageWidth: 2366,
        ExifImageHeight: 1775,
      }),
    ).toBe("2366×1775 (Exif image size)");
  });
});
