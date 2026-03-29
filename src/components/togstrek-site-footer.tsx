import { TogstrekBodyLink } from "@/components/togstrek-ui/togstrek-body-link";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";

export function TogstrekSiteFooter() {
  return (
    <footer className="togstrek-site-footer border-t border-tt-border-muted bg-tt-surface-base py-[max(var(--tt-space-12),env(safe-area-inset-bottom))]">
      <TogstrekContentWidth max="content">
        <p className="text-center font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary [overflow-wrap:anywhere]">
          Unless noted, photographs and text © Sebastian Shaw ·{" "}
          <TogstrekBodyLink href="/copyright">Usage & copyright</TogstrekBodyLink>
        </p>
      </TogstrekContentWidth>
    </footer>
  );
}
