import Link from "next/link";

export type TogstrekBreadcrumbItem = {
  label: string;
  href?: string;
};

type TogstrekBreadcrumbProps = {
  items: TogstrekBreadcrumbItem[];
};

export function TogstrekBreadcrumb({ items }: TogstrekBreadcrumbProps) {
  return (
    <nav
      className="togstrek-breadcrumb font-tt-body text-tt-small text-tt-text-tertiary"
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.flatMap((item, index) => {
          const label = item.href ? (
            <Link
              href={item.href}
              className="text-tt-text-secondary hover:text-tt-accent"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-tt-text-primary">{item.label}</span>
          );
          if (index === 0) {
            return [<li key={`crumb-${index}`}>{label}</li>];
          }
          return [
            <li key={`sep-${index}`} className="text-tt-text-tertiary" aria-hidden={true}>
              /
            </li>,
            <li key={`crumb-${index}`}>{label}</li>,
          ];
        })}
      </ol>
    </nav>
  );
}
