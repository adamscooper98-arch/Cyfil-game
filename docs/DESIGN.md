# Cyfil — Design Document

Status: **Approved by Cooper 2026-10-29 (Phase 1)**. Game name is a placeholder; the display name lives only in `src/config.ts`.

---

## 1. Pitch

Cyfil is a palm-sized repair-bot (cassette-tape body, spring neck, one big lens eye) in a scrapyard city where discarded machines have woken up grumpy. Side-scrolling, discrete levels, abilities found as items, permanent ability growth from landed hits. Tone: plucky, slapstick. Look: GBA/DS-era pixel art, neon cyan/magenta/lemon popping off deep navy and rust.

## 2. Vertical slice scope (locked)

| Item | Slice content |
|---|---|
| Character | Cyfil |
| Abilities | **Wrench Swing** (melee), **Spark Bolt** (ranged, pickup mid-level) — 3 tiers each |
| Combat | Basic attack 3-hit combo, ultimate **Overclock** |
| Enemies | **Toastbot** (walker, lobs toast), **Fanfly** (flying diver) |
| Level | 1 hand-built level (“Scrapyard 1”), 1 checkpoint, 1 goal |
| Systems | Saves (versioned, autosave, export/import), SFX, touch + keyboard, dev tools |

Out of scope until approved: map screen, procedural mode, music, bosses, more abilities/levels, gamepad.

## 3. Game rules (first-pass numbers — tuned during playtest)

All timings in **ticks** (1 tick = 1/60 s). Units in pixels.

### 3.1 Movement
- Run: accel 0.25 px/t², max 1.5 px/t; ground friction 0.3 px/t².
- Jump: initial vy −4.2; variable height (release early → vy clamped to −1.5); gravity 0.22; max fall 4.5.
- Coyote time 6 t, jump buffer 6 t. These two matter more for touch feel than any other number.

### 3.2 Controls
| Action | Keyboard (dev/desktop) | Touch |
|---|---|---|
| Move | ←/→ (A/D) | Left-side slide pad (not a fixed d-pad; see §6.4) |
| Jump | Space / Z | Button |
| Attack | X | Button |
| Ability | C | Button (uses equipped ability) |
| Swap ability | Q | Tap the ability icon in the HUD |
| Ultimate | V | Button (lit only when full) |
| Pause | Esc / P | HUD pause icon |

### 3.3 Combat
- **Basic attack** (always available): 3-hit string — jab, jab, spin bump. Next press within 18 t of a hit chains; dmg 1/1/2. This is the "one hit-count combo".
- **Combo counter**: consecutive landed hits without taking damage or a 90 t gap. Shown in HUD. At 5+ hits, ultimate charge gain ×1.5. (Pure reward; no new inputs.)
- **Ultimate meter** 0–100: +4 per landed hit (any source), +1 per second passive. Full meter → Overclock: 30 t freeze-frame flash, shockwave hits every on-screen enemy for 6 dmg, 90 t invulnerability. Meter resets to 0 and refills normally (not once-only).
- **Hitstop** 3 t on hit, 6 t on kill. **Knockback** on both sides. Player i-frames 60 t after damage.
- Player HP 5. Death → respawn at last checkpoint, full HP; ability XP is never lost.

### 3.4 Abilities and leveling
- Abilities are unlocked only by pickup items (later: boss drops). Wrench pickup sits in the first screen of the level (tutorial beat). Spark Bolt pickup sits ~40% through.
- **XP = landed hits with that ability** (1 per hit; kill bonus +1). Permanent. Tier is *derived* from XP, never stored.
- Thresholds: Tier 2 at 25 XP, Tier 3 at 80 XP. Slice level holds enough enemies for roughly Tier 2 on one ability in a first run — Tier 3 needs replays. Tunable.
- Level-up: 20 t celebration flash + SFX + autosave.

| | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| Wrench: dmg / reach / cooldown | 2 / 20 px / 24 t | 3 / 26 px / 20 t | 4 / 30 px / 16 t |
| Wrench visual | grey wrench | copper wrench + spark trail | gold wrench + wide neon arc |
| Spark: dmg / speed / cooldown | 1 / 3 px/t / 30 t | 2 / 4 px/t / 22 t | 3 / 5 px/t / 16 t |
| Spark visual | small cyan orb | larger orb, 1-wall bounce | magenta-cored bolt with trail |

