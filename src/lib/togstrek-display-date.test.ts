import { describe, expect, it } from "vitest";

import { formatTogstrekDisplayDate } from "./togstrek-display-date";

describe("formatTogstrekDisplayDate", () => {
  it("drops the time from ISO timestamps", () => {
    expect(formatTogstrekDisplayDate("2009-01-31T00:00:00.000Z")).toBe(
      "2009-01-31",
    );
    expect(formatTogstrekDisplayDate("2022-06-13T23:59:59+02:00")).toBe(
      "2022-06-13",
    );
  });

  it("leaves plain dates alone", () => {
    expect(formatTogstrekDisplayDate("2026-10-13")).toBe("2026-10-13");
  });

  it("trims and passes through unrecognised text", () => {
    expect(formatTogstrekDisplayDate("  June 2019 ")).toBe("June 2019");
  });

  it("returns undefined for empty input", () => {
    expect(formatTogstrekDisplayDate(undefined)).toBeUndefined();
    expect(formatTogstrekDisplayDate("   ")).toBeUndefined();
  });
});
