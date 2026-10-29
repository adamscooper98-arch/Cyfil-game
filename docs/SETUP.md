# Setup: steps only Cooper can do

Do these in order. Total cost: **$0**. If any page asks for a credit card or offers a paid plan, stop and skip it. Dashboard layouts change; if a button name differs slightly, look for the closest match, or tell me what you see.

When you finish **Part 1 to 3**, tell me. I then push the `dev` branch (allowed by your rules), and the first dev deploy runs. Part 4 is the iPhone install.

## Part 1. Cloudflare (free account)

1. Sign up at <https://dash.cloudflare.com/sign-up> (free plan; no domain needed; no card).
2. Go to **Workers & Pages**. If it asks you to choose a **workers.dev subdomain**, pick one now. This appears in every URL (`cyfil.<subdomain>.workers.dev`), publicly. Don't use your real name or email. It must be registered **before** the first deploy, or CI cannot deploy.
3. Copy your **Account ID** (shown on the Workers & Pages overview page, right sidebar, or under any account's "…" menu).
4. Create an API token: top-right profile icon → **My Profile** → **API Tokens** → **Create Token** → template **Edit Cloudflare Workers** → **Use template**.
   - Name: `cyfil-deploy`.
   - Account Resources: **Include → your account** only.
   - Zone Resources: leave as is (you have no zones) or remove the zone permission if the form allows.
   - Create, then **copy the token now**; it's shown once. Keep it in a password manager. **Never paste it into chat or commit it.**

> Honest limitation: a Cloudflare token can't be limited to one Worker. It can deploy any Worker in your account. The real protection for prod is that the **GitHub `production` environment holds the secret and requires your approval** (Part 2). Treat the token like a password; you can revoke and recreate it any time.

## Part 2. GitHub: environments and secrets

Repo → **Settings** → **Environments**.

1. **New environment** → `development`
   - Deployment branches and tags: **Selected branches** → add `dev`.
   - Environment secrets: add `CLOUDFLARE_API_TOKEN` (the token) and `CLOUDFLARE_ACCOUNT_ID`.
2. **New environment** → `production`
   - **Required reviewers**: add yourself. (Leave "Prevent self-review" **off**, or you could never approve.)
   - Deployment branches and tags: **Selected branches** → add `main`.
   - Environment secrets: **add these later**, right before the first prod deploy (an environment with no secrets cannot deploy). Same two names as development.

Use **environment** secrets, not repository secrets. That is what stops a prod deploy from running before you approve.

## Part 3. GitHub: repo security settings

Repo → **Settings**:

1. **Code security** (or "Advanced Security"):
   - Dependency graph: **on**. Dependabot alerts: **on**. Dependabot security updates: **on**.
   - Secret scanning: **on**. **Push protection: on.**
   - Code scanning: do **not** enable "Default setup". We ship our own CodeQL workflow; both at once conflict.
2. **Actions** → **General** → Workflow permissions: **Read repository contents and packages permissions**. Leave "Allow GitHub Actions to create and approve pull requests" **off**.
3. Profile → **Settings** → **Emails** → tick **Block command line pushes that expose my email** (you are on a public repo).
4. **Rulesets** (Settings → Rules → Rulesets → New branch ruleset), after the first CI run has happened so the check names exist:
   - `main`: target the default branch; **Require a pull request before merging** (0 required approvals is fine for solo); **Require status checks**: `check` (CI), `analyze` (CodeQL), `gitleaks` (Secret scan); **Block force pushes**; **Restrict deletions**.
   - `dev`: **Block force pushes** and **Restrict deletions** only.

## Part 4. Install on your iPhone (after the first dev deploy)

1. Open the dev URL in **Safari** (not an in-app browser): `https://cyfil-dev.<subdomain>.workers.dev`.
2. Share button → **Add to Home Screen** → the name should read **Cyfil DEV** with the magenta DEV icon.
3. Open it from the home screen: you should see the palette test card and a magenta `DEV …` badge top-left. Rotate the phone; the card should re-center with crisp, un-blurred pixels.
4. Later, when prod is approved, repeat for the prod URL (no badge, name "Cyfil"). It's a separate app with separate storage.

## Part 5. What *I* will do after you finish

- Push `dev`, confirm the Actions run goes green and the Worker is live, and report the URL.
- Open a PR for M0 against `main`. **Merging to `main` queues a prod deploy that waits for your approval.** I won't merge it without you; and you can simply decline the deployment.

## Verifying the prod gate (recommended, once)

After prod is wired up, the first run on `main` should show "Waiting for approval" in the Actions tab. If it deploys without asking, the `production` environment isn't configured; **reject it and tell me**.