Tier 3 = stats + visuals only. New behaviors (360° wrench, 3-way spread) are deferred (see DECISIONS D-011). The Tier 2 wall-bounce is the one behavior change in the slice; cut it if it slips.

### 3.5 Enemies
| | HP | Behavior | Contact dmg |
|---|---|---|---|
| Toastbot | 4 | Patrols platform edge to edge; when player within 64 px horizontally and on screen, pauses 30 t then lobs a toast projectile in an arc (cooldown 120 t). | 1 |
| Fanfly | 2 | Hovers with sine bob; when player within 80 px, telegraphs 24 t (blades spin up, color flash) then dives in a straight line, recovers upward. | 1 |

Enemies do **not** respawn in the slice (no XP farming exploit, and it keeps the level finite).

## 4. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Language | **TypeScript**, `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | Closest to C# discipline; catches bugs in collision/array math. Compiles to plain JS — no runtime cost. |
| Dev server / bundler | **Vite** (dev dependency only) | Instant reloads, one-line multi-mode builds, tree-shakes dev tools out of prod. esbuild alone would require hand-rolling the dev server + HTML handling. |
| Unit tests | **Vitest** | Shares Vite config, fast, Jest-like API. |
| Browser tests | **Playwright** (Chromium + WebKit) | WebKit is the closest automatable engine to iOS Safari. Headless smoke, input simulation, screenshots. |
| Lint | ESLint + typescript-eslint | Catches unsafe patterns (`no-eval`, `no-implied-eval`, floating promises). |
| Runtime deps | **Zero** | Canvas 2D, Web Audio, localStorage, Service Worker are all native. |
| Service worker | Hand-written, with asset list generated at build | Small, auditable, no Workbox. |
| PWA icons | Generated at build from palette-grid sprite via a ~60-line PNG encoder (Node `zlib`) | Icons stay "code", DEV badge is a build flag, no image deps. |

Not chosen: Phaser/Pixi/Kaboom (framework, locked out), WebGL (Canvas 2D is plenty for 256×192 and simpler), Tiled (adds a tool dependency; revisit when levels grow).

## 5. Architecture

### 5.1 Main loop
- `requestAnimationFrame` drives an **accumulator with fixed 60 Hz update**. Max 5 catch-up steps per frame; beyond that, drop time (prevents "spiral of death" after a tab switch).
- Render once per rAF with **no interpolation** — pixel art snaps to integer positions anyway. 120 Hz ProMotion iPhones render duplicate frames; Low Power Mode (30 fps rAF) runs 2 updates per frame. Game speed stays correct in both.
- `visibilitychange` → auto-pause.
- **Determinism**: fixed dt + seeded PRNG (mulberry32) + input as per-tick bitmask. This lets tests replay recorded input and assert exact outcomes and exact pixels.

### 5.2 Structure
No ECS framework. Plain typed objects in arrays, systems are functions:
```
update(world, input):
  player.update → abilities.update → enemies.update → projectiles.update
  → physics (tile collision, axis-separated AABB) → combat (hitbox vs hurtbox)
  → pickups → camera → events (sfx, save triggers) drained
```
Game logic never touches the DOM, canvas, or audio directly — it emits events (`{type:'sfx', id:'hit'}`, `{type:'autosave'}`) that the shell consumes. This keeps the whole simulation unit-testable in Node.

### 5.3 Scenes (state machine)
`Boot → Title → Playing ⇄ Paused → LevelComplete → Title`, plus `GameOver` is not needed (death respawns). Each scene: `enter / update / render / exit`.

### 5.4 Rendering
- One **256×192 offscreen-sized canvas** is the frame buffer. All drawing happens at internal resolution.
- Displayed via a visible canvas scaled with CSS `image-rendering: pixelated`. Scale = **largest integer multiple in device pixels** that fits the game area (iPhone 14/15 portrait: 4× = 1024×768 device px; landscape: 6× = 1536×1152). Letterbox color = palette navy.
- **Sprite atlas**: at boot, every sprite grid is drawn into one offscreen canvas (power-of-two packed). Draw calls are `drawImage(atlas, sx,sy,w,h, dx,dy,w,h)` with integer coordinates only. Horizontal flip is pre-baked into the atlas (avoids per-frame transforms).
- **Tier visuals**: palette remaps baked as extra atlas variants (e.g. wrench grey→copper→gold) plus small overlay sprites/particles. Cheap, no redrawing whole frames.
- Tilemap: only on-screen tiles drawn (17×13 per frame max). Parallax: 2 background layers.
- Layers: bg far → bg near → tiles → pickups → enemies → player → projectiles → particles → HUD → dev overlay.

