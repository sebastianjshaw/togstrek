import type { ReactNode } from "react";

type TogstrekSectionHeaderProps = {
  id: string;
  title: string;
  description?: ReactNode;
  /** Larger lead size (e.g. “Where to” intro). */
  descriptionProminent?: boolean;
  className?: string;
};

/** H2 + optional lead — hub sections, region grids, maps. */
export function TogstrekSectionHeader({
  id,
  title,
  description,
  descriptionProminent,
  className,
}: TogstrekSectionHeaderProps) {
  return (
    <div className={className}>
      <h2
        id={id}
        className="font-tt-display text-[length:var(--tt-text-display)] font-bold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-primary"
      >
        {title}
      </h2>
      {description ? (
        <div
          className={
            descriptionProminent
              ? "mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] text-tt-text-secondary"
              : "mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-text-secondary"
          }
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}
