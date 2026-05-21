import { describe, expect, it } from "vitest";

import { resolveTogstrekLightboxTabWrapTarget } from "@/components/togstrek-ui/togstrek-mdx-lightbox-focus";

function focusableStub(tag: string): HTMLElement {
  return { tag, focus: () => {} } as unknown as HTMLElement;
}

describe("resolveTogstrekLightboxTabWrapTarget", () => {
  const first = focusableStub("first");
  const last = focusableStub("last");
  const focusables = [first, last];
  const root = {
    contains: (el: Element | null) =>
      focusables.includes(el as HTMLElement),
  } as unknown as HTMLElement;

  it("wraps forward from last to first", () => {
    expect(
      resolveTogstrekLightboxTabWrapTarget(focusables, last, root, false),
    ).toBe(first);
  });

  it("wraps backward from first to last", () => {
    expect(
      resolveTogstrekLightboxTabWrapTarget(focusables, first, root, true),
    ).toBe(last);
  });

  it("does not wrap when focus is between ends", () => {
    const mid = focusableStub("mid");
    const three = [first, mid, last];
    const rootThree = {
      contains: (el: Element | null) =>
        three.includes(el as HTMLElement),
    } as unknown as HTMLElement;
    expect(
      resolveTogstrekLightboxTabWrapTarget(three, mid, rootThree, false),
    ).toBeNull();
  });
});
