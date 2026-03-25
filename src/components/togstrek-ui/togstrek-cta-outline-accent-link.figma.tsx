import figma from "@figma/code-connect";

import { TogstrekCtaOutlineAccentLink } from "./togstrek-cta-outline-accent-link";

/**
 * Code Connect for Figma **Link / CTA** (`Togstrek / Color semantic` + outline accent).
 *
 * - **State=Hover** in Figma mirrors `:hover` in CSS (no separate prop).
 * - **Size=Compact** maps to the optional `sm:min-h-11` class used on the homepage hero.
 */
figma.connect(
  TogstrekCtaOutlineAccentLink,
  "https://www.figma.com/design/ZtxSpBg0N8od1rn4thYeCU?node-id=18-10",
  {
    props: {
      children: figma.textContent("EXPLORE REGIONS"),
      className: figma.className([
        figma.enum("Size", {
          Default: "",
          Compact: "sm:min-h-11",
        }),
      ]),
    },
    example: ({ children, className }) => (
      <TogstrekCtaOutlineAccentLink href="/europe" className={className}>
        {children}
      </TogstrekCtaOutlineAccentLink>
    ),
  },
);