### 5.5 Layout and rotation
- A layout pass runs on `resize` / `orientationchange` / `visualViewport` resize (iOS fires these late and inconsistently, so a short re-check runs after 300 ms).
- **Landscape**: game centered; touch controls sit in the side gutters *outside* the game image where they fit (iPhone landscape has ~500 device px per side), overlapping slightly only on narrow devices.
- **Portrait**: game at top (under safe-area inset), controls in the bottom area.
- Rotation changes layout only. Game state, timers and input state are untouched; held touches are released on rotation to avoid stuck inputs.
- iOS hygiene: `viewport-fit=cover`, `env(safe-area-inset-*)`, `touch-action:none`, `user-select:none`, `-webkit-touch-callout:none`, prevent double-tap zoom and pinch.

### 5.6 Input
- Sources (keyboard, touch) write into one `InputState` each tick → a bitmask `{left,right,jump,attack,ability,swap,ultimate,pause}` plus "pressed this tick" edges.
- Touch: Pointer Events with multi-touch tracking by `pointerId`. Buttons have hit areas larger than their drawn size. Movement pad is a **relative slide zone** (touch anywhere in the left zone; slide past a dead-zone left/right) — far more forgiving than a fixed d-pad on glass.
- Input recording/replay is built in (dev + tests).

### 5.7 Audio
- Web Audio, single `AudioContext`, created/resumed on first `pointerup`/`keydown` (iOS unlock).
- SFX are **parameter objects** (wave, freq start/end, envelope, duration, noise mix, arpeggio), synthesized per play. Slice set: `jump, hit, hurt, pickup, levelup, ultimate, spark, land, menu`.
- Mute toggle persisted in save settings. Master gain + per-SFX gain. Voice cap (8) to avoid audio spikes.
- iOS ring/silent switch: by default Web Audio is silenced by the switch. We respect that (D-015).

### 5.8 Build modes
| Mode | Command | Dev tools | Test hooks | Deployed to |
|---|---|---|---|---|
| `prod` | `npm run build:prod` | stripped | no | prod |
| `dev` | `npm run build:dev` | included | no | dev |
| `test` | `npm run build:test` | included | `window.__game` hook | CI only |

Dev tools are gated by a compile-time constant `__DEV_TOOLS__` and loaded via dynamic `import()`, so the prod bundle has no dev code. **CI verifies** by grepping the prod bundle for a marker string that only exists in dev tool modules.

### 5.9 Dev tools (dev build only; each lands in the milestone that first needs it)
Debug overlay (FPS, update ms, commit hash, last 5 errors) · on-screen console (captures `console.*` and `window.onerror`, essential on iPhone) · hitbox viewer · state inspector · sprite viewer (atlas + palette + tier variants) · grant ability / set XP / skip-to-level menu · save snapshots (save/restore named slots) · "Import prod save" (see §7.6).
Opened by a 3-finger tap or backtick key.

## 6. Content formats

### 6.1 Palette (locked at 32 entries; index 0 = transparent)
Placeholder hex values — final tuning in M1 via the sprite viewer, then **locked**.

| # | Hex | Role | # | Hex | Role |
|---|---|---|---|---|---|
| 0 | — | transparent | 16 | `#ff2fa6` | neon magenta |
| 1 | `#0b0e1f` | outline / near-black | 17 | `#b0127a` | deep magenta |
| 2 | `#1a1f3d` | deep navy (bg) | 18 | `#ff9bd6` | pink highlight |
| 3 | `#2b335f` | navy | 19 | `#fff23a` | lemon |
| 4 | `#45508a` | slate | 20 | `#ffb800` | gold |
| 5 | `#6f7fc0` | periwinkle | 21 | `#39ff6a` | neon green |
| 6 | `#b4c3ff` | pale blue | 22 | `#149e4a` | deep green |
| 7 | `#ffffff` | white | 23 | `#ff4a3d` | red |
| 8 | `#3b1f1a` | dark rust | 24 | `#a8162b` | deep red |
| 9 | `#6b3420` | rust | 25 | `#8c5cff` | violet |
| 10 | `#a85a2c` | copper | 26 | `#4b2a9e` | deep violet |
| 11 | `#d98b3a` | light copper | 27 | `#30303c` | dark steel |
| 12 | `#ffc46b` | amber | 28 | `#5c5a66` | steel |
| 13 | `#00e5ff` | neon cyan | 29 | `#8f8d99` | grey |
| 14 | `#0093b8` | deep cyan | 30 | `#c9c6d1` | light grey |
| 15 | `#7dffef` | pale cyan | 31 | `#ff7a1a` | hot orange |

