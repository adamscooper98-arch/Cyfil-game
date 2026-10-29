# CLAUDE.md

Cyfil (working title; display name only in `src/config.ts`): 256×192 pixel-art platformer, browser + iPhone PWA. TypeScript, Canvas 2D, Web Audio, zero runtime deps.

## Current status
M0 complete. M1 (engine and rendering) built on branch `m1/engine`, pushed to `dev` only; playtested by Cooper (iPhone 17 Pro, iOS 27.0.1, 60 fps, palette approved/locked, D-029); still to confirm: rotation, notch/safe areas, dev menu usability, pause-on-background. Do not merge to `main` or start M2 without Cooper's approval.
Dev https://cyfil-dev.adamscooper98.workers.dev, prod https://cyfil.adamscooper98.workers.dev (both installed on Cooper's iPhone).
Dev SW updates can take ~1 minute to appear on iPhone (Safari first, refresh if stuck). Prod SW waits for the old version to release; needs an in-game update prompt (R4).
Every push to `main` queues a prod deploy awaiting approval; batch docs-only changes on `dev` until the next milestone PR.

## Rules
- Stop and show a short plan before each milestone; never start the next one unasked.
- Never deploy to prod (`main`) without Cooper's explicit approval. Pushing to `dev` is allowed.
- Never run anything that deletes, publishes, or spends money without approval.
- No secrets in the repo (it is public). No runtime dependencies without a DECISIONS entry.
- Zero cost: no custom domain, no paid services or tiers.
- All art/names original. Locked 32-color palette (DESIGN §6.1).
- Game logic (`src/game`) never touches DOM/canvas/audio — emit events.
- Saves/imports are hostile input: validate strictly, rebuild objects, never `eval`, never `innerHTML` (ESLint enforces).
- Dev tools only behind `__DEV_TOOLS__`; prod bundle must not contain them (`check:prod-bundle`).
- Be honest about what tests can't verify (feel, art, real iOS behavior).
- Update `CHANGELOG.md` and `docs/DECISIONS.md` with each change.
- Commits: repo-local git identity is Cooper's GitHub noreply address; never commit a real email.
- Models: Opus for design; Sonnet for milestone work; Haiku subagents for repetitive work only.

## Commands
- `npm run dev` — dev server (dev mode); `npm run dev:lan` exposes it on the LAN for a phone
- `npm run check:fast` — typecheck, lint, unit tests, prod+dev builds, prod-bundle check
- `npm run check` — everything incl. Playwright (chromium, webkit, iPhone portrait/landscape)
- Re-bless golden frames after an intended visual change: `UPDATE_GOLDEN=1 npx playwright test golden --project=chromium`, review the PNG diffs
- `npm run build:prod | build:dev | build:test` — outputs `dist/<mode>/`
- TypeScript is pinned `~6.0.3` because typescript-eslint doesn't support 6.1+/7 yet (D-018).

## Structure
`src/` game · `scripts/` build helpers (icons, PWA plugin, bundle check) · `tests/unit` vitest · `tests/e2e` playwright · `public/_headers` CSP + caching · `wrangler.{prod,dev}.jsonc` · `.github/` CI, deploy, CodeQL, Dependabot

## Docs
- `docs/DESIGN.md` — design, stack, architecture, formats, risks
- `docs/MILESTONES.md` — milestones + acceptance criteria
- `docs/DECISIONS.md` — decisions log
- `docs/HOSTING.md` — Cloudflare research; `docs/SETUP.md` — Cooper's dashboard steps
