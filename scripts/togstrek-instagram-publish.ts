/**
 * Posts the next page from the site to Instagram, one image per post, working
 * through every eligible place and hiking page and then starting again.
 *
 *   # Safe by default: shows what would be posted next. Posts nothing.
 *   npx tsx scripts/togstrek-instagram-publish.ts
 *
 *   # Preview the next 20 posts (caption, image, page) without any state change
 *   npx tsx scripts/togstrek-instagram-publish.ts --preview 20
 *
 *   # See which pages are skipped and why
 *   npx tsx scripts/togstrek-instagram-publish.ts --list-rejected
 *
 *   # Include pages whose descriptions use generic marketing wording
 *   npx tsx scripts/togstrek-instagram-publish.ts --allow-generic --list-rejected
 *
 *   # Really post (needs INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN)
 *   npx tsx scripts/togstrek-instagram-publish.ts --post --state path/to/state.json
 *
 * Setup and scheduling: docs/instagram-autopost.md
 */

import fs from "node:fs";
import path from "node:path";

import { collectTogstrekInstagramCandidates } from "@/lib/togstrek-instagram-collect";
import {
  buildTogstrekInstagramCaption,
  emptyTogstrekInstagramState,
  normalizeTogstrekInstagramState,
  orderTogstrekInstagramCandidates,
  pickNextTogstrekInstagramCandidates,
  recordTogstrekInstagramPost,
  TOGSTREK_INSTAGRAM_DEFAULT_MIN_WORDS,
  type TogstrekInstagramCandidate,
  type TogstrekInstagramState,
} from "@/lib/togstrek-instagram-post";
import { getTogstrekSiteOrigin } from "@/lib/togstrek-site-url";

const DEFAULT_SEED = "togstrek-instagram-v1";
const DEFAULT_GRAPH_VERSION = "v23.0";
const MAX_TRIES = 10;

type Args = {
  post: boolean;
  preview: number;
  listRejected: boolean;
  statePath: string;
  seed: string;
  minWords: number;
  allowGeneric: boolean;
};

function parseArgs(): Args {
  const a = process.argv.slice(2);
  const out: Args = {
    post: false,
    preview: 0,
    listRejected: false,
    statePath: path.resolve(process.cwd(), ".instagram-state.json"),
    seed: DEFAULT_SEED,
    minWords: TOGSTREK_INSTAGRAM_DEFAULT_MIN_WORDS,
    allowGeneric: false,
  };
  for (let i = 0; i < a.length; i++) {
    const v = a[i + 1];
    if (a[i] === "--post") out.post = true;
    else if (a[i] === "--list-rejected") out.listRejected = true;
    else if (a[i] === "--allow-generic") out.allowGeneric = true;
    else if (a[i] === "--preview" && v) {
      out.preview = Math.max(1, Number.parseInt(v, 10) || 1);
      i++;
    } else if (a[i] === "--state" && v) {
      out.statePath = path.resolve(process.cwd(), v);
      i++;
    } else if (a[i] === "--seed" && v) {
      out.seed = v;
      i++;
    } else if (a[i] === "--min-words" && v) {
      out.minWords = Math.max(0, Number.parseInt(v, 10) || 0);
      i++;
    }
  }
  return out;
}

function loadState(statePath: string): TogstrekInstagramState {
  try {
    const raw = JSON.parse(fs.readFileSync(statePath, "utf8")) as Partial<TogstrekInstagramState>;
    if (raw && raw.version === 1 && Array.isArray(raw.posted)) {
      return {
        version: 1,
        cycle: typeof raw.cycle === "number" ? raw.cycle : 1,
        posted: raw.posted.filter((k): k is string => typeof k === "string"),
        last: raw.last,
      };
    }
  } catch {
    /* no state yet: first run */
  }
  return emptyTogstrekInstagramState();
}

