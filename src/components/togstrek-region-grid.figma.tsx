import figma from "@figma/code-connect";

import { TogstrekRegionGrid } from "./togstrek-region-grid";

/**
 * Homepage **Where to** section — the responsive tile grid (Adventures, continents,
 * Hiking, Other Work) on `/`.
 *
 * **Publish validation:** Code Connect only accepts a **Component** or **Component Set**
 * node. If validation says *“not a component or component set”*, select the section in
 * Figma → **Create component** (⌥⌘K) → publish the library → **Copy link to selection**
 * and replace the `figma.connect` URL below (the `node-id=` value changes).
 *
 * Until then: `npm run figma:connect:publish:skip-validation` (still needs token).
 *
 * **`node not found`:** Same — paste a fresh link from the component after it moves or is recreated.
 */
figma.connect(
  TogstrekRegionGrid,
  "https://www.figma.com/design/axhlJxzsUWgHwBXVkqnO42/Togstrek-Design-Library?node-id=5-18&t=8KOIiANN7EAwWGlK-0",
  {
    example: () => <TogstrekRegionGrid />,
  },
);
