import { describe, expect, it } from "vitest";

import {
  buildTogstrekInstagramCaption,
  buildTogstrekInstagramCaptionHashtags,
  buildTogstrekInstagramHikingSummary,
  countTogstrekMdxProseWords,
  emptyTogstrekInstagramState,
  evaluateTogstrekInstagramEligibility,
  normalizeTogstrekInstagramState,
  orderTogstrekInstagramCandidates,
  pickNextTogstrekInstagramCandidates,
  recordTogstrekInstagramPost,
  togstrekInstagramHashtag,
  togstrekInstagramSegmentLabel,
  truncateAtWord,
  type TogstrekInstagramCandidate,
} from "@/lib/togstrek-instagram-post";

const prose = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

const goodInput = () => ({
  title: "Khiva",
  description: "A walled old city, mudbrick lanes and climbable minarets in the desert.",
  heroImage: {
    src: "https://media.togstrek.com/asia/uzbekistan/khiva/Palace%20-%20001.jpg",
    width: 1920,
    height: 1281,
    alt: "A gate",
  },
  body: prose(200),
});

function cand(key: string, groupKey: string, extra: Partial<TogstrekInstagramCandidate> = {}): TogstrekInstagramCandidate {
  return {
    key,
    kind: "place",
    title: key,
    description: "A description long enough to post about this place.",
    path: `/${key}`,
    groupKey,
    regionLabel: "Place",
    hashtags: [],
    imageUrl: `https://media.togstrek.com/${key}.jpg`,
    imageWidth: 1920,
    imageHeight: 1281,
    ...extra,
  };
}

describe("countTogstrekMdxProseWords", () => {
  it("ignores images, JSX tags, heading markers and rules", () => {
    const body = [
      "## Sights",
      "",
      '<PhotoGallery layout="grid3">',
      "![Canon EOS R5, 24mm](https://media.togstrek.com/a.jpg)",
      "</PhotoGallery>",
      "---",
      "One two three [four five](/x) six.",
    ].join("\n");
    expect(countTogstrekMdxProseWords(body)).toBe(7);
  });
});

describe("evaluateTogstrekInstagramEligibility", () => {
  it("accepts a finished page", () => {
    expect(evaluateTogstrekInstagramEligibility(goodInput())).toEqual({ ok: true });
  });

  it.each([
    ["draft", { draft: true }, "draft"],
    ["short description", { description: "Too short." }, "description too short"],
    [
      "cut-off description",
      { description: "A long description that stops in the middle of a sentence and is" },
      "description looks cut off",
    ],
    [
      "generic wording",
      { description: "A charming town with a picturesque harbour and a rich history." },
      "generic marketing wording in description",
    ],
    ["stub body", { body: `${prose(200)}\n\n### NAME\n` }, "placeholder or stub text"],
    ["no hero", { heroImage: undefined }, "no hero image"],
    [
      "png hero",
      {
        heroImage: {
          src: "https://media.togstrek.com/a.png",
          width: 1920,
          height: 1281,
        },
      },
      "hero is not a JPEG",
    ],
    [
      "panorama hero",
      {
        heroImage: {
          src: "https://media.togstrek.com/a.jpg",
          width: 4000,
          height: 1000,
        },
      },
      "hero aspect ratio outside 4:5 to 1.91:1",
    ],
    ["thin page", { body: prose(40) }, "fewer than 120 words of writing"],
  ])("rejects %s", (_name, patch, reason) => {
    const verdict = evaluateTogstrekInstagramEligibility({ ...goodInput(), ...patch });
    expect(verdict).toEqual({ ok: false, reason });
  });

  it("allows 'draft' in ordinary prose but not in the title", () => {
    expect(
      evaluateTogstrekInstagramEligibility({
        ...goodInput(),
        body: `${prose(200)} A few draft beers by the pint.`,
      }),
    ).toEqual({ ok: true });
    expect(
      evaluateTogstrekInstagramEligibility({ ...goodInput(), title: "Indonesia, draft" }),
    ).toEqual({ ok: false, reason: "placeholder or stub text" });
  });

  it("can be told to allow generic wording", () => {
    expect(
      evaluateTogstrekInstagramEligibility(
        { ...goodInput(), description: "A charming town with a picturesque harbour by the sea." },
        { allowGeneric: true },
      ),
    ).toEqual({ ok: true });
  });
});

describe("labels and hashtags", () => {
  it("labels slugs with lowercase joiners", () => {
    expect(togstrekInstagramSegmentLabel("united-states-of-america")).toBe("United States of America");
    expect(togstrekInstagramSegmentLabel("bosnia-and-herzegovina")).toBe("Bosnia and Herzegovina");
    expect(togstrekInstagramSegmentLabel("turkiye")).toBe("Türkiye");
  });

  it("makes hashtag-safe tags from accented and Nordic letters", () => {
    expect(togstrekInstagramHashtag("Snæfellsnes")).toBe("#Snaefellsnes");
    expect(togstrekInstagramHashtag("Kungälv")).toBe("#Kungalv");
    expect(togstrekInstagramHashtag("Mto Wa Mbu")).toBe("#MtoWaMbu");
    expect(togstrekInstagramHashtag("???")).toBe("");
  });

  it("uses the trail, not the stage title, for hiking tags", () => {
    expect(
      buildTogstrekInstagramCaptionHashtags({
        kind: "hiking",
        regionLabel: "Kungsleden",
        title: "Etapp 21 - Serve to Tärnasjö",
      }),
    ).toEqual(["#hiking", "#Kungsleden"]);
  });

  it("drops a title tag that is too long to read as a tag", () => {
    expect(
      buildTogstrekInstagramCaptionHashtags({
        kind: "place",
        regionLabel: "Uzbekistan",
        title: "Muhammad Rakhim Khan Madrasa Complex Entrance",
      }),
    ).toEqual(["#Uzbekistan"]);
  });
});