Rule: every sprite uses index 1 outlines; neon colors (13, 16, 19, 21) are reserved for player, abilities, pickups and danger telegraphs so they pop against the navy/rust world.

### 6.2 Sizes
| Thing | Size | Hitbox/hurtbox |
|---|---|---|
| Tile | 16×16 | full |
| Cyfil | 24×24 frame | hurtbox ~12×18, bottom-centered |
| Toastbot | 24×24 | ~18×16 |
| Fanfly | 16×16 | ~12×10 |
| Projectiles | 8×8 | ~6×6 |
| Pickups | 16×16 | ~12×12 |
| Screen | 256×192 = 16×12 tiles | |

Approx. frame budget for the slice: Cyfil ~45 frames (idle 4, run 6, jump 2, fall 2, land 1, hurt 2, basic combo 3×3, wrench 4, spark 3, ultimate 4, level-up 2, + tier overlays), enemies ~12 each, tiles ~30, pickups/FX ~20.

### 6.3 Sprite data format
`src/content/sprites/*.ts` — palette-index grids, one char per pixel, base-32 (`.`=0 transparent, `1`–`9`, `a`–`v` = 10–31):
```ts
export const cyfilIdle: SpriteDef = {
  id: 'cyfil.idle',
  w: 24, h: 24,
  anchor: { x: 12, y: 24 },          // feet
  fps: 6,
  frames: [
    [ '........1111111.........',
      /* 24 rows */ ],
  ],
};
```
Validated at boot (dev) and in unit tests: row count, row length, legal chars only.
**Authoring path (recommended, see D-007):** draw in any pixel editor using the palette, save PNG to `art/`, run `npm run sprites:import` to convert PNG → grid file (fails on off-palette colors). The repo's source of truth remains the grid file.

### 6.4 Level format
`src/content/levels/<id>.json`. Char-grid tile rows (diffable, hand-editable), legend per level, entity list separate:
```json
{
  "format": 1,
  "id": "scrapyard-1",
  "name": "Scrapyard 1",
  "tileset": "scrapyard",
  "width": 180, "height": 12,
  "legend": { ".": "empty", "#": "ground", "=": "platform_oneway", "^": "spikes", "b": "bg_crate" },
  "tiles": [ "....180 chars....", "... 12 rows ..." ],
  "entities": [
    { "type": "playerStart", "x": 2,  "y": 9 },
    { "type": "abilityPickup", "x": 6, "y": 9, "ability": "wrench" },
    { "type": "toastbot", "x": 24, "y": 9 },
    { "type": "fanfly",   "x": 40, "y": 5 },
    { "type": "abilityPickup", "x": 72, "y": 8, "ability": "spark" },
    { "type": "checkpoint", "x": 90, "y": 9 },
    { "type": "goal", "x": 176, "y": 9 }
  ]
}
```
Tile coordinates, not pixels. Validated by a test: dimensions match, all chars in legend, all entity types known, exactly one `playerStart` and `goal`, entities inside bounds. Tile behaviors (solid, one-way, hazard) come from the tileset definition, not the level.

## 7. Saves

### 7.1 Storage
- `localStorage` key `<saveKeyPrefix>.save` plus `<saveKeyPrefix>.save.bak` (previous good save). Write order: serialize → validate → write `.bak` = old main → write main. On load: main → if invalid, `.bak` → if invalid, new save (and the bad blob is kept under `.corrupt` for export/debugging).
- On first launch call `navigator.storage.persist()` (best effort; iOS may ignore).
- `saveKeyPrefix` and `saveFormatId` live in config and are **stable identifiers independent of the display name**, so renaming the game never orphans saves.

### 7.2 Schema v1
```ts
interface SaveV1 {
  schemaVersion: 1;
  createdAt: string;            // ISO 8601
  updatedAt: string;
  abilities: Record<AbilityId, { unlocked: boolean; xp: number }>;  // AbilityId: 'wrench' | 'spark'
  equipped: AbilityId | null;
  levels: Record<LevelId, { completed: boolean; bestTimeMs: number | null }>;
  settings: { muted: boolean };
  stats: { totalHits: number; ultimatesUsed: number };
}
```
Tier is derived from XP. Unknown ability/level ids → reject.

