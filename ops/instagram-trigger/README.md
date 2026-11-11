# Instagram post trigger (Cloudflare Worker)

Starts the "Instagram post" GitHub workflow every day at **12:30 Swedish time**,
all year (summer and winter time). GitHub's own `schedule:` was dropped because it
ran unreliably for this repo.

How it works: Cloudflare runs the Worker at 10:30 and 11:30 UTC. `worker.mjs`
lets through only the run that is 12:xx in `Europe/Stockholm`, then calls GitHub's
`workflow_dispatch` API with `live=true`. The workflow itself decides what to post
and keeps its place on the `instagram-state` branch (see `docs/instagram-autopost.md`).

## One-time setup

You do these steps yourself because they involve your accounts and a token.

1. **GitHub token.** github.com → Settings → Developer settings → Personal access
   tokens → Fine-grained tokens → Generate new token.
   - Repository access: **Only select repositories** → `togstrek`
   - Repository permissions: **Actions: Read and write** (Metadata read is added
     automatically). Nothing else.
   - Expiry: pick the longest you are comfortable with and note the date. When it
     expires the Worker's runs fail with a 401 in its logs and posting stops.
   - Copy the token. It is shown once.
2. **Deploy the Worker.** In your terminal:

   ```bash
   cd ~/Documents/Code/togstrek/ops/instagram-trigger
   npx wrangler login
   npx wrangler deploy
   ```
3. **Store the token as a secret** (it prompts you; paste the token there so it is
   not saved in shell history):

   ```bash
   npx wrangler secret put GITHUB_TOKEN
   ```
4. **Check it.** Cloudflare dashboard → Workers & Pages → `togstrek-instagram-trigger`
   → Triggers shows both crons. To test without waiting for 12:30, in the Worker's
   page use **Triggers → Cron Triggers → Test** (or `npx wrangler dev --test-scheduled`
   and open `/__scheduled`). A test outside the 12:xx hour logs "Skipping" and does
   nothing, which is correct. To force a real dispatch, run the workflow by hand from
   the Actions tab with "Post for real" ticked.

## Pausing and day-to-day

- **Pause posting:** set the repo variable `INSTAGRAM_POSTING_ENABLED` to anything
  except `true` (or delete it). Live runs then do nothing. Or delete the Worker's cron
  triggers in the Cloudflare dashboard.
- **Change the time:** edit `POST_HOUR` in `worker.mjs` (and the two UTC crons in
  `wrangler.toml` so both summer and winter 12:xx are covered), then `npx wrangler deploy`.
- **Logs:** Cloudflare dashboard → the Worker → Logs. A successful day logs
  "Dispatched instagram.yml".
