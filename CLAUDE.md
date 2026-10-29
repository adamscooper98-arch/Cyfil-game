# CLAUDE.md

Cyfil (working title; display name only in `src/config.ts`): 256×192 pixel-art platformer, browser + iPhone PWA. TypeScript, Canvas 2D, Web Audio, zero runtime deps.

## Current status
Phase 1 (design) approved 2026-10-29. Phase 2 / M0: hosting research done (`docs/HOSTING.md`), awaiting Cooper's decision on Workers vs Pages (D-017). Do not set up Cloudflare or scaffold deploy config until answered. Docs committed on local branch `docs/phase-1`, not pushed.

## Rules
- Stop and show a short plan before each milestone; never start the next one unasked.
- Never deploy to prod (`main`) without Cooper's explicit approval. Pushing to `dev` is allowed.
- Never run anything that deletes, publishes, or spends money without approval.
- No secrets in the repo (it is public). No runtime dependencies without a DECISIONS entry.
- Zero cost: no custom domain, no paid services or tiers.
- All art/names original. Locked 32-color palette (DESIGN §6.1).
- Game logic (`src/game`) never touches DOM/canvas/audio — emit events.
- Saves/imports are hostile input: validate strictly, rebuild objects, never `eval`, never `innerHTML`.
- Dev tools only behind `__DEV_TOOLS__`; prod bundle must not contain them.
- Be honest about what tests can't verify (feel, art, real iOS behavior).
- Update `CHANGELOG.md` and `docs/DECISIONS.md` with each change.
- Models: Opus for design; Sonnet for milestone work; Haiku subagents for repetitive work only.

## Commands
(Added in M0.)

## Docs
- `docs/DESIGN.md` — design, stack, architecture, formats, risks
- `docs/MILESTONES.md` — milestones + acceptance criteria
- `docs/DECISIONS.md` — decisions log
