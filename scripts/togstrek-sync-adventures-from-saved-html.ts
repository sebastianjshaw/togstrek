/**
 * Sync `content/adventures/<slug>.mdx` from browser-saved Squarespace adventure HTML
 * (e.g. `~/Downloads/2021_ Pink Streets & Blue Tiles — A Tog's Trek.html`).
 *
 * - Intro: `article#sections` sections until the first summary/grid block; text from
 *   `.sqs-html-content` (h1–h3, p) plus button links.
 * - Featured: `.summary-item` cards → `TogstrekAdventureFeaturedPlace` with CDN images
 *   from matching `content/places/.../*.mdx` hero when the place exists.
 *
 * Usage:
 *   npx tsx scripts/togstrek-sync-adventures-from-saved-html.ts --dry-run
 *   npx tsx scripts/togstrek-sync-adventures-from-saved-html.ts --apply --downloads ~/Downloads
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { load } from "cheerio";
import type { AnyNode } from "domhandler";

import { loadTogstrekPlaceFrontmatterOnly } from "@/lib/togstrek-place-mdx-fs";

const REPO_ROOT = process.cwd();
const ADVENTURES_DIR = path.join(REPO_ROOT, "content/adventures");
const PLACES_ROOT = path.join(REPO_ROOT, "content", "places");

/** Saved HTML basename glob → adventure slug (filename without .mdx). */
const DOWNLOAD_HTML_TO_SLUG: [string, string][] = [
  ["2021_ Pink Streets & Blue Tiles — A Tog's Trek.html", "2021-pink-streets-blue-tiles"],
  ["2018_ Bedouin Stars — A Tog's Trek.html", "2018-bedouin-stars"],
  ["2019_ Seeing Sweden — A Tog's Trek.html", "2019-seeing-sweden"],
  [
    "2019_ Chasing the Beagle - Ecuador & the Galapagos Islands — A Tog's Trek.html",
    "2019-chasing-the-beagle",
  ],
  ["2008_ Istanbul — A Tog's Trek.html", "2008-istanbul"],
  ["2009_ Thailand — A Tog's Trek.html", "2009-thailand"],
  ["2010_ I Left My Stock in Sacramento — A Tog's Trek.html", "2010-i-left-my-stock-in-sacramento"],
  ["2011_ Travelling through Nepal — A Tog's Trek.html", "2011-travelling-through-nepal"],
  ["2012_ Gorillas in the Mud — A Tog's Trek.html", "2012-gorillas-in-the-mud"],
  ["2013_ Boarding in Bansko — A Tog's Trek.html", "2013-boarding-in-bansko"],
  ["2013_ Silent Cities and Blue Lagoons — A Tog's Trek.html", "2013-silent-cities-and-blue-lagoons"],
  ["2014_ Tagine Dreams — A Tog's Trek.html", "2014-tagine-dreams"],
  ["2016_ Casablanca — A Tog's Trek.html", "2016-casablanca"],
  ["2017_ Pura Vida — A Tog's Trek.html", "2017-pura-vida"],
  ["2018_ 12 Cities in 12 Months — A Tog's Trek.html", "2018-12-cities-in-12-months"],
  ["2018_ Alpine Adventure — A Tog's Trek.html", "2018-alpine-adventure"],
];

