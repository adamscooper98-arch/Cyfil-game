# Plan

Current milestone or task only. Git keeps the history. Every step states its check before the work starts.
Tiny fixes (one file, obvious result) skip this file; note them in `progress.md` instead.

## Task: Fix the flaky browser test (done 2026-10-30; results in `checks.md`)

**Why:** `tuning actually changes the physics` failed once in a full run on 2026-10-30, then passed 60 of 60 reruns. Its "normal" reading was `0`, which fits the test reading `window.__cyfil` before the test hook loaded. The cause is inferred, not proven. `real-time flow` in `tests/e2e/smoke.spec.ts` reads the hook the same way, so it can pass without checking anything.

**Allowed scope:** `tests/e2e/` only. No game code, no CI settings.

| # | Step | Reads / writes | Output | Check (written first) | Parallel? |
|---|---|---|---|---|---|
| 1 | Prove the cause: remove any doubt by making the race happen on purpose | reads `tests/e2e/devtools.spec.ts`, `src/main.ts`; writes a temporary local copy of the test, not committed | Explanation with evidence | With the hook's load delayed on purpose, the test fails the same way (`normal` is `0`). If it doesn't, stop and report | No |
| 2 | Wait for the hook in both tests | writes `tests/e2e/devtools.spec.ts`, `tests/e2e/smoke.spec.ts` | Two small test edits | Delayed-hook run from step 1 now passes. `real-time flow` also fails if the hook is missing, so it can't pass by accident | No |
| 3 | Confirm across all browsers | runs only | Exit codes and counts | Both tests pass 20 times each in all four projects, and `npm run check` exits 0 twice in a row | No |

**Not in scope:** CI's retry setting. It can hide flaky tests, but changing it is a separate decision.

**Outcome:** all three steps done. Deviation from step 3: the planned 20x in all four projects ran as one unbounded 160-test run that never finished (see `checks.md`), so it was redone as bounded 10x runs per project group with a time cap. Coverage is smaller than planned (10 runs, not 20), which is plenty for a timing race that now fails loudly.

---

## Proposed next: M3, combat and the ultimate (awaiting Cooper's approval)

Nothing in this section has started. Source of truth for the numbers is `docs/DESIGN.md` §3.3-3.4 and the acceptance criteria are in `docs/MILESTONES.md` (M3). Each step below still needs its check written before the work starts.

**Goal:** Cyfil can fight. The Attack button throws a 3-hit combo at a training dummy, landing hits fills an ultimate meter, and a full meter unleashes Overclock. It also adds getting hurt, so the whole loop (hit, charge, spend, take damage, respawn) works before real enemies exist. No new abilities yet: Wrench and Spark are M4.

**What gets built**
1. Hit and hurt boxes: every attack is a short-lived box in front of Cyfil, checked against enemy hurtboxes each tick.
2. The 3-hit Attack combo: jab, jab, spin bump. Pressing Attack again within 18 ticks of a hit chains to the next, for 1, 1 and 2 damage. Works in the air too (recommended; see the open question).
3. Hit feedback: 3-tick freeze on a hit and 6 on a kill, knockback, a flash on the enemy, a spark at the point of impact.
4. Combo counter: consecutive landed hits, reset when you take damage or 90 ticks pass without landing one. At 5 or more hits, meter gain is 1.5x.
5. The ultimate: meter gains +4 per hit and +1 per second passively. At 100 the ULT button lights up. Pressing it triggers Overclock: a 30-tick freeze flash, a shockwave that hits every enemy on screen for 6, and 90 ticks of invulnerability. The meter then resets to 0 and refills (it is not a one-time thing).
6. Player health: 5 HP, 60 ticks of invulnerability after a hit (Cyfil flickers), respawn at the last checkpoint at 0 HP. Ability XP is never lost, though nothing uses it until M4.
7. A basic HUD on the canvas: hearts, the meter bar and the combo number.
8. A training dummy enemy that can optionally hit back on touch, in a new Combat Arena test level.
9. Dev tools: a hitbox viewer, the combat numbers in the Tuning panel (combo window, damage, hitstop, knockback, meter gains), and "fill the meter" and "heal" buttons.

**How we will know it is done**
- Automated: unit tests for the combo window and chaining, damage values, hitstop pausing the simulation, invulnerability blocking damage, meter gain, passive refill and reset, Overclock only at 100, and the combo counter rules. A scripted run proves a combo on the dummy deals 1+1+2 and that the meter fires Overclock on the right hit. Golden frames for each attack frame, the HUD and the Overclock flash.
- Cooper, on the iPhone: do hits feel punchy, is the combo timing achievable on touch, does the ultimate feel like a payoff. Stays `unresolved: needs Cooper` until he reports back.

**Things to know before approving**
- There is no audio until M8, so combat will feel flatter than it will in the finished game. Freeze frames, flashes and sparks do all the work for now.
- Hitstop on a phone is easy to overdo. It is tunable for that reason.
- The attack frames will be rough placeholder art.
- If it runs long, the first things to cut are the combo counter's 1.5x bonus and the HUD combo number. The core loop of hit, charge, Overclock stays.

**Open question for Cooper:** should Cyfil be able to attack while jumping? Recommended: yes, with the same combo. It makes combat feel more fluid on a touchscreen and costs almost nothing extra.