function saveState(statePath: string, state: TogstrekInstagramState): void {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const tmp = `${statePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + "\n");
  fs.renameSync(tmp, statePath);
}

async function probe(url: string): Promise<{ status: number; type: string }> {
  const opts = { redirect: "manual" as const, signal: AbortSignal.timeout(20_000) };
  let res = await fetch(url, { ...opts, method: "HEAD" });
  if (res.status === 405 || res.status === 501) {
    res = await fetch(url, { ...opts, method: "GET" });
  }
  return { status: res.status, type: res.headers.get("content-type") ?? "" };
}

/** The page must be live (200, no redirect) and the image must be a public JPEG. */
async function checkLive(
  c: TogstrekInstagramCandidate,
  origin: string,
): Promise<string | null> {
  try {
    const page = await probe(`${origin}${c.path}`);
    if (page.status !== 200) return `page returned ${page.status}`;
    const img = await probe(c.imageUrl);
    if (img.status !== 200) return `image returned ${img.status}`;
    if (!/image\/jpe?g/i.test(img.type)) return `image is ${img.type || "unknown type"}`;
    return null;
  } catch (e) {
    return `check failed: ${(e as Error).message}`;
  }
}

type GraphResponse = { id?: string; status_code?: string; error?: { message?: string; code?: number; type?: string } };

async function graph(
  method: "GET" | "POST",
  endpoint: string,
  params: Record<string, string>,
  token: string,
  version: string,
): Promise<GraphResponse> {
  const base = (process.env.INSTAGRAM_GRAPH_BASE?.trim() || "https://graph.facebook.com").replace(/\/+$/, "");
  const url = new URL(`${base}/${version}/${endpoint}`);
  const body = new URLSearchParams({ ...params, access_token: token });
  let res: Response;
  if (method === "GET") {
    body.forEach((v, k) => url.searchParams.set(k, v));
    res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  } else {
    res = await fetch(url, { method: "POST", body, signal: AbortSignal.timeout(60_000) });
  }
  const json = (await res.json()) as GraphResponse;
  if (json.error) {
    const e = json.error;
    throw new Error(
      `Instagram API error${e.code ? ` ${e.code}` : ""}${e.type ? ` (${e.type})` : ""}: ${e.message ?? "unknown"}`,
    );
  }
  return json;
}

async function publishToInstagram(
  c: TogstrekInstagramCandidate,
  caption: string,
  env: { userId: string; token: string; version: string },
): Promise<string> {
  const params: Record<string, string> = { image_url: c.imageUrl, caption };
  if (c.imageAlt && c.imageAlt.length <= 1000) params.alt_text = c.imageAlt;
  const container = await graph("POST", `${env.userId}/media`, params, env.token, env.version);
  if (!container.id) throw new Error("Instagram did not return a container id");

  for (let i = 0; i < 12; i++) {
    const s = await graph(
      "GET",
      container.id,
      { fields: "status_code" },
      env.token,
      env.version,
    );
    if (s.status_code === "FINISHED") break;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") {
      throw new Error(`Instagram container ${s.status_code}`);
    }
    if (i === 11) throw new Error("Instagram container was not ready in time");
    await new Promise((r) => setTimeout(r, 5000));
  }

  const published = await graph(
    "POST",
    `${env.userId}/media_publish`,
    { creation_id: container.id },
    env.token,
    env.version,
  );
  if (!published.id) throw new Error("Instagram did not return a media id");
  return published.id;
}

function describe(c: TogstrekInstagramCandidate, caption: string, origin: string): string {
  return [
    `Page:    ${origin}${c.path}`,
    `Image:   ${c.imageUrl}`,
    `Alt:     ${c.imageAlt ?? "(none)"}`,
    "Caption:",
    ...caption.split("\n").map((l) => `  ${l}`),
  ].join("\n");
}

async function main(): Promise<void> {
  const args = parseArgs();
  const origin = process.env.TOGSTREK_SITE_ORIGIN?.replace(/\/+$/, "") || getTogstrekSiteOrigin();
  const { eligible, rejected } = collectTogstrekInstagramCandidates({
    minWords: args.minWords,
    allowGeneric: args.allowGeneric,
  });
  const ordered = orderTogstrekInstagramCandidates(eligible, args.seed);

  console.log(`Eligible pages: ${eligible.length}   Skipped: ${rejected.length}`);

  if (args.listRejected) {
    const byReason = new Map<string, string[]>();
    for (const r of rejected) {
      byReason.set(r.reason, [...(byReason.get(r.reason) ?? []), r.path]);
    }
    for (const [reason, paths] of [...byReason].sort((a, b) => b[1].length - a[1].length)) {
      console.log(`\n${reason} (${paths.length})`);
      for (const p of paths.sort()) console.log(`  ${p}`);
    }
    return;
  }

  if (eligible.length === 0) {
    throw new Error("No eligible pages found. Nothing to post.");
  }

  let state = normalizeTogstrekInstagramState(loadState(args.statePath), eligible);
  console.log(
    `Cycle ${state.cycle}: ${state.posted.length} of ${eligible.length} posted so far.\n`,
  );

  if (args.preview > 0) {
    let sim = state;
    for (let n = 1; n <= args.preview; n++) {
      sim = normalizeTogstrekInstagramState(sim, eligible);
      const next = pickNextTogstrekInstagramCandidates(ordered, sim, 1)[0];
      if (!next) break;
      console.log(`--- Post ${n} ---`);
      console.log(describe(next, buildTogstrekInstagramCaption(next, origin), origin));
      console.log("");
      sim = recordTogstrekInstagramPost(sim, next, "preview", new Date().toISOString());
    }
    return;
  }

  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const version = process.env.INSTAGRAM_GRAPH_VERSION?.trim() || DEFAULT_GRAPH_VERSION;
  if (args.post && (!userId || !token)) {
    throw new Error("INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN must be set to post.");
  }

  const tries = pickNextTogstrekInstagramCandidates(ordered, state, MAX_TRIES);
  for (const c of tries) {
    const problem = await checkLive(c, origin);
    if (problem) {
      console.log(`Skipping ${c.path}: ${problem}`);
      continue;
    }
    const caption = buildTogstrekInstagramCaption(c, origin);
    console.log(describe(c, caption, origin));
    if (!args.post) {
      console.log("\nDry run: nothing posted. Add --post to publish.");
      return;
    }
    const mediaId = await publishToInstagram(c, caption, {
      userId: userId!,
      token: token!,
      version,
    });
    state = recordTogstrekInstagramPost(state, c, mediaId, new Date().toISOString());
    saveState(args.statePath, state);
    console.log(`\nPosted. Instagram media id ${mediaId}. State saved to ${args.statePath}.`);
    return;
  }
  throw new Error(`None of the next ${tries.length} pages passed the live check.`);
}

main().catch((e) => {
  console.error(`\nError: ${(e as Error).message}`);
  process.exit(1);
});
