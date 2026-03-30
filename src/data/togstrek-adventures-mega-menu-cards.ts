import { listSortedTogstrekAdventureArchiveItems } from "@/lib/togstrek-adventure-content-fs";
import { buildTogstrekAdventuresMegaFeaturedCards } from "@/data/togstrek-adventures-mega-menu";

/**
 * Precomputed featured adventure cards for nav + home spotlight.
 * Server-only graph (reads `content/adventures` via `fs`).
 */
export const togstrekAdventuresMegaFeaturedCards =
  buildTogstrekAdventuresMegaFeaturedCards(
    listSortedTogstrekAdventureArchiveItems(),
  );
