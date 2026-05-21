const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function queryTogstrekLightboxFocusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
  );
}

/** When Tab would leave the overlay, return the element that should receive focus. */
export function resolveTogstrekLightboxTabWrapTarget(
  focusables: HTMLElement[],
  activeElement: Element | null,
  root: HTMLElement,
  shiftKey: boolean,
): HTMLElement | null {
  if (focusables.length === 0) return null;

  const first = focusables[0]!;
  const last = focusables[focusables.length - 1]!;
  const activeInside =
    activeElement != null &&
    typeof (activeElement as HTMLElement).focus === "function" &&
    root.contains(activeElement);

  if (shiftKey) {
    if (activeElement === first || !activeInside) return last;
    return null;
  }
  if (activeElement === last || !activeInside) return first;
  return null;
}

/** Keep Tab / Shift+Tab inside the lightbox overlay. */
export function handleTogstrekLightboxFocusTrap(
  root: HTMLElement,
  event: KeyboardEvent,
): void {
  if (event.key !== "Tab") return;
  const focusables = queryTogstrekLightboxFocusables(root);
  const target = resolveTogstrekLightboxTabWrapTarget(
    focusables,
    document.activeElement,
    root,
    event.shiftKey,
  );
  if (!target) return;
  event.preventDefault();
  target.focus();
}
