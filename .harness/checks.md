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

