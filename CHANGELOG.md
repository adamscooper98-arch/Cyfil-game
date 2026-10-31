# Changelog

Format based on Keep a Changelog. Versions follow the milestone they ship in.

## [Unreleased]
### Project setup
- Work harness in `.harness/` (plan, checks, progress), `cyfil-art-ui` project skill, Context7 docs plugin.
- Fixed a flaky browser test: two tests read the test hook before it had loaded. Both now wait for it, and fail loudly if it never appears.
- Dependabot now targets `dev` and stays on the Node 24 types (takes effect once merged to `main`).

### M3 (in progress)
- Step 2: Attack in the game. Attack (HIT button / X key) throws the 3-hit chain on the ground and in the air; a training dummy in the new Combat Arena level takes damage, flashes, flinches or launches, and stands back up after 90 ticks. Freeze frames, impact sparks, placeholder swing art, placeholder health bar over each dummy.
- Dev menu: Arena and Course buttons (jump to a level), Hitboxes toggle (outlines hurtboxes and the live attack box). Toolbar now wraps on narrow phones.
- Attack presses are buffered for 6 ticks, so a press during a swing or a freeze frame is not lost.
- Step 1: combat rules as pure logic (`src/game/combat.ts`): box overlap, 3-hit combo chain (1/1/2, 18-tick window), hitstop, and the combat numbers in the Tuning panel. Not wired into the game yet, so nothing changes on dev.

## M2 — 2026-10-29 (dev only)
- Input: shared button-mask InputState (keyboard, touch, replay all feed it), short-press latching, replay recorder/player.
- Touch controls: floating slide pad + JUMP/HIT/SKILL/ULT + pause; portrait and landscape zones; rotation releases held inputs.
- Movement: run, variable-height jump, coyote time, jump buffer, gravity, tile collision incl. one-way platforms and ceilings; Physics Course level; run/jump/fall placeholder sprites.
- Dev: Tuning panel (live sliders, persisted), boot line in the console, player state in the overlay.
- Tests: 25 physics unit tests (mutation-checked), course-completion bot + pinned replay, touch/multi-touch/layout/rotation e2e, re-blessed goldens.

## M1 — 2026-10-29 (dev only)
- Fixed 60 Hz loop with catch-up cap, seeded RNG, sprite/atlas pipeline with flip and palette variants, level format + strict validator, tilemap + parallax + camera, scenes (title, playing, paused, test card), auto-pause when hidden.
- Dev tools: overlay (fps, commit, scene, last errors), on-screen console, sprite viewer; tap the overlay, press backtick, or 3-finger tap to open the menu.
- Tests: loop/RNG/packer/sprite/level units; golden frames; device-size layout and rotation; dev-tool and flow e2e; test-hook bundle check.

## M0 — 2026-10-29
Deployed to dev and prod (Cloudflare Workers static assets). Prod approval gate verified; both PWAs installed on iPhone. Also: dev/test service worker auto-activates and reloads once on update; offline e2e test; SW no longer caches the redirecting `/index.html`.
### Added
- M0 scaffolding: Vite + strict TypeScript + Vitest + Playwright + ESLint; palette test-card page; PWA manifest, service worker, generated icons (DEV badge on dev); CSP/security headers; prod-bundle dev-tools check; GitHub workflows (CI, CodeQL, gitleaks, dependency review, deploy with prod approval gate), Dependabot, CODEOWNERS; `docs/HOSTING.md`, `docs/SETUP.md`.
- Phase 1 design docs: `docs/DESIGN.md`, `docs/MILESTONES.md`, `docs/DECISIONS.md`, `CLAUDE.md`.
- Recorded Phase 1 answers: no custom domain / zero cost, public repo, combat confirmed, audio follows iOS silent switch.
