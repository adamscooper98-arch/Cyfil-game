# Checks

Current milestone or task only. Evidence is a short summary with exit codes, never raw logs (this repo is public).
Status is `pass`, `fail`, or `unresolved`. Anything only Cooper can judge (feel, art, real iPhone behavior) stays `unresolved: needs Cooper` until Cooper reports back.

## Harness setup

| Step | Requirement | Status | Evidence |
|---|---|---|---|
| Baseline | Typecheck, lint, unit tests, three builds, bundle check | pass | 2026-10-30: all exit 0; 120 unit tests passed |
| Baseline | Dependency audit | pass | 2026-10-30: 0 vulnerabilities |
| Baseline | Browser tests | fail | 2026-10-30: exit 1; 164 passed, 1 failed, 31 skipped on purpose. `tuning actually changes the physics` |
| Flaky test | Cause proven | pass | With the test hook delayed on purpose, the test failed with the same reading as the real failure (`normal` = 0, hook not loaded yet). The other suspect, `real-time flow`, didn't fail but could pass without checking anything |
| Flaky test | Both tests wait for the hook | pass | Same delayed run now passes. With the hook blocked entirely, both fail loudly on the wait instead of passing quietly |
| Flaky test | Stable after the fix | pass | 2026-10-30: both tests 10x in Chromium (20 runs, exit 0); 10x in WebKit and both iPhone projects (60 runs, exit 0) |
| Flaky test | Full check, twice in a row | pass | `npm run check` exit 0 both times: 120 unit, 165 browser passed, 31 skipped on purpose |
| Test run hang | Why a 20x repeat across 4 projects never finished | unresolved | 159 of 160 results written, then nothing for about 40 minutes until the app killed it. The runner, its web server and one worker were left running (cleaned up). Not reproduced in four later bounded runs. Cause unknown; Playwright shutdown on Windows is a guess |
| Context7 | Plugin connects and returns docs | pass | 2026-10-30: Vite 8.0.10 lookup returned relevant docs after Cooper signed in. Its newest Vite docs are older than our 8.3.5 |
| Art skill | Saved, header valid, cited code exists | pass | 2026-10-30: all cited names found in `src/` |
| Art skill | Triggers at the right times | unresolved | Not tested; evals skipped by decision |
| Dependabot | New config takes effect | unresolved | GitHub reads this file from `main` only, so it applies once `dev` is merged to `main` (around M6) |
| `dev` branch rule | Blocks force pushes and deletion | unresolved: needs Cooper | GitHub dashboard step, not done yet |

## M3 (branch `m3/combat`)

| Step | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | Combo window, 1/1/2 damage, hitstop, box overlap unit tests | pass | 2026-10-30: `combat.test.ts` passes; `npm run check:fast` exit 0 |
| 1 | Tests can fail | pass | 7 deliberate breakages (window 17/19, chain never ends, whiff keeps chain, touching counts, hitstop overwrite): all fail the tests. The whiff one first survived because the default window expires anyway; test now widens the window |
| 2 | Combo on the dummy deals 1+1+2 (unit and browser), air attack, whiff, behind, hitstop 3 and 6, buffered press, dead dummy not hit | pass | 2026-10-30: `world.test.ts` 11 tests and `combat.spec.ts` pass in all four browser projects; `npm run check` exit 0 (see below) |
| 2 | Tests can fail | pass | 8 deliberate breakages of world/combat/dummy code (no hitstop, never lands, full flinch, hit dead dummies, knockback reversed, no attack, huge buffer, revive at 1 hp): all fail the tests. Two weaknesses found and fixed: dead dummies could still be hit (no test), and a broken attack hung the test (uncapped loop) |
| 2 | Hitbox viewer absent from prod | pass | `check:prod-bundle` now checks a hitbox-viewer marker: present in dev, absent from prod |
| 2 | Goldens | pass | 6 new arena frames, reviewed by eye (flash+spark, spin ring, arc with no target, hitbox outlines). Eyeballed at 256x192 only |
| 2 | Hits feel punchy, chain timing on touch, buffer length | unresolved: needs Cooper | Real iPhone feel |
| 2 | Dev toolbar fits a portrait iPhone | unresolved: needs Cooper | Browser test passes at iPhone size with wrapping; not seen on the real phone |
| 2 | Full browser suite reliable at default workers | unresolved | 2026-10-30, after step 2: three `npm run check` runs each had 1-2 failures in WebKit or the iPhone projects, a different test every time ("Target crashed", "Provisional navigation canceled", "browser has been closed"). The same tests pass alone (10x PAUSE touch test, 96 devtools+golden runs on iphone-portrait). With `--workers=2` the whole suite passed: 197 passed, exit 0. Before step 2 the default run passed twice. Cause not proven; load is the leading guess (more tests, a stale WebKitNetworkProcess from the earlier hung run is still alive, started 3:18 PM, I was not permitted to stop it). Needs a decision: cap workers in `playwright.config.ts`? |
