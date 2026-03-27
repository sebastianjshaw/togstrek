/**
 * Download place images referenced in MDX from Squarespace CDN URLs embedded in the
 * HTTrack HTML mirror. The backup often omits image binaries; this fills
 * migration/cdn-upload-ready for upload to R2/S3 (same paths as media:restructure).
 *
 * Usage:
 *   npm run media:fetch-places -- --dry-run
 *   npm run media:fetch-places
 *   npm run media:fetch-places -- --places copenhagen
 *   npm run media:fetch-places -- --backup ./TogsTrekBackup --out ./migration/cdn-upload-ready
 *
 * Default --backup: $TOGSTREK_MEDIA_BACKUP_ROOT, else ./TogsTrekBackup (must contain togstrek.com/... HTML).
 */

import * as fs from "node:fs";
import * as path from "node:path";

type PlaceSpec = { slug: string; htmlRelative: string };

const DEFAULT_PLACES: PlaceSpec[] = [
  {
    slug: "copenhagen",
    htmlRelative: "togstrek.com/europe/denmark/copenhagen.html",
  },
  {
    slug: "helsingor",
    htmlRelative: "togstrek.com/europe/denmark/helsingor.html",
  },
];

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i;

function parseArgs(argv: string[]): {
  backupRoot: string;
  outRoot: string;
  dryRun: boolean;
  places: PlaceSpec[];
} {
  let backupRoot = (() => {
    const env = process.env.TOGSTREK_MEDIA_BACKUP_ROOT?.trim();
    if (env) return path.resolve(env);
    return path.resolve(process.cwd(), "TogsTrekBackup");
  })();
  let outRoot = path.resolve(process.cwd(), "migration/cdn-upload-ready");
  let dryRun = false;
  let placeFilter: string[] | null = null;

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") dryRun = true;
    else if (a === "--backup" && argv[i + 1]) {
      backupRoot = path.resolve(process.cwd(), argv[++i]!);
    } else if (a === "--out" && argv[i + 1]) {
      outRoot = path.resolve(process.cwd(), argv[++i]!);
    } else if (a === "--places" && argv[i + 1]) {
      placeFilter = argv[++i]!.split(",").map((s) => s.trim().toLowerCase());
    }
  }

  const places =
    placeFilter === null
      ? DEFAULT_PLACES
      : DEFAULT_PLACES.filter((p) => placeFilter!.includes(p.slug));

  return { backupRoot, outRoot, dryRun, places };
}

/** Turn og:image / twitter relative refs into fetchable https URLs. */
function normalizeMetaImageUrl(rel: string): string | null {
  const trimmed = rel.trim();
  const withoutQuery = trimmed.split("?")[0]!;
  // HTTrack uses ../../../host/... — strip every leading ../ segment.
  const deDot = withoutQuery.replace(/^(\.\.\/)+/, "");
  let hostPath = deDot;

  if (hostPath.startsWith("//")) {
    hostPath = "https:" + hostPath;
  } else if (
    hostPath.startsWith("static1.squarespace.com") ||
    hostPath.startsWith("images.squarespace-cdn.com")
  ) {
    hostPath = "https://" + hostPath;
  } else {
    return null;
  }

  try {
    const u = new URL(hostPath);
    if (!IMAGE_EXT.test(u.pathname)) return null;
    // Old mirrors omit /v1/ in og:image paths.
    if (
      u.hostname === "images.squarespace-cdn.com" &&
      u.pathname.includes("/content/") &&
      !u.pathname.includes("/content/v1/")
    ) {
      u.pathname = u.pathname.replace("/content/", "/content/v1/");
    }
    return u.toString();
  } catch {
    return null;
  }
}

function collectUrlsFromHtml(html: string): string[] {
  const urls = new Set<string>();

  for (const m of html.matchAll(
    /data-src="(https:\/\/images\.squarespace-cdn\.com[^"]+)"/gi,
  )) {
    const u = m[1]!.split("?")[0]!;
    if (u.includes("/memberAccountAvatars/") || u.includes("/namespaces/"))
      continue;
    if (!IMAGE_EXT.test(u)) continue;
    urls.add(u);
  }

  for (const m of html.matchAll(
    /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/gi,
  )) {
    const abs = normalizeMetaImageUrl(m[1]!);
    if (abs) urls.add(abs.split("?")[0]!);
  }

  for (const m of html.matchAll(
    /<link[^>]+rel="image_src"[^>]+href="([^"]+)"/gi,
  )) {
    const abs = normalizeMetaImageUrl(m[1]!);
    if (abs) urls.add(abs.split("?")[0]!);
  }

  return [...urls];
}

function basenameForUrl(imageUrl: string): string {
  const u = new URL(imageUrl);
  const last = u.pathname.split("/").pop() ?? "";
  return decodeURIComponent(last);
}

async function downloadToFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "TogstrekMediaMigration/1.0 (site owner; fetching own Squarespace assets)",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
}

async function main(): Promise<void> {
  const { backupRoot, outRoot, dryRun, places } = parseArgs(process.argv);

  if (!places.length) {
    console.error("No places matched --places filter.");
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;

  for (const place of places) {
    const htmlPath = path.join(backupRoot, place.htmlRelative);
    if (!fs.existsSync(htmlPath)) {
      console.error(`Missing HTML mirror: ${htmlPath}`);
      fail++;
      continue;
    }

    const html = fs.readFileSync(htmlPath, "utf8");
    const urls = collectUrlsFromHtml(html);
    const byBase = new Map<string, string>();

    for (const u of urls) {
      const base = basenameForUrl(u);
      const existing = byBase.get(base);
      if (existing && existing !== u) {
        console.warn(
          `  [${place.slug}] Ambiguous basename "${base}" — keeping first URL`,
        );
        continue;
      }
      if (!existing) byBase.set(base, u);
    }

    const destDir = path.join(outRoot, "europe", "denmark", place.slug);
    console.log(
      `\n${place.slug}: ${byBase.size} unique files → ${path.relative(process.cwd(), destDir)}`,
    );

    for (const [filename, imageUrl] of byBase) {
      const dest = path.join(destDir, filename);
      if (fs.existsSync(dest)) {
        console.log(`  skip (exists) ${filename}`);
        ok++;
        continue;
      }
      if (dryRun) {
        console.log(`  [dry-run] ${filename} ← ${imageUrl}`);
        ok++;
        continue;
      }
      try {
        await downloadToFile(imageUrl, dest);
        console.log(`  ok ${filename}`);
        ok++;
      } catch (e) {
        console.error(`  FAIL ${filename}: ${e}`);
        fail++;
      }
    }
  }

  console.log(`\nSummary: ${ok} ok, ${fail} failed/skipped paths`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
