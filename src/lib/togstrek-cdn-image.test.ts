import { afterEach, describe, expect, it } from "vitest";

import {
  buildTogstrekCdnSrcSet,
  isTogstrekCdnImageResizeEnabled,
  isTogstrekMediaCdnUrl,
  TOGSTREK_CDN_IMAGE_SLOT_CONFIG,
  togstrekCdnResizeUrl,
} from "@/lib/togstrek-cdn-image";

const SAMPLE =
  "https://media.togstrek.com/north-america/mexico/tulum/Beach-20221223-0001.jpg";

describe("togstrek-cdn-image", () => {
  const prev = process.env.NEXT_PUBLIC_CDN_IMAGE_RESIZE;

  afterEach(() => {
    if (prev === undefined) {
      delete process.env.NEXT_PUBLIC_CDN_IMAGE_RESIZE;
    } else {
      process.env.NEXT_PUBLIC_CDN_IMAGE_RESIZE = prev;
    }
  });

  it("detects media CDN URLs", () => {
    expect(isTogstrekMediaCdnUrl(SAMPLE)).toBe(true);
    expect(isTogstrekMediaCdnUrl("/local.png")).toBe(false);
  });

  it("builds Cloudflare resize URLs when enabled", () => {
    process.env.NEXT_PUBLIC_CDN_IMAGE_RESIZE = "true";
    expect(isTogstrekCdnImageResizeEnabled()).toBe(true);
    expect(togstrekCdnResizeUrl(SAMPLE, 960)).toBe(
      "https://media.togstrek.com/cdn-cgi/image/width=960,quality=85,format=auto/north-america/mexico/tulum/Beach-20221223-0001.jpg",
    );
    const srcSet = buildTogstrekCdnSrcSet(SAMPLE, [640, 960]);
    expect(srcSet).toContain("640w");
    expect(srcSet).toContain("960w");
  });

  it("omits srcset when resize is disabled", () => {
    delete process.env.NEXT_PUBLIC_CDN_IMAGE_RESIZE;
    expect(buildTogstrekCdnSrcSet(SAMPLE, [640, 960])).toBeUndefined();
  });

  it("documents sizes + width ladder for each image slot", () => {
    for (const config of Object.values(TOGSTREK_CDN_IMAGE_SLOT_CONFIG)) {
      expect(config.sizes.length).toBeGreaterThan(0);
      expect(config.widths.length).toBeGreaterThan(0);
      expect(config.widths[config.widths.length - 1]).toBeLessThanOrEqual(1920);
    }
  });
});