### 7.3 Autosave triggers
Level complete, ability level-up, ability unlock, settings change. Never mid-tick; the sim emits an `autosave` event and the shell writes after the frame.

### 7.4 Migrations
`migrations[n]: (SaveVn) => SaveVn+1`, applied in sequence on load/import. Every past version gets a fixture file in `tests/fixtures/saves/` and a test that migrates it to current.

### 7.5 Export / import
- Export envelope: `{ "format": "<saveFormatId>", "v": 1, "data": {...}, "crc32": "…" }`. CRC detects corruption/truncation only — it is **not** tamper protection (single-player; editing your own save is fine).
- Export UI: **Share** (Web Share API with a file — the reliable path on iOS), **Download .json** (desktop), **Copy save code** (base64 text, works everywhere).
- Import UI: file picker or paste code.
- **Hostile-input handling**: max 32 KB before parse; `JSON.parse` inside try (never `eval`/`Function`); hand-written validator that rejects unknown keys, wrong types, non-finite numbers, negative/oversized XP (cap 1,000,000), unknown ids, strings over 64 chars, prototype keys (`__proto__`, `constructor`, `prototype`); validated object is **rebuilt** field-by-field into a fresh object (never spread the input). Nothing from a save is ever inserted as HTML — UI uses `textContent` only. Import shows a summary (abilities/tiers, levels done) and asks for confirmation; the current save is kept as `.bak`.
- Fuzz test: thousands of randomly mutated save files must either validate cleanly or be rejected — never throw uncaught, never produce an invalid in-memory save.

### 7.6 "Import prod save" (dev only)
Prod and dev have separate origins, so dev **cannot read** prod storage — by design. The flow is: export from prod (Share/Copy) → in dev, "Import prod save" (same importer, labeled, auto-snapshots the current dev save first). No cross-origin plumbing.

## 8. PWA and hosting

- Manifest per environment (name, short_name, icons, `display: standalone`, `orientation: any`, theme color). Dev manifest name "Cyfil DEV", icon with a DEV badge baked in.
- `apple-touch-icon` (iOS ignores manifest icons for home screen), `apple-mobile-web-app-status-bar-style`.
- Service worker: precaches the hashed build assets (cache name includes build hash). Update flow: new SW installs in background → title screen shows "Update ready — restart" → never swaps code mid-level.
- Hosting: Cloudflare free tier (Pages vs Workers static assets — researched and presented in Phase 2 before setup). **No custom domain** (D-012): prod and dev are two separate Cloudflare projects with their own free hostnames, e.g. `cyfil.<cf-host>` and `cyfil-dev.<cf-host>`. Different hostnames = different origins, so storage and service workers are separate. The URLs are publicly reachable but unadvertised; nothing on them is private.
- Security headers via the host's headers file:
  ```
  Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:;
    connect-src 'self'; manifest-src 'self'; worker-src 'self'; media-src 'self' blob:; font-src 'self';
    base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  Strict-Transport-Security: max-age=31536000
  ```
  No inline scripts or styles in the built HTML (Vite config enforces). A Playwright test fails on any CSP violation report in the console.

## 9. File structure

