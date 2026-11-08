# Instagram auto-posting

A scheduled job posts one image a day to the Tog's Trek Instagram account, linking back to a page on the site. It works through every eligible place and hiking page, then starts again from the top.

- **What gets posted:** one image per post (the page's hero photo) with a templated caption: `Title, Region`, the page description, the page address, and a few hashtags.
- **What is included:** place pages and hiking pages. Adventures, photography and Other Work are never posted.
- **How often:** daily at 16:00 UTC (`.github/workflows/instagram.yml`).
- **After the last page:** the queue starts a new cycle. Pages added later join the queue automatically.

## What is skipped, and why

A page is held back from the feed when it:

| Reason | What to do |
| --- | --- |
| is a draft, a stub or has placeholder text (`### NAME`, "stub", "placeholder") | finish the page |
| has fewer than 120 words of writing | write more, or leave it |
| has a `description` that is cut off or under 40 characters | rewrite the description |
| has a `description` with generic wording ("charming", "picturesque", "nestled", "testament to", "must-visit", …) | rewrite it in the site's voice (see `docs/brand-tone-of-voice.md`) |
| has no hero image, or the hero is not a JPEG (Instagram accepts JPEG only) | add a JPEG hero |
| has a hero outside 4:5 to 1.91:1 (panoramas) | use a less extreme hero |

Skipped pages join the queue by themselves once they pass. To see the current list and reasons:

```bash
npx tsx scripts/togstrek-instagram-publish.ts --list-rejected
```

The generic-wording check can be switched off with `--allow-generic` when previewing. The scheduled job never uses it.

## Preview before it goes live

These commands post nothing and change nothing:

```bash
# Next post, with live checks that the page and image are reachable
npx tsx scripts/togstrek-instagram-publish.ts

# The next 20 posts, in order
npx tsx scripts/togstrek-instagram-publish.ts --preview 20
```

Before each post the script also checks that the page returns 200 on the live site and that the image is a public JPEG. A page that has been added to the repo but not deployed yet is passed over and tried again on a later day.

## One-time setup

You need to do the Meta steps yourself: they involve your Instagram login and an app secret. These steps are for a Meta app that uses **Instagram API setup with Unified login**, which is what newer apps get. (Meta calls the Facebook Login route legacy, and the Instagram Login route is not offered to newer apps.) No Facebook Page is needed, but the app does need to belong to a business portfolio.

1. **Account.** The Instagram account is a Business or Creator account.
2. **Meta app.** At [developers.facebook.com](https://developers.facebook.com) the app uses the "Manage messaging & content on Instagram" use case. Keep it in **Development mode** with you as an admin: that is enough to publish to your own account without App Review.
3. **Permissions.** In the dashboard go to Use cases → Manage messaging & content on Instagram → Customize → *API setup with Unified login* → Configure your app. The configuration needs `instagram_basic` and `instagram_content_publish`.
4. **Redirect URL.** The configuration form asks you to "Register a new redirect URL". It must be an HTTPS address you control. Use `https://www.togstrek.com/`. Nothing on the site needs to handle it, because the steps below skip the sign-in flow that uses it.
5. **Token (shortcut for your own account).** On the same API setup page, find the step *Generate access tokens*:
   1. Choose **Add account** and add your Instagram account as an Instagram Tester.
   2. Accept the invite on instagram.com: Settings → Website permissions → Apps and websites → Tester Invites.
   3. Back in the dashboard choose **Generate token**, complete the login and copy the token. **It is shown only once.**
6. **Instagram account id.** In your terminal, so the token is not saved in your shell history:

   ```bash
   printf 'Token: '; read -rs IG_TOKEN; echo
   curl -s "https://graph.facebook.com/v27.0/me/assigned_instagram_accounts?fields=id,username&access_token=$IG_TOKEN"
   ```

   The `id` for your account is the Instagram user id.
7. **GitHub secrets.** In the repo, Settings → Secrets and variables → Actions → *Secrets*, add:
   - `INSTAGRAM_USER_ID`: the id from step 6
   - `INSTAGRAM_ACCESS_TOKEN`: the token from step 5
8. **Dry run in Actions.** Actions → *Instagram post* → *Run workflow*, leaving "Post for real" unticked. It prints what it would post.
9. **First real post, by hand.** Run the same workflow with "Post for real" ticked, and check the post on Instagram.
10. **Turn on the schedule.** Settings → Secrets and variables → Actions → *Variables*, add `INSTAGRAM_POSTING_ENABLED` = `true`. Until this exists, scheduled runs do nothing. Delete the variable (or set it to anything else) to pause posting.

**Token lifetime.** Meta's pages say whether the token expires "depends on your configuration" and do not give a lifetime. Check the token's type and expiry in the dashboard's configuration preview. If it does expire, a scheduled run fails with an Instagram error (GitHub emails you); generate a new token and update the `INSTAGRAM_ACCESS_TOKEN` secret.

## How it keeps its place

The list of pages already posted is kept in `state.json` on a separate branch called `instagram-state`, so saving it never triggers a site deploy. Each live run commits the file back to that branch with `[skip ci]`.

To restart the queue from the beginning, delete `state.json` from that branch (or the branch itself). To skip a page for good, rewrite it so it fails one of the rules above, or tell the maintainer.

## Things to know

- **Links in captions are not clickable** on Instagram. The caption shows the page address as plain text. Put the site address in the account bio.
- **Rate limit:** Meta allows far more posts per day than this uses.
- **Token problems** show up as a failed workflow run (GitHub emails you). The error message from Instagram is printed in the log.
- **If a post succeeds but the state save fails**, the same page may be posted again the next day. Check the workflow log and the `instagram-state` branch.
- **Scheduled workflows pause** after 60 days without repository activity (a GitHub rule). Any commit or a manual run wakes them.
- **Graph API version** defaults to `v23.0` (Meta's current docs show `v27.0`) and can be changed with the `INSTAGRAM_GRAPH_VERSION` environment variable.

## Where the code is

- `src/lib/togstrek-instagram-post.ts`: eligibility rules, ordering, captions, state handling (unit-tested)
- `src/lib/togstrek-instagram-collect.ts`: reads the content files
- `scripts/togstrek-instagram-publish.ts`: the command-line runner and the Instagram API calls
- `.github/workflows/instagram.yml`: the schedule
