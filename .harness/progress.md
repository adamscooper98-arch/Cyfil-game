# Progress

On resume, read `CLAUDE.md`, then `.harness/plan.md`, then this file.

**Last updated:** 2026-10-30

## Milestones
- **Done:** M0, M1, M2 (signed off by Cooper).
- **Done:** harness setup and the flaky test fix.
- **Next:** M3 (combat and ultimate). The M3 plan in `.harness/plan.md` is approved as written, including attacking while jumping. Not started: begin by writing each step's check, then show the first step before building.

## Blocked / waiting on Cooper
- Add the `dev` branch rule in GitHub: block force pushes and deletion.

## Environments
- **Dev:** https://cyfil-dev.adamscooper98.workers.dev (M2)
- **Prod:** https://cyfil.adamscooper98.workers.dev (M0, stays here until the slice is playable, around M6)
- Both are installed on Cooper's iPhone 17 Pro, iOS 27.0.1.

## Open issues
- An unbounded 20x repeat of two tests never finished (159 of 160 results, then nothing for ~40 min). Cause unknown, not reproduced. A `CLAUDE.md` rule now requires a stated duration and a `timeout` on long runs.
- CI retries failed browser tests once, which can hide flakes.
- Dependabot still targets `main` until the new config reaches `main`, so new PRs may appear there. Don't merge them: that queues a prod deploy.
- Prod has no in-game update prompt yet (risk R4). It's needed before relying on prod updates.
- Dev updates can take about a minute to reach the iPhone. If stuck, open the dev URL in Safari first.

## Decisions
See `docs/DECISIONS.md`.
