# Hosting research (Cloudflare, free tier)

Researched 2026-10-29 from Cloudflare's developer docs. **Status: proposal, nothing has been set up.**

## Pages vs Workers static assets

| | Pages | Workers + static assets |
|---|---|---|
| Status | Not deprecated; existing projects keep working | Where Cloudflare's migration guide points; new features land here |
| Hostname | `<project>.pages.dev` | `<worker-name>.<account-subdomain>.workers.dev` |
| Static asset requests | Free, unlimited | Free, unlimited |
| `_headers` file | Yes | Yes (100 rules max, 2,000 chars per line, not applied to Worker-script responses) |
| Config | Dashboard / wrangler | `wrangler.jsonc` in repo |
| Deploy from GitHub Actions | `wrangler pages deploy` | `wrangler deploy` |
| Branch/preview deploys | Built in | Opt-in (`preview_urls`) |
| Custom domain not on Cloudflare | Yes | No (irrelevant to us, D-012) |

**Caveat on "what Cloudflare recommends":** the migration guide and compatibility matrix I read treat Workers as the destination and describe it as having a broader feature set, but neither says in so many words "use Workers for new projects". Blog posts claim that wording; I could not confirm it on an official page. Pages is not being shut down.

## Free limits that matter to us

- Static asset requests: free and unlimited.
- Files per Worker version: 20,000. Max file size: 25 MiB. Our game will be tens of files.
- Workers per account: 100. We need 2.
- General Workers free limit of 100,000 requests/day applies to Worker-script invocations. With assets only and no `run_worker_first`, static requests don't invoke a script.
- Workers Builds (Cloudflare's own git CI): 3,000 build minutes/month, 1 concurrent build. **We won't use it** (see below), so this is moot.

## Recommendation

**Workers with static assets, two Workers: `cyfil` (prod) and `cyfil-dev`, deployed from GitHub Actions, not Cloudflare's git integration.**

Why:
1. Cloudflare's direction is Workers; picking Pages now means a migration later. Our needs are trivial, so either works today.
2. **Deploy gating.** Your rule is "never deploy to prod without approval". Cloudflare's git integration deploys on push. GitHub Actions + a protected GitHub Environment (`production`, required reviewer = you) makes prod deploy wait for your click. Environments with required reviewers are free on public repos.
3. Config lives in the repo (`wrangler.jsonc`), reviewable, no dashboard drift.

Why not Pages: it'd work equally well and has cleaner hostnames. If you prefer, say so, it's a small switch (a different deploy command, no `wrangler.jsonc` assets block).

## Things to know before saying yes

- **Origins are separate.** `cyfil.<sub>.workers.dev` and `cyfil-dev.<sub>.workers.dev` differ in host, so localStorage and service workers are isolated.
- **Public URLs.** Both are reachable by anyone who has the link. Cloudflare calls workers.dev "for personal or hobby projects", which matches. Nothing private is hosted. If you want it locked, Cloudflare Access can gate it (free tier covers up to 50 users, to be verified at setup time), but it complicates PWA install on iOS, so I'd skip it for now.
- **Your `<account-subdomain>` is public** in every URL. Pick something that isn't your real name or email.
- **Disable extra URLs.** I'll set `workers_dev` on and `preview_urls` off so no stray origins exist.
- **Cost.** Plan is free. I believe signup doesn't require a card; if it asks for one, stop and tell me. I will not enable any paid feature (no Workers Paid, no R2, no custom domain).
- **API token.** CI needs a Cloudflare API token, stored as a GitHub secret (never in the repo), scoped only to "Edit Workers" on your account. You create it; I never see it.
- **Service worker + headers.** `/sw.js` and `/index.html` get `Cache-Control: no-cache` so updates aren't stuck; hashed assets get long-lived immutable caching.

## What I need from you to proceed (only after you approve this)

1. A Cloudflare account (free).
2. Choose the account subdomain (public).
3. Create an API token (I'll give click-by-click steps).
4. Add it as a GitHub secret and create the `production` environment with you as required reviewer.

Steps are written in Phase 2 when you approve.
