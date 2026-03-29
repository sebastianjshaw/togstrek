import Link from "next/link";
import type { ComponentProps } from "react";

/** Inline prose / footer link — accent underline; use with `Link` or merge onto `<a>`. */
export const TOGSTREK_BODY_LINK_CLASSNAME =
  "text-tt-accent underline decoration-tt-accent/30 underline-offset-2 transition-colors hover:decoration-tt-accent";

export type TogstrekBodyLinkProps = Omit<
  ComponentProps<typeof Link>,
  "className"
> & {
  className?: string;
};

export function TogstrekBodyLink({
  className,
  ...props
}: TogstrekBodyLinkProps) {
  return (
    <Link
      {...props}
      className={
        className
          ? `${TOGSTREK_BODY_LINK_CLASSNAME} ${className}`
          : TOGSTREK_BODY_LINK_CLASSNAME
      }
    />
  );
}
