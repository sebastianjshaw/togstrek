import Link from "next/link";
import type { ComponentProps } from "react";

import { TOGSTREK_BODY_LINK_CLASSNAME } from "@/components/togstrek-ui/togstrek-body-link";
import {
  isTogstrekExternalHref,
  resolveTogstrekInternalPathname,
} from "@/lib/togstrek-same-origin-href";

const TOGSTREK_MDX_ANCHOR_CLASSNAME = `togstrek-mdx-a ${TOGSTREK_BODY_LINK_CLASSNAME}`;

type TogstrekMdxAnchorProps = ComponentProps<"a">;

/** MDX inline link — `Link` for same-origin paths, `<a>` for external. */
export function TogstrekMdxAnchor({
  href,
  children,
  className,
  target,
  rel,
  ...rest
}: TogstrekMdxAnchorProps) {
  const internalPath = resolveTogstrekInternalPathname(href);
  const mergedClassName = className
    ? `${TOGSTREK_MDX_ANCHOR_CLASSNAME} ${className}`
    : TOGSTREK_MDX_ANCHOR_CLASSNAME;

  if (internalPath) {
    return (
      <Link href={internalPath} className={mergedClassName}>
        {children}
      </Link>
    );
  }

  const external = isTogstrekExternalHref(href);
  return (
    <a
      href={href}
      className={mergedClassName}
      target={target ?? (external ? "_blank" : undefined)}
      rel={rel ?? (external ? "noopener noreferrer" : undefined)}
      {...rest}
    >
      {children}
    </a>
  );
}