function stripSiteTitle(raw: string): string {
  return raw
    .replace(/\s*[—–]\s*A Tog's Trek\s*$/i, "")
    .replace(/\s*&mdash;\s*A Tog&#39;s Trek\s*$/i, "")
    .trim();
}

function decodeText(s: string): string {
  return s
    .replace(/\u00a0/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTogstrekPath(href: string): string | null {
  try {
    const u = href.startsWith("http") ? new URL(href) : new URL(href, "https://togstrek.com");
    if (!/togstrek\.com$/i.test(u.hostname) && u.hostname !== "") return null;
    let p = u.pathname.replace(/\/$/, "") || "/";
    p = p.replace(/^\/europe\/europe\//i, "/europe/");
    p = p.replace(/^\/asia\/isreal\//i, "/asia/israel/");
    return p;
  } catch {
    return null;
  }
}

function parsePlacePath(
  pathname: string,
): { continent: string; country: string; place: string[] } | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 3) return null;
  const continent = parts[0]!;
  const country = parts[1]!;
  const place = parts.slice(2);
  if (place.length === 0) return null;
  const mdxPath = path.join(PLACES_ROOT, continent, country, ...place) + ".mdx";
  if (!fs.existsSync(mdxPath)) return null;
  return { continent, country, place };
}

function formatCardDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function yamlScalar(s: string): string {
  return JSON.stringify(s);
}

function jsxStringProp(value: string): string {
  if (!/[&<>"']/.test(value) && !value.includes("\n")) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return `{${JSON.stringify(value)}}`;
}

type IntroPiece =
  | { kind: "h1" | "h2" | "h3" | "h4"; text: string }
  | { kind: "p"; text: string }
  | { kind: "a"; text: string; href: string };

function insideSummaryBlock($: ReturnType<typeof load>, el: AnyNode): boolean {
  return $(el).closest(".sqs-block-summary-v2, .summary-v2-block").length > 0;
}

function extractIntro($: ReturnType<typeof load>): IntroPiece[] {
  const article = $("article#sections, article.sections").first();
  if (!article.length) return [];

  const pieces: IntroPiece[] = [];
  const sections = article.children("section.page-section");
  let stopAfterThisSection = false;

  sections.each((_, secEl) => {
    if (stopAfterThisSection) return false;

    const $sec = $(secEl);
    const sectionHasSummary =
      $sec.find(".sqs-block-summary-v2, .summary-v2-block").length > 0;

    $sec.find(".sqs-html-content[data-sqsp-text-block-content]").each((__, blockEl) => {
      if (insideSummaryBlock($, blockEl)) return;
      const $b = $(blockEl);
      $b.find("h1").each((_, h) => {
        const t = decodeText($(h).text());
        if (t) pieces.push({ kind: "h1", text: t });
      });
      $b.find("h2").each((_, h) => {
        const t = decodeText($(h).text());
        if (t) pieces.push({ kind: "h2", text: t });
      });
      $b.find("h3").each((_, h) => {
        const t = decodeText($(h).text());
        if (t) pieces.push({ kind: "h3", text: t });
      });
      $b.find("h4").each((_, h) => {
        const t = decodeText($(h).text());
        if (t) pieces.push({ kind: "h4", text: t });
      });
      $b.find("p").each((_, p) => {
        const t = decodeText($(p).text());
        if (t) pieces.push({ kind: "p", text: t });
      });
    });

    $sec.find(".sqs-block-button a[href]").each((__, aEl) => {
      if (insideSummaryBlock($, aEl)) return;
      const $a = $(aEl);
      const text = decodeText($a.text());
      const href = $a.attr("href")?.trim() ?? "";
      if (text && href) pieces.push({ kind: "a", text, href });
    });

    if (sectionHasSummary) stopAfterThisSection = true;
    return undefined;
  });

  return pieces;
}

function normalizeBuyBookHref(href: string, adventureSlug: string): string {
  const p = normalizeTogstrekPath(href);
  if (p === `/adventures/${adventureSlug}`) return "#";
  return href;
}

function introPiecesToMdx(pieces: IntroPiece[], adventureSlug: string): string {
  const lines: string[] = [];
  for (const p of pieces) {
    if (p.kind === "h1") lines.push("", `# ${p.text}`, "");
    else if (p.kind === "h2") lines.push("", `## ${p.text}`, "");
    else if (p.kind === "h3") lines.push("", `### ${p.text}`, "");
    else if (p.kind === "h4") lines.push("", `#### ${p.text}`, "");
    else if (p.kind === "p") lines.push("", p.text, "");
    else if (p.kind === "a") {
      const h = normalizeBuyBookHref(p.href, adventureSlug);
      lines.push("", `[${p.text}](${h})`, "");
    }
  }
  return lines.join("\n").trim();
}

type Card = {
  href: string;
  title: string;
  dateTime: string;
  excerpt: string;
  imageSrc: string;
  imageAlt: string;
};

function extractFeaturedCards($: ReturnType<typeof load>): Card[] {
  const article = $("article#sections, article.sections").first();
  const items = article.find(".summary-item");
  const cards: Card[] = [];

  items.each((_, el) => {
    const $el = $(el);
    const $link = $el.find("a.summary-title-link").first();
    if (!$link.length) return;
    const title = decodeText($link.text());
    const rawHref = $link.attr("href") ?? "";
    const path = normalizeTogstrekPath(rawHref);
    if (!path || !title) return;

    const $time = $el.find("time[datetime]").first();
    const dateTime = $time.attr("datetime")?.trim() ?? "";
    if (!/^\d{4}-\d{2}-\d{2}/.test(dateTime)) return;

    const excerpt = decodeText($el.find(".summary-excerpt p").first().text());
    const $img = $el.find("img.summary-thumbnail-image").first();
    const sqSrc =
      $img.attr("data-image") || $img.attr("data-src") || $img.attr("src") || "";

    let imageSrc = "";
    let imageAlt = title;
    const place = parsePlacePath(path);
    if (place) {
      try {
        const fm = loadTogstrekPlaceFrontmatterOnly(
          place.continent,
          place.country,
          place.place,
        );
        if (fm.heroImage?.src) imageSrc = fm.heroImage.src;
        if (fm.heroImage?.alt) imageAlt = fm.heroImage.alt;
      } catch {
        /* use fallback */
      }
    }
    if (!imageSrc && sqSrc.startsWith("http")) {
      imageSrc = sqSrc.split("?")[0]!;
    }

    cards.push({
      href: path,
      title,
      dateTime: dateTime.slice(0, 10),
      excerpt: excerpt || title,
      imageSrc,
      imageAlt,
    });
  });

  return cards;
}

function buildMdx(
  slug: string,
  docTitle: string,
  description: string,
  introMdx: string,
  cards: Card[],
): string {
  const fmTitle = yamlScalar(docTitle);
  const fmDesc = yamlScalar(description);

  let body = `<div className="togstrek-adventure-mdx-intro mx-auto max-w-[var(--tt-layout-max-prose)]">\n\n${introMdx}\n\n</div>\n`;

    if (cards.length > 0) {
    body += `\n<TogstrekAdventureFeaturedSection title="Featured">\n\n`;
    for (const c of cards) {
      if (!c.imageSrc) {
        console.warn(`  skip card (no image): ${c.title} ${c.href}`);
        continue;
      }
      const dateLabel = formatCardDate(c.dateTime);
      body += `  <TogstrekAdventureFeaturedPlace\n`;
      body += `    href=${jsxStringProp(c.href)}\n`;
      body += `    title=${jsxStringProp(c.title)}\n`;
      body += `    date=${jsxStringProp(dateLabel)}\n`;
      body += `    dateTime=${jsxStringProp(c.dateTime)}\n`;
      body += `    imageSrc=${jsxStringProp(c.imageSrc)}\n`;
      body += `    imageAlt=${jsxStringProp(c.imageAlt)}\n`;
      body += `    excerpt=${jsxStringProp(c.excerpt)}\n`;
      body += `  />\n\n`;
    }
    body += `</TogstrekAdventureFeaturedSection>\n`;
  }

  return `---
title: ${fmTitle}
description: ${fmDesc}
slug: ${slug}
---

${body}`;
}

function extractOgDescription(html: string): string {
  const m = html.match(
    /<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i,
  );
  if (m?.[1]) return decodeText(m[1]);
  const m2 = html.match(
    /<meta[^>]+content="([^"]*)"[^>]+property="og:description"/i,
  );
  return m2?.[1] ? decodeText(m2[1]) : "";
}

function extractTitleTag(html: string): string {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m?.[1] ? stripSiteTitle(decodeText(m[1])) : "";
}

function main() {
  const argv = process.argv.slice(2);
  let dryRun = true;
  let downloads = path.join(process.env.HOME ?? "", "Downloads");
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--apply") dryRun = false;
    else if (argv[i] === "--downloads" && argv[i + 1]) {
      downloads = argv[++i]!;
    }
  }

  for (const [htmlName, slug] of DOWNLOAD_HTML_TO_SLUG) {
    const htmlPath = path.join(downloads, htmlName);
    if (!fs.existsSync(htmlPath)) {
      console.warn(`Skip (missing): ${htmlPath}`);
      continue;
    }
    const html = fs.readFileSync(htmlPath, "utf8");
    const $ = load(html);

    const docTitle = extractTitleTag(html) || slug;
    let description = extractOgDescription(html);
    if (!description) {
      const intro = extractIntro($);
      const firstP = intro.find((x) => x.kind === "p") as IntroPiece | undefined;
      description = firstP && firstP.kind === "p" ? firstP.text : docTitle;
    }
    if (description.length > 200) {
      description = `${description.slice(0, 197)}…`;
    }

    const introPieces = extractIntro($);
    const introMdx = introPiecesToMdx(introPieces, slug);
    const cards = extractFeaturedCards($);
    const mdx = buildMdx(slug, docTitle, description, introMdx, cards);
    const outPath = path.join(ADVENTURES_DIR, `${slug}.mdx`);

    console.log(
      `${slug}: intro blocks=${introPieces.length}, featured=${cards.filter((c) => c.imageSrc).length} → ${path.basename(outPath)}`,
    );

    if (!dryRun) {
      fs.writeFileSync(outPath, mdx, "utf8");
    }
  }

  if (dryRun) {
    console.log("\nDry run — pass --apply to write MDX files.");
  }
}

main();
