/**
 * Cloudflare Worker that starts the "Instagram post" GitHub workflow at a fixed
 * local time, because GitHub's own cron is unreliable for this repo (the 16:17 UTC
 * run once started 5 hours late). It calls the workflow's `workflow_dispatch`
 * trigger with `live=true`.
 *
 * Cron triggers in Workers are UTC only, so wrangler.toml schedules both 10:30 and
 * 11:30 UTC and this code lets through only the one that is 12:30 in Sweden
 * (10:30 UTC in summer, 11:30 UTC in winter). See README.md for setup.
 */

export const TIME_ZONE = "Europe/Stockholm";
export const POST_HOUR = 12;

const REPO = "sebastianjshaw/togstrek";
const WORKFLOW_FILE = "instagram.yml";
const REF = "main";

/** True when `date` falls in the 12:xx hour in Sweden. */
export function isPostHourInSweden(date) {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .find((p) => p.type === "hour")?.value;
  return Number(hour) === POST_HOUR;
}

async function dispatchWorkflow(token) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "togstrek-instagram-trigger",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: REF, inputs: { live: "true" } }),
    },
  );
  if (res.status !== 204) {
    throw new Error(
      `GitHub workflow_dispatch failed: ${res.status} ${await res.text()}`,
    );
  }
}

export default {
  async scheduled(event, env) {
    const when = new Date(event.scheduledTime);
    if (!isPostHourInSweden(when)) {
      console.log(`Skipping ${when.toISOString()}: not 12:xx in ${TIME_ZONE}.`);
      return;
    }
    if (!env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN secret is not set.");
    await dispatchWorkflow(env.GITHUB_TOKEN);
    console.log(`Dispatched ${WORKFLOW_FILE} at ${when.toISOString()}.`);
  },
};
