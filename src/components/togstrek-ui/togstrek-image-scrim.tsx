/**
 * Gradient-to-top dark scrim that overlays hero and card images.
 * Replaces repeated inline gradient markup across hero, link-card, and featured-adventure.
 * CSS classes live in globals.css @layer components.
 */

type TogstrekImageScrimVariant = "default" | "deep" | "soft";

type TogstrekImageScrimProps = {
  /** "default" 88/35/12%, "deep" 92/45/12%, "soft" 78/transparent */
  variant?: TogstrekImageScrimVariant;
  className?: string;
};

export function TogstrekImageScrim({
  variant = "default",
  className,
}: TogstrekImageScrimProps) {
  const variantClass =
    variant === "deep"
      ? " togstrek-image-scrim--deep"
      : variant === "soft"
        ? " togstrek-image-scrim--soft"
        : "";
  const base = `togstrek-image-scrim${variantClass}`;
  return (
    <div className={className ? `${base} ${className}` : base} aria-hidden={true} />
  );
}
