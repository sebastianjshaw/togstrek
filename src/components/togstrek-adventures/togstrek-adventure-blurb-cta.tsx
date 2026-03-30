import { TogstrekCtaOutlineAccentExternalLink } from "@/components/togstrek-ui/togstrek-cta-outline-accent-link";

const BLURB_BOOKS_HREF = "https://www.blurb.com/user/shawsolution";

type TogstrekAdventureBlurbCtaProps = {
  className?: string;
};

/**
 * Standard call-to-action for adventure stories: print collections on Blurb.
 */
export function TogstrekAdventureBlurbCta({
  className = "togstrek-adventure-blurb-cta",
}: TogstrekAdventureBlurbCtaProps) {
  return (
    <div
      className={`${className} max-w-[var(--tt-layout-max-prose)] space-y-[var(--tt-space-6)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary`}
    >
      <p>
        This trip is part of the longer adventure archive. The full narrative with
        extended galleries lives in the site&apos;s photo books — same stories,
        laid out for reading away from the screen.
      </p>
      <p>
        <TogstrekCtaOutlineAccentExternalLink
          href={BLURB_BOOKS_HREF}
          target="_blank"
          rel="noopener noreferrer"
        >
          Buy the books on Blurb
        </TogstrekCtaOutlineAccentExternalLink>
      </p>
    </div>
  );
}
