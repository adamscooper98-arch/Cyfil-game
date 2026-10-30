# CLAUDE.md

Cyfil (working title; display name only in `src/config.ts`): 256×192 pixel-art platformer, browser + iPhone PWA. TypeScript, Canvas 2D, Web Audio, zero runtime deps.

## Current status
See `.harness/progress.md`. On resume, read this file, then `.harness/plan.md`, then `.harness/progress.md`.

## Rules
- Stop and show a short plan before each milestone; never start the next one unasked.
- Never deploy to prod (`main`) without Cooper's explicit approval. Pushing to `dev` is allowed once checks pass.
- Never run anything that deletes, publishes, or spends money without approval.
- No secrets in the repo (it is public). No runtime dependencies without a DECISIONS entry.
- Zero cost: no custom domain, no paid services or tiers.
- All art/names original. Locked 32-color palette (DESIGN §6.1).
- Game logic (`src/game`) never touches DOM/canvas/audio — emit events.
- Saves/imports are hostile input: validate strictly, rebuild objects, never `eval`, never `innerHTML` (ESLint enforces).
- Dev tools only behind `__DEV_TOOLS__`; prod bundle must not contain them (`check:prod-bundle`).
- Be honest about what tests can't verify (feel, art, real iOS behavior). In `.harness/checks.md` these stay `unresolved: needs Cooper`.
- Update `CHANGELOG.md` and `docs/DECISIONS.md` with each change.
- Commits: repo-local git identity is Cooper's GitHub noreply address; never commit a real email.
- Models: Opus for design; Sonnet for milestone work; Haiku subagents for repetitive work only.
- Spawn subagents only for truly parallel, self-contained work.
- Milestones get a plan in `.harness/plan.md`: each step lists its files, one output, and one check written before the work. Tiny fixes skip the plan.
- A check passes only on its real exit code. Capture it directly: `npm run check | grep ...` reports grep's exit code, not npm's.
- Before any command that may take over 2 minutes, state the expected duration and wrap it in `timeout`. Never leave stress or repeat runs uncapped in the background. If a run passes twice its estimate, stop it and find out why.
- Never weaken a check to get a pass. Re-bless goldens or the replay only for an intended change, after reviewing the diff. If a test changes, say why it was wrong.
- A failing step gets at most 3 fix attempts, then report it as blocked.
- E2E tests that use `window.__cyfil` must wait for it first (`openManual`, or `waitForFunction` on pages not in manual mode).
- After a correction or a caught mistake, propose one specific rule here and show it to Cooper before adding it.
- Art, sprite, palette, UI or naming work: follow the `cyfil-art-ui` skill.

## Commands
- `npm run dev` — dev server (dev mode); `npm run dev:lan` exposes it on the LAN for a phone
- `npm run check:fast` — typecheck, lint, unit tests, prod+dev builds, prod-bundle check
- `npm run check` — everything incl. Playwright (chromium, webkit, iPhone portrait/landscape)
- Re-bless after an intended physics change: `UPDATE_REPLAY=1 npx vitest run tests/unit/course.test.ts`. Re-bless golden frames after an intended visual change: `UPDATE_GOLDEN=1 npx playwright test golden --project=chromium`, review the PNG diffs
- `npm run build:prod | build:dev | build:test` — outputs `dist/<mode>/`
- TypeScript is pinned `~6.0.3` because typescript-eslint doesn't support 6.1+/7 yet (D-018).

## Structure
`src/` game (`core`, `game`, `input`, `render`, `scenes`, `ui`, `content`, `dev`) · `scripts/` build helpers (icons, PWA plugin, bundle check) · `tests/unit` vitest · `tests/e2e` playwright · `public/_headers` CSP + caching · `wrangler.{prod,dev}.jsonc` · `.github/` CI, deploy, CodeQL, Dependabot · `.claude/` project skill and plugin settings · `.harness/` plan, checks, progress

## Docs
- `docs/DESIGN.md` — design, stack, architecture, formats, risks
- `docs/MILESTONES.md` — milestones + acceptance criteria
- `docs/PLAYTEST.md` — what Cooper checks on the iPhone, per milestone
- `docs/DECISIONS.md` — decisions log
- `docs/HOSTING.md` — Cloudflare research; `docs/SETUP.md` — Cooper's dashboard steps
