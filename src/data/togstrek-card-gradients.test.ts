import { describe, expect, it } from "vitest";

import {
  TOGSTREK_CARD_GRADIENTS,
  TOGSTREK_HUB_STRIP_GRADIENT_CYCLE,
  togstrekCardGradientClass,
  togstrekHubStripGradientId,
} from "@/data/togstrek-card-gradients";

describe("togstrek-card-gradients", () => {
  it("resolves every token to tailwind gradient stops", () => {
    for (const id of Object.keys(TOGSTREK_CARD_GRADIENTS) as Array<
      keyof typeof TOGSTREK_CARD_GRADIENTS
    >) {
      const cls = togstrekCardGradientClass(id);
      expect(cls).toMatch(/^from-\[/);
      expect(cls).toContain(" via-");
      expect(cls).toContain(" to-");
    }
  });

  it("cycles hub strip gradients", () => {
    expect(togstrekHubStripGradientId(0)).toBe(
      TOGSTREK_HUB_STRIP_GRADIENT_CYCLE[0],
    );
    expect(togstrekHubStripGradientId(TOGSTREK_HUB_STRIP_GRADIENT_CYCLE.length)).toBe(
      TOGSTREK_HUB_STRIP_GRADIENT_CYCLE[0],
    );
  });
});