describe("truncateAtWord", () => {
  it("leaves short text alone and cuts long text at a sentence or word", () => {
    expect(truncateAtWord("Short.", 50)).toBe("Short.");
    const long = "First sentence is here. Second sentence goes on and on and on for a good while longer.";
    expect(truncateAtWord(long, 40)).toBe("First sentence is here.");
    // A sentence end in the first half is ignored so captions are not left tiny.
    expect(truncateAtWord(long, 60).endsWith("…")).toBe(true);
    expect(truncateAtWord("word ".repeat(40), 30).endsWith("…")).toBe(true);
  });
});

describe("buildTogstrekInstagramCaption", () => {
  it("has title and region, description, a plain address and hashtags", () => {
    const caption = buildTogstrekInstagramCaption(
      cand("asia/uzbekistan/khiva", "asia/uzbekistan", {
        title: "Khiva",
        regionLabel: "Uzbekistan",
        path: "/asia/uzbekistan/khiva",
        hashtags: ["#Uzbekistan", "#Khiva"],
      }),
      "https://www.togstrek.com",
    );
    expect(caption.split("\n\n")).toEqual([
      "Khiva, Uzbekistan",
      "A description long enough to post about this place.",
      "Full guide: www.togstrek.com/asia/uzbekistan/khiva",
      "#togstrek #travel #Uzbekistan #Khiva",
    ]);
  });

  it("does not repeat the title when the region is the same or empty", () => {
    const c = cand("monaco", "europe/monaco", { title: "Monaco", regionLabel: "Monaco" });
    expect(buildTogstrekInstagramCaption(c, "https://www.togstrek.com").startsWith("Monaco\n\n")).toBe(true);
    const d = cand("surtesjon", "hiking/surtesjon", { title: "Surtesjon", regionLabel: "" });
    expect(buildTogstrekInstagramCaption(d, "https://www.togstrek.com").startsWith("Surtesjon\n\n")).toBe(true);
  });

  it("stays within Instagram's caption limit", () => {
    const c = cand("x", "g", { description: "word ".repeat(2000) });
    expect(buildTogstrekInstagramCaption(c, "https://www.togstrek.com").length).toBeLessThanOrEqual(2200);
  });
});

describe("buildTogstrekInstagramHikingSummary", () => {
  it("replaces boilerplate with the trail facts", () => {
    expect(
      buildTogstrekInstagramHikingSummary({
        description: "Kungsleden: Serve to Tärnasjö, stage notes, terrain, and photos.",
        trailLabel: "Kungsleden",
        distanceKm: 14,
        difficulty: "Medium",
      }),
    ).toBe("A stage of the Kungsleden: 14 km, medium difficulty.");
  });

  it("keeps a real description", () => {
    const real = "Two days through the Sjunnen forest, with a night in a storm shelter.";
    expect(
      buildTogstrekInstagramHikingSummary({ description: real, trailLabel: "Tiveden", distanceKm: 9 }),
    ).toBe(real);
  });
});

describe("queue order, state and picking", () => {
  const all = [
    cand("a", "g1"),
    cand("b", "g1"),
    cand("c", "g2"),
    cand("d", "g3"),
    cand("e", "g2"),
  ];

  it("orders deterministically and keeps relative order when pages are added", () => {
    const first = orderTogstrekInstagramCandidates(all, "seed").map((c) => c.key);
    expect(orderTogstrekInstagramCandidates(all, "seed").map((c) => c.key)).toEqual(first);
    const withNew = orderTogstrekInstagramCandidates([...all, cand("f", "g4")], "seed")
      .map((c) => c.key)
      .filter((k) => k !== "f");
    expect(withNew).toEqual(first);
  });

  it("starts a new cycle once everything has been posted", () => {
    let state = emptyTogstrekInstagramState();
    for (const c of all) state = recordTogstrekInstagramPost(state, c, "id", "2026-01-01");
    const next = normalizeTogstrekInstagramState(state, all);
    expect(next.cycle).toBe(2);
    expect(next.posted).toEqual([]);
    expect(next.last?.key).toBe("e");
  });

  it("drops posted keys for pages that no longer exist", () => {
    const state = { ...emptyTogstrekInstagramState(), posted: ["a", "gone"] };
    expect(normalizeTogstrekInstagramState(state, all).posted).toEqual(["a"]);
  });

  it("avoids the group of the last post but still falls back to it", () => {
    const ordered = all;
    let state = recordTogstrekInstagramPost(emptyTogstrekInstagramState(), all[0]!, "id", "t");
    expect(pickNextTogstrekInstagramCandidates(ordered, state, 10).map((c) => c.key)).toEqual([
      "c",
      "d",
      "e",
      "b",
    ]);
    state = {
      ...state,
      posted: ["a", "c", "d", "e"],
      last: { key: "e", groupKey: "g2", mediaId: "id", postedAt: "t" },
    };
    expect(pickNextTogstrekInstagramCandidates(ordered, state, 10).map((c) => c.key)).toEqual(["b"]);
  });

  it("never picks a page twice in a cycle", () => {
    let state = emptyTogstrekInstagramState();
    const seen: string[] = [];
    for (let i = 0; i < all.length; i++) {
      state = normalizeTogstrekInstagramState(state, all);
      const next = pickNextTogstrekInstagramCandidates(all, state, 1)[0]!;
      seen.push(next.key);
      state = recordTogstrekInstagramPost(state, next, "id", "t");
    }
    expect(new Set(seen).size).toBe(all.length);
  });
});
