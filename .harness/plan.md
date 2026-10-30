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
