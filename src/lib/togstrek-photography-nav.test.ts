import { describe, expect, it } from "vitest";

import {
  buildTogstrekPhotographyBreadcrumbItems,
  isTogstrekPhotographyCategorySlug,
} from "@/lib/togstrek-photography-nav";

describe("buildTogstrekPhotographyBreadcrumbItems", () => {
  it("roots at /photography", () => {
    const items = buildTogstrekPhotographyBreadcrumbItems(
      ["events", "goteborgsvarvet-2024"],
      "Göteborgsvarvet 2024",
    );
    expect(items[0]).toEqual({ href: "/photography", label: "Photography" });
    expect(items[1]?.href).toBe("/photography/events");
    expect(items[1]?.label).toBe("Events");
    expect(items[2]?.label).toBe("Göteborgsvarvet 2024");
    expect(items[2]?.href).toBeUndefined();
  });

  it("omits section link for single-segment posts", () => {
    const items = buildTogstrekPhotographyBreadcrumbItems(
      ["explosion-at-sejdeln"],
      "Explosion at Sejdeln",
    );
    expect(items).toHaveLength(2);
    expect(items[0]?.href).toBe("/photography");
    expect(items[1]?.label).toBe("Explosion at Sejdeln");
  });
});

describe("isTogstrekPhotographyCategorySlug", () => {
  it("treats events as a category hub", () => {
    expect(isTogstrekPhotographyCategorySlug("events")).toBe(true);
  });

  it("does not treat a root-level essay file as a category", () => {
    expect(isTogstrekPhotographyCategorySlug("explosion-at-sejdeln")).toBe(
      false,
    );
  });
});
