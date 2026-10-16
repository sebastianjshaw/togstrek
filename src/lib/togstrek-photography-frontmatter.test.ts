import { describe, expect, it } from "vitest";

import { parseTogstrekPhotographyFrontmatter } from "./togstrek-photography-frontmatter";

const base = { title: "A post", description: "About it" };

describe("parseTogstrekPhotographyFrontmatter", () => {
  it("reads collections and drops non-strings", () => {
    const fm = parseTogstrekPhotographyFrontmatter({
      ...base,
      collections: ["events", 3, "", "guides"],
    });
    expect(fm.collections).toEqual(["events", "guides"]);
  });

  it("leaves collections undefined when absent or empty", () => {
    expect(parseTogstrekPhotographyFrontmatter(base).collections).toBeUndefined();
    expect(
      parseTogstrekPhotographyFrontmatter({ ...base, collections: [] })
        .collections,
    ).toBeUndefined();
  });

  it("accepts dates that the YAML parser returned as Date objects", () => {
    const fm = parseTogstrekPhotographyFrontmatter({
      ...base,
      published: new Date("2009-01-31T00:00:00.000Z"),
      modified: "2022-06-13",
    });
    expect(fm.published).toBe("2009-01-31T00:00:00.000Z");
    expect(fm.modified).toBe("2022-06-13");
  });
});
