# Decisions log

Format: ID · date · decision · why. Superseded entries are struck through, not deleted.

| ID | Date | Decision | Why |
|---|---|---|---|
| D-001 | 2026-10-29 | Concept 1: **Cyfil, the junkyard spark-bot**. Neon cyan/magenta/lemon on navy + rust. | Chosen by Cooper. Fits "poppy" brief; upgrade visuals are cheap glow/palette work. |
| D-002 | 2026-10-29 | Hero sprite **24×24**; tiles 16×16; screen 256×192 (16×12 tiles). | Chosen by Cooper; more expressive than 16×16. Cost: ~2.25× pixels per frame. |
| D-003 | 2026-10-29 | Tier 3 = **stat upgrade + visual change**, no new behaviors in the slice. | Chosen by Cooper (visuals may slip post-slice if needed). |
| D-004 | 2026-10-29 | TypeScript `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`; Vite, Vitest, Playwright, ESLint as dev deps; zero runtime deps. | Cooper had no preference; strictest practical setting. |
| D-005 | 2026-10-29 | ~~Dev on a subdomain of a custom domain.~~ Superseded by D-012. | — |
| D-006 | 2026-10-29 | Fixed 60 Hz update, render without interpolation, seeded PRNG, input as per-tick bitmask. | Correct speed on 30/60/120 Hz displays; deterministic replays enable exact tests. |
| D-007 | 2026-10-29 | *(proposed)* Sprite **storage** stays palette grids in code; **authoring** may be PNG → grid via import script. | Text grids are a poor drawing tool; keeps "sprites are code" as source of truth. |
| D-008 | 2026-10-29 | *(proposed)* Dev tools ship incrementally with the milestone that needs them, not as a final milestone. | On-screen console / overlay are needed from M1 to debug on iPhone. |
| D-009 | 2026-10-29 | Ability tier derived from XP, never stored. Enemies don't respawn in the slice. | No inconsistent saves; no XP farming. |
| D-010 | 2026-10-29 | Save identifiers (`saveKeyPrefix`, `saveFormatId`) are separate from display name. | Renaming the game must not orphan saves. |
| D-011 | 2026-10-29 | Deferred: 360° wrench, 3-way spark spread, gamepad, music, map screen, procedural mode. | Slice scope. |
| D-012 | 2026-10-29 | **No custom domain, no paid services.** Prod and dev each get a free Cloudflare-provided hostname (exact product chosen in Phase 2). Replaces the locked "own domain" decision. | Personal use only for now. Two different hostnames are two origins → storage and service workers stay separate. A domain can be added later; saves would need an export → import across the move. |
| D-013 | 2026-10-29 | Repo is **public** → use GitHub CodeQL, secret scanning and push protection (free for public repos). | Cooper's answer. Caveat: all code and docs are publicly readable; never commit anything private. |
| D-014 | 2026-10-29 | Combat confirmed: Attack = Cyfil's own 3-hit chain (the "hit-count combo"), Ability = equipped ability, swap via HUD icon, combo counter boosts ultimate charge. | Cooper confirmed DESIGN §3.3. |
| D-015 | 2026-10-29 | Audio follows the iOS ring/silent switch (default Web Audio behavior; we do not set `navigator.audioSession.type = 'playback'`). | Cooper's answer; iOS convention. |
| D-017 | 2026-10-29 | *(approved by Cooper)* Host on **Cloudflare Workers with static assets** (two Workers: prod, dev), deployed from GitHub Actions with a protected `production` environment, not Cloudflare's git integration. See `docs/HOSTING.md`. | Free, unlimited static requests; deploy gating needs Actions; Cloudflare's direction. Pages is the equally valid alternative. |
| D-016 | 2026-10-29 | Design approval of D-007 (PNG import authoring) and D-008 (incremental dev tools) assumed with Phase 1 approval. | Raised in Phase 1 pushback; no objection. |
| D-018 | 2026-10-29 | TypeScript pinned to `~6.0.3` (not 7.x). Dependabot ignores `>=6.1.0`. | typescript-eslint 8.72 peers on `<6.1.0`. Revisit when it supports newer TS. |
| D-019 | 2026-10-29 | CI installs with `npm ci --ignore-scripts`; wrangler is **not** a devDependency but run as `npx wrangler@4.155.0` in deploy jobs only. | Smaller local install, no install scripts in CI, exact version pinned. Cost: Dependabot will not track wrangler; bump by hand. |
| D-020 | 2026-10-29 | Cloudflare token lives in GitHub **environment** secrets (`development`, `production`); `production` requires Cooper as reviewer and is limited to `main`. | Prod deploy cannot even obtain the token before approval. Residual risk: a Cloudflare token cannot be scoped to one Worker. |
| D-021 | 2026-10-29 | Service worker: cache-first, build-hash cache name, no auto `skipWaiting`; updates apply when all tabs close. In-game "update ready" prompt and reset escape hatch come later (R4). | Never swap code mid-level. |
| D-022 | 2026-10-29 | Playwright smoke runs chromium, webkit, and iPhone 14 portrait/landscape emulation. CSP-violation check runs before `page.screenshot()`. | In WebKit one `style-src-elem inline` violation appeared only after `page.screenshot()`; it vanished when the check ran first. Cause inferred (Playwright's screenshot code), not proven. |
| D-023 | 2026-10-29 | Dev/test builds: service worker calls `skipWaiting` and the page reloads once on update. Prod unchanged (D-021). | Observed on iPhone: swiping the dev PWA away and reopening did not apply an update; Cooper had to delete and re-add it. Prod still needs an in-game update prompt (R4). |
