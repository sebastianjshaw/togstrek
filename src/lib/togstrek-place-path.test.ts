import { describe, expect, it } from "vitest";

import {
  buildTogstrekPlacePublicPath,
  togstrekPlaceLeafSegment,
  togstrekPlacePathFromSegments,
} from "@/lib/togstrek-place-path";

describe("buildTogstrekPlacePublicPath", () => {
  it("returns country hub path when there are no place segments", () => {
    expect(buildTogstrekPlacePublicPath("europe", "sweden", [])).toBe(
      "/europe/sweden",
    );
  });

  it("joins one or more place segments after the country", () => {
    expect(buildTogstrekPlacePublicPath("europe", "sweden", ["stockholm"])).toBe(
      "/europe/sweden/stockholm",
    );
    expect(
      buildTogstrekPlacePublicPath("north-america", "united-states-of-america", [
        "california",
        "los-angeles",
      ]),
    ).toBe("/north-america/united-states-of-america/california/los-angeles");
  });
});

describe("togstrekPlacePathFromSegments", () => {
  it("joins with slashes", () => {
    expect(togstrekPlacePathFromSegments(["a", "b"])).toBe("a/b");
    expect(togstrekPlacePathFromSegments([])).toBe("");
  });
});

describe("togstrekPlaceLeafSegment", () => {
  it("returns last segment or empty", () => {
    expect(togstrekPlaceLeafSegment(["california", "oakland"])).toBe("oakland");
    expect(togstrekPlaceLeafSegment([])).toBe("");
  });
});
