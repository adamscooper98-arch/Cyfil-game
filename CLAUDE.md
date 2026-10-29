# CLAUDE.md

Cyfil (working title; display name only in `src/config.ts`): 256×192 pixel-art platformer, browser + iPhone PWA. TypeScript, Canvas 2D, Web Audio, zero runtime deps.

## Current status
Phase 1 approved. Phase 2 / M0 (scaffolding, CI, PWA, deploy workflows) is built and checked locally on branch `m0/scaffolding`; nothing is pushed. Waiting on Cooper to do `docs/SETUP.md` Parts 1–3 (Cloudflare account, GitHub environments/secrets/settings). Then: push `dev`, confirm deploy, Cooper installs the DEV PWA on iPhone, then open the M0 PR. Do not start M1 until Cooper approves it.

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
- `npm run build:prod | build:dev | build:test` — outputs `dist/<mode>/`
- TypeScript is pinned `~6.0.3` because typescript-eslint doesn't support 6.1+/7 yet (D-018).

## Structure
`src/` game · `scripts/` build helpers (icons, PWA plugin, bundle check) · `tests/unit` vitest · `tests/e2e` playwright · `public/_headers` CSP + caching · `wrangler.{prod,dev}.jsonc` · `.github/` CI, deploy, CodeQL, Dependabot

## Docs
- `docs/DESIGN.md` — design, stack, architecture, formats, risks
- `docs/MILESTONES.md` — milestones + acceptance criteria
- `docs/DECISIONS.md` — decisions log
- `docs/HOSTING.md` — Cloudflare research; `docs/SETUP.md` — Cooper's dashboard steps
