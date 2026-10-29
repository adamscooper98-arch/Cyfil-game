# Cyfil

Single-player pixel-art action platformer (working title) that runs in the browser and installs on an iPhone home screen as a PWA. Work in progress.

- Design: [docs/DESIGN.md](docs/DESIGN.md)
- Milestones: [docs/MILESTONES.md](docs/MILESTONES.md)
- Decisions: [docs/DECISIONS.md](docs/DECISIONS.md)
- Hosting: [docs/HOSTING.md](docs/HOSTING.md), dashboard setup: [docs/SETUP.md](docs/SETUP.md)

## Develop

Requires Node 24+.

```bash
npm ci
npm run dev          # http://localhost:5173 (dev build, with dev tools)
npm run check:fast   # typecheck, lint, unit tests, prod+dev builds, prod-bundle check
npm run check        # everything, including Playwright (npx playwright install chromium webkit first)
```
