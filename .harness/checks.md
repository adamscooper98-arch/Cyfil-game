# Checks

Current milestone or task only. Evidence is a short summary with exit codes, never raw logs (this repo is public).
Status is `pass`, `fail`, or `unresolved`. Anything only Cooper can judge (feel, art, real iPhone behavior) stays `unresolved: needs Cooper` until Cooper reports back.

## Harness setup

| Step | Requirement | Status | Evidence |
|---|---|---|---|
| Baseline | Typecheck, lint, unit tests, three builds, bundle check | pass | 2026-10-30: all exit 0; 120 unit tests passed |
| Baseline | Dependency audit | pass | 2026-10-30: 0 vulnerabilities |
| Baseline | Browser tests | fail | 2026-10-30: exit 1; 164 passed, 1 failed, 31 skipped on purpose. `tuning actually changes the physics` |
| Baseline | Is that failure repeatable? | unresolved | Intermittent: 60 of 60 reruns passed. Cause inferred, not proven. See `plan.md` |
| Context7 | Plugin connects and returns docs | pass | 2026-10-30: Vite 8.0.10 lookup returned relevant docs after Cooper signed in. Its newest Vite docs are older than our 8.3.5 |
| Art skill | Saved, header valid, cited code exists | pass | 2026-10-30: all cited names found in `src/` |
| Art skill | Triggers at the right times | unresolved | Not tested; evals skipped by decision |
| Dependabot | New config takes effect | unresolved | GitHub reads this file from `main` only, so it applies once `dev` is merged to `main` (around M6) |
| `dev` branch rule | Blocks force pushes and deletion | unresolved: needs Cooper | GitHub dashboard step, not done yet |
