import figma from "@figma/code-connect";

import { togstrekFeaturedAlpineAdventure } from "@/data/togstrek-featured-alpine-adventure";

import { TogstrekFeaturedAdventure } from "./togstrek-featured-adventure";

/**
 * Homepage **Spotlight** section — `layout="media"` matches the large image card on `/`.
 *
 * In Figma: turn the captured frame into a **Component** and publish the library so Dev Mode
 * resolves this mapping. Then run `npm run figma:connect:publish`.
 * Set a **text** component property named **Heading ID** in Figma (matches `sectionAriaLabelledBy`).
 * Use `togstrek-home-spotlight-heading` to match the homepage. Any `figma.string` / `figma.enum`
 * name here must match a property on the Figma component exactly (validation on publish).
 *
 * **`node not found in file` on publish:** The `node-id` in the URL below no longer exists
 * (component deleted, duplicated, or recreated). Select the Spotlight component in Figma →
 * **Copy link to selection** → replace the `figma.connect` URL here with that link.
 * Until then: `npm run figma:connect:publish:skip-validation` (still needs `FIGMA_ACCESS_TOKEN`).
 */
figma.connect(
  TogstrekFeaturedAdventure,
  "https://www.figma.com/design/axhlJxzsUWgHwBXVkqnO42/Togstrek-Design-Library?node-id=3-3&t=8KOIiANN7EAwWGlK-0",
  {
    props: {
      sectionAriaLabelledBy: figma.string("Heading ID"),
    },
    example: ({ sectionAriaLabelledBy }) => (
      <TogstrekFeaturedAdventure
        layout="media"
        adventure={togstrekFeaturedAlpineAdventure}
        sectionAriaLabelledBy={sectionAriaLabelledBy}
      />
    ),
  },
);