```
/
├─ CLAUDE.md                 short rules/commands/current milestone
├─ CHANGELOG.md
├─ docs/  DESIGN.md  MILESTONES.md  DECISIONS.md  SECURITY.md  PLAYTEST.md
├─ art/                      optional PNG sources for sprites:import
├─ public/                   _headers, robots.txt (generated icons land in dist)
├─ scripts/                  build-icons.ts, sprites-import.ts, check-prod-bundle.ts, png.ts
├─ src/
│  ├─ config.ts              GAME_NAME, saveKeyPrefix, saveFormatId, version
│  ├─ main.ts                boot: canvas, layout, loop, scenes
│  ├─ core/                  loop.ts, rng.ts, events.ts, math.ts
│  ├─ render/                palette.ts, atlas.ts, renderer.ts, layout.ts, camera.ts
│  ├─ input/                 input.ts, keyboard.ts, touch.ts, replay.ts
│  ├─ game/                  world.ts, physics.ts, player.ts, combat.ts, ultimate.ts,
│  │                         abilities/ (wrench.ts, spark.ts, leveling.ts),
│  │                         enemies/ (toastbot.ts, fanfly.ts), pickups.ts, level.ts
│  ├─ scenes/                title.ts, playing.ts, paused.ts, levelComplete.ts
│  ├─ ui/                    hud.ts, touchControls.ts, menus.ts (DOM via textContent only)
│  ├─ audio/                 audio.ts, sfx.ts
│  ├─ save/                  schema.ts, validate.ts, migrate.ts, storage.ts, exportImport.ts
│  ├─ content/               sprites/, tilesets/, levels/
│  ├─ pwa/                   sw.ts, register.ts, manifest.*.json
│  └─ dev/                   (dev build only) overlay, console, hitboxes, inspector, spriteViewer, cheats, snapshots
├─ tests/
│  ├─ unit/                  vitest
│  ├─ e2e/                   playwright smoke + golden frames + layout screenshots
│  └─ fixtures/              saves/, replays/
└─ .github/  workflows/ dependabot.yml  CODEOWNERS
```

## 10. Testing strategy — what automation can and can't verify

**Can verify**
- Physics/combat/leveling/save logic (unit tests in Node; the sim has no DOM).
- Replays: recorded input → assert end state (e.g. "this replay completes the level", "wrench reaches Tier 2").
- **Golden frames**: test build steps a replay to tick N, reads the 256×192 frame buffer via `getImageData`, compares to a stored PNG **pixel-exactly**. Internal-res comparison avoids the anti-aliasing/font flakiness of full screenshots.
- Layout screenshots (portrait/landscape, a few device sizes) with a tolerance threshold.
- Smoke: load, tap to unlock, simulate touch/keyboard input, play 10 s — fail on any console error, unhandled rejection, or CSP violation.
- Save validator fuzzing, migration fixtures, prod-bundle-has-no-dev-tools check.

**Cannot verify (needs you on a real iPhone)**
- Game feel: jump arc, touch responsiveness, combo timing, hitstop punch, difficulty.
- Whether the art reads well and looks good.
- Real iOS Safari/PWA behavior: install flow, audio unlock, silent switch, rotation glitches, safe areas, storage eviction, Low Power Mode. Playwright WebKit on Linux is not iOS.
- Sound quality.
Each milestone ships with a short checklist in `docs/PLAYTEST.md` for you.

## 11. Risks

| # | Risk | Likelihood / impact | Mitigation |
|---|---|---|---|
| R1 | **Touch controls feel bad** — the #1 threat to the game being fun | High / High | Relative slide pad, generous hit areas, coyote + buffer, early playtest (M2), tunable layout constants. |
| R2 | **AI-drawn pixel art is mediocre.** I can write palette grids, but 45 frames of 24×24 animation authored as text will look stiff | High / High | Sprite viewer early; PNG import so you (or a hired artist) can draw in Aseprite/Piskel; accept "programmer art" for the slice and judge mechanics first. |
| R3 | iOS evicts or loses PWA storage (deleting the home-screen app deletes its data) | Medium / High | Backup key, prominent export, "last exported N days ago" nudge. |
| R4 | Service worker serves stale builds / bricks updates | Medium / High | Hashed cache names, explicit update prompt, a "reset app" escape hatch in settings, e2e test of the update flow. |
| R5 | iOS Safari quirks (late resize events, audio unlock, rAF throttling, 100vh bugs) | High / Medium | Layout re-check, device checklist, visualViewport-based sizing. |
| R6 | Golden-frame tests become brittle and get ignored | Medium / Medium | Deterministic sim; small number of goldens; one command to re-bless with a diff image for review. |
| R7 | Scope creep inside the slice (tier behaviors, extra enemies, polish) | High / Medium | Milestone gates; deferral list in DECISIONS. |
| R8 | Public repo: anything committed is world-readable forever (git history) | Medium / Medium | Secret scanning + push protection, gitleaks in CI as a second net, `.gitignore` for env files, never commit personal saves. |
| R9 | Cloudflare free-tier terms change | Low / Medium | Static output only — portable to any static host. |
| R10 | Char-grid level authoring gets painful beyond a few levels | Medium (later) / Low | Fine for 1 level; revisit Tiled import or an in-game editor when we plan more levels. |

## 12. Open questions

None open. Phase 1 answers are recorded as D-012 to D-016 in DECISIONS.md.
