import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  areTogstrekCountryHubRouteParamsSafe,
  areTogstrekPlaceRouteParamsSafe,
  isTogstrekPathWithinRoot,
  isTogstrekSafeUrlPathSegment,
} from "./togstrek-path-safety";

describe("isTogstrekSafeUrlPathSegment", () => {
  it("accepts lowercase slug segments", () => {
    expect(isTogstrekSafeUrlPathSegment("egypt")).toBe(true);
    expect(isTogstrekSafeUrlPathSegment("united-kingdom")).toBe(true);
    expect(isTogstrekSafeUrlPathSegment("san-francisco")).toBe(true);
  });

  it("rejects traversal, uppercase, spaces, and empty", () => {
    expect(isTogstrekSafeUrlPathSegment("..")).toBe(false);
    expect(isTogstrekSafeUrlPathSegment("Egypt")).toBe(false);
    expect(isTogstrekSafeUrlPathSegment("new york")).toBe(false);
    expect(isTogstrekSafeUrlPathSegment("")).toBe(false);
    expect(isTogstrekSafeUrlPathSegment("a/b")).toBe(false);
  });

  it("rejects segments over max length", () => {
    const long = "a".repeat(129);
    expect(isTogstrekSafeUrlPathSegment(long)).toBe(false);
  });
});

describe("areTogstrekCountryHubRouteParamsSafe", () => {
  it("requires both continent and country safe", () => {
    expect(areTogstrekCountryHubRouteParamsSafe("asia", "uzbekistan")).toBe(true);
    expect(areTogstrekCountryHubRouteParamsSafe("asia", "../etc")).toBe(false);
  });
});

describe("areTogstrekPlaceRouteParamsSafe", () => {
  it("validates place segment list", () => {
    expect(
      areTogstrekPlaceRouteParamsSafe("asia", "uzbekistan", ["bukhara"]),
    ).toBe(true);
    expect(
      areTogstrekPlaceRouteParamsSafe("asia", "uzbekistan", ["..", "secret"]),
    ).toBe(false);
  });
});

describe("isTogstrekPathWithinRoot", () => {
  const tmpRoots: string[] = [];

  afterEach(() => {
    for (const r of tmpRoots.splice(0)) {
      fs.rmSync(r, { recursive: true, force: true });
    }
  });

  it("returns true for files under root", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "togstrek-root-"));
    tmpRoots.push(root);
    const nested = path.join(root, "continent", "country", "place.mdx");
    fs.mkdirSync(path.dirname(nested), { recursive: true });
    fs.writeFileSync(nested, "");
    expect(isTogstrekPathWithinRoot(nested, root)).toBe(true);
  });

  it("returns false for path outside root", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "togstrek-root2-"));
    tmpRoots.push(root);
    const outsideFile = path.resolve(
      path.join(root, "..", `togstrek-outside-${Date.now()}.txt`),
    );
    fs.writeFileSync(outsideFile, "");
    try {
      expect(isTogstrekPathWithinRoot(outsideFile, root)).toBe(false);
    } finally {
      fs.unlinkSync(outsideFile);
    }
  });

  it("returns false when candidate is exactly the root directory", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "togstrek-root3-"));
    tmpRoots.push(root);
    expect(isTogstrekPathWithinRoot(root, root)).toBe(false);
  });
});
