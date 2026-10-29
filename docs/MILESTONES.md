# Milestones

Each milestone: I show a short plan → you approve → I build on a branch → CI green → deploy to **dev** → you playtest with `docs/PLAYTEST.md` → you sign off. Nothing goes to prod without your explicit approval.

Every milestone's acceptance criteria implicitly include the **standing gates**: typecheck + lint clean, unit tests pass, Playwright smoke passes on Chromium + WebKit with zero console errors, golden frames match (or are deliberately re-blessed with a diff shown to you), dependency audit clean of high/critical, secret scan clean, prod bundle contains no dev-tool code, CHANGELOG + DECISIONS updated.

Legend: 🤖 = verified by automation · 🧑 = verified by Cooper on iPhone.

---

## M0 — Scaffolding, CI, security, two PWAs (Phase 2)
Repo tooling, workflows, Cloudflare research + setup instructions, placeholder game page (palette test card + "Cyfil" text drawn from sprites).
- 🤖 `npm ci && npm run check` runs typecheck, lint, unit, build (all 3 modes), e2e.
- 🤖 CI on every PR: the above + CodeQL + GitHub secret scanning/push protection + gitleaks + `npm audit`; workflows use `permissions: {}` by default, per-job minimum, actions pinned by SHA.
- 🤖 Dependabot for npm + GitHub Actions.
- 🤖 Deployed headers include the CSP; e2e asserts no CSP violations.
- 🤖 Push to `dev` → deploys dev. Merge to `main` → **waits for your manual approval** before prod deploy.
- 🧑 Both apps install on iPhone home screen; dev shows "DEV" badge and different name; storage is separate (set a value in one, absent in the other).

## M1 — Engine and rendering
Fixed-step loop, PRNG, palette, sprite grid parser + atlas, tilemap renderer, camera, integer scaler, portrait/landscape layout, scenes skeleton. Dev tools: **debug overlay, on-screen console, sprite viewer**.
- 🤖 Unit: loop runs exactly N updates for simulated time; sprite parser rejects bad grids; atlas packing.
- 🤖 Golden frame of a test tilemap + sprites at internal res.
- 🤖 Layout screenshots: iPhone-sized portrait + landscape, game image is an integer scale and inside safe areas.
- 🧑 Crisp pixels (no blur) both orientations; rotation is seamless; overlay shows ~60 FPS on your phone. Palette approved and **locked**.

## M2 — Input, touch controls, player movement
InputState, keyboard, touch (slide pad + 4 buttons), replay recording, Cyfil run/jump/fall with coyote + buffer, tile collision incl. one-way platforms.
- 🤖 Unit: collision edge cases (corners, ceilings, one-way from below), jump height for tap vs hold.
- 🤖 e2e: simulated touch on each control produces the expected input bits; rotation mid-hold releases inputs.
- 🤖 Replay test: scripted inputs traverse a test course to a known position.
- 🧑 **First feel playtest.** Movement and jump feel good on touch. This is the most important sign-off of the slice — we tune here before building on top.

## M3 — Combat and ultimate
Hitbox/hurtbox system, basic 3-hit combo, combo counter, damage/knockback/hitstop/i-frames, player HP + respawn, ultimate meter + Overclock, a training-dummy enemy. Dev tool: **hitbox viewer**.
- 🤖 Unit: combo window timing, meter gain/passive refill/reset, i-frames block damage, hitstop pauses sim.
- 🤖 Replay: combo on dummy deals 1+1+2; ultimate fires only at 100.
- 🧑 Hits feel punchy; combo timing is achievable on touch; ultimate feels like a payoff.

## M4 — Abilities and leveling
Wrench + Spark, pickups, equip/swap, XP from landed hits, tiers 1–3 (stats + palette-swap visuals), level-up feedback. Dev tools: **state inspector, grant ability / set XP menu**.
- 🤖 Unit: XP only from landed hits (whiffs give 0), tier derived from XP, stats table per tier.
- 🤖 Golden frames: each ability at each tier.
- 🧑 Abilities feel distinct; tier changes are visible and feel rewarding; swapping is easy.

## M5 — Enemies
Toastbot and Fanfly behaviors, telegraphs, projectiles, death FX.
- 🤖 Unit/replay: Toastbot turns at edges and never walks off; Fanfly telegraph always precedes dive by 24 t; enemies don't respawn.
- 🧑 Enemies are readable and fair; telegraphs are visible on a phone screen.

## M6 — The level
Scrapyard 1 data, tileset, parallax, checkpoint, goal, HUD (HP, meter, combo, ability + tier), title / pause / level-complete screens. Dev tool: **skip-to-level**.
- 🤖 Level validator passes; a full-completion replay reaches the goal.
- 🤖 Golden frames: title, HUD, level complete.
- 🧑 Level is fun for 2–4 minutes, teaches wrench → spark naturally, difficulty is fair.

## M7 — Saves
Schema v1, storage with backup, autosave triggers, export (Share / Download / Copy code), import (file / paste) with confirmation, migration framework. Dev tools: **save snapshots, Import prod save**.
- 🤖 Unit: validator rejects every malformed fixture; fuzz test (≥10k mutations) never throws or admits invalid data; round-trip export→import is lossless; corrupted main falls back to `.bak`.
- 🤖 e2e: complete level → reload → progress persists; import shows summary and requires confirm; no save content reaches `innerHTML` (lint rule + test).
- 🧑 Export via Share sheet works on iPhone; import on dev of a prod export works.

## M8 — Audio
Web Audio engine, 9 SFX, mute toggle, iOS unlock.
- 🤖 Unit: SFX params valid; voice cap enforced; mute persists via save.
- 🤖 e2e: no AudioContext errors; context resumes after first tap.
- 🧑 Sounds are satisfying and not annoying; unlock works on first tap; mute works.

## M9 — Slice hardening and prod proposal
Bug fixes from playtests, performance pass, `docs/SECURITY.md` review (CSP, import path, SW, dependencies, workflow permissions, headers), threat-model notes, known-issues list.
- 🤖 All gates green; Lighthouse PWA/perf check on dev.
- 🧑 Full-slice playtest sign-off.
- Then I write a prod release proposal (what ships, what was reviewed, residual risks). **You approve or not.**
