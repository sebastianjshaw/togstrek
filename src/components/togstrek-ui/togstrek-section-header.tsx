import type { ReactNode } from "react";

type TogstrekSectionHeaderProps = {
  id: string;
  title: string;
  description?: ReactNode;
  /** Larger lead size (e.g. "Where to" intro). */
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
        className="font-tt-display text-tt-display font-bold uppercase tracking-tt-wide text-tt-text-primary"
      >
        {title}
      </h2>
      {description ? (
        <div
          className={
            descriptionProminent
              ? "mt-tt-4 max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-lead text-tt-text-secondary"
              : "mt-tt-4 max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-body text-tt-text-secondary"
          }
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}
