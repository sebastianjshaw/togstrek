/**
 * Tailwind `bg-gradient-to-br` stop classes for link/region cards without photos.
 * Single source of truth — use {@link togstrekCardGradientClass} at render sites.
 */
export const TOGSTREK_CARD_GRADIENTS = {
  adventures: "from-[#1a1420] via-[#2d1f28] to-[#e31937]/40",
  africa: "from-[#3d2914] via-[#6b3a1a] to-[#1a1420]",
  antarctica: "from-[#0c1829] via-[#1e3a5f] to-[#7cb8d8]/35",
  asia: "from-[#1a1420] via-[#4a1538] to-[#e31937]/35",
  europe: "from-[#1f2838] via-[#3d4f6b] to-[#c9a86c]/30",
  northAmerica: "from-[#1a2332] via-[#2d4a3e] to-[#c4a574]/25",
  oceania: "from-[#0f2d3a] via-[#1e5c6b] to-[#7ec8d3]/30",
  southAmerica: "from-[#2a1a14] via-[#4a2a18] to-[#e35d2d]/35",
  hiking: "from-[#1b2a1e] via-[#2f4a32] to-[#8fbc8f]/25",
  otherWork: "from-[#1a1420] via-[#2a2230] to-[#8880a0]/35",
  hubPlaceFallback: "from-[#1f2838] via-[#3d4f6b] to-[#c9a86c]/30",
  ukEngland: "from-[#1a2332] via-[#2d4a3e] to-[#c4a574]/28",
  ukScotland: "from-[#1b2838] via-[#2a4a5c] to-[#7cb8d8]/30",
  ukWales: "from-[#1a2a24] via-[#2d4a38] to-[#6b9b7a]/28",
  ukNorthernIreland: "from-[#2a1a28] via-[#3d2a40] to-[#c9a86c]/25",
  hubStripForest: "from-[#1a2332] via-[#2d4a3e] to-[#c4a574]/28",
  hubStripSlate: "from-[#1f2838] via-[#3d4f6b] to-[#c9a86c]/30",
  hubStripPine: "from-[#1b2a1e] via-[#2f4a32] to-[#8fbc8f]/22",
  hubStripRust: "from-[#2a1a14] via-[#4a2a18] to-[#e35d2d]/28",
  hubStripWine: "from-[#1a1420] via-[#2d1f28] to-[#e31937]/28",
  hubStripArctic: "from-[#0f2d3a] via-[#1e5c6b] to-[#7ec8d3]/25",
} as const;

export type TogstrekCardGradientId = keyof typeof TOGSTREK_CARD_GRADIENTS;

/** Rotating palette for county / state / län hub strips (index % length). */
export const TOGSTREK_HUB_STRIP_GRADIENT_CYCLE: readonly TogstrekCardGradientId[] = [
  "hubStripForest",
  "hubStripSlate",
  "hubStripPine",
  "hubStripRust",
  "hubStripWine",
  "hubStripArctic",
];

export function togstrekCardGradientClass(id: TogstrekCardGradientId): string {
  return TOGSTREK_CARD_GRADIENTS[id];
}

export function togstrekHubStripGradientId(index: number): TogstrekCardGradientId {
  return TOGSTREK_HUB_STRIP_GRADIENT_CYCLE[
    index % TOGSTREK_HUB_STRIP_GRADIENT_CYCLE.length
  ]!;
}
