import { describe, expect, it } from "vitest";

import {
  buildTogstrekPhotographyBreadcrumbItems,
  discoverTogstrekPhotographyCategorySlugs,
  isTogstrekPhotographyCategorySlug,
  listTogstrekPhotographySlugListsInCategory,
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

describe("photography collections", () => {
  const slugsIn = (category: string) =>
    listTogstrekPhotographySlugListsInCategory(category).map((s) => s.join("/"));

  it("lists each collection once, folding the single-post duplicate folders", () => {
    const categories = discoverTogstrekPhotographyCategorySlugs();
    expect(categories).toContain("events");
    expect(categories).toContain("models");
    expect(categories).not.toContain("event");
    expect(categories).not.toContain("model");
  });

  it("includes posts from the duplicate folders in the main collection", () => {
    expect(slugsIn("events")).toContain("event/up-close-and-personal");
    expect(slugsIn("models")).toContain("model/corporate-self-portraits");
  });

  it("includes root-level posts that the Other work sections list", () => {
    expect(slugsIn("art-nude")).toEqual(
      expect.arrayContaining([
        "acrobatic-art-nudes",
        "art-nude/art-nude-with-ivoryflame",
      ]),
    );
    expect(slugsIn("guides")).toContain("night-shooting-guide");
  });

  it("links a post in a duplicate folder to its collection in breadcrumbs", () => {
    const items = buildTogstrekPhotographyBreadcrumbItems(
      ["event", "up-close-and-personal"],
      "Up close and personal...",
    );
    expect(items[1]).toEqual({ href: "/photography/events", label: "Events" });
  });
});
