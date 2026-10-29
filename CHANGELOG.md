# Changelog

Format based on Keep a Changelog. Versions follow the milestone they ship in.

## [Unreleased]

## M0 — 2026-10-29
Deployed to dev and prod (Cloudflare Workers static assets). Prod approval gate verified; both PWAs installed on iPhone. Also: dev/test service worker auto-activates and reloads once on update; offline e2e test; SW no longer caches the redirecting `/index.html`.
### Added
- M0 scaffolding: Vite + strict TypeScript + Vitest + Playwright + ESLint; palette test-card page; PWA manifest, service worker, generated icons (DEV badge on dev); CSP/security headers; prod-bundle dev-tools check; GitHub workflows (CI, CodeQL, gitleaks, dependency review, deploy with prod approval gate), Dependabot, CODEOWNERS; `docs/HOSTING.md`, `docs/SETUP.md`.
- Phase 1 design docs: `docs/DESIGN.md`, `docs/MILESTONES.md`, `docs/DECISIONS.md`, `CLAUDE.md`.
- Recorded Phase 1 answers: no custom domain / zero cost, public repo, combat confirmed, audio follows iOS silent switch.
