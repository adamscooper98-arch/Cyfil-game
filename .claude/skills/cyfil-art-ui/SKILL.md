---
name: cyfil-art-ui
description: Art, sprite, tile, palette, HUD, menu, touch-control and naming rules for the Cyfil pixel-art platformer. Use this whenever creating or changing sprites, animations, tiles, backgrounds, palette colors, ability tier visuals, level art, the HUD, menus, touch controls, fonts, screen scaling or layout, or when naming sprites, tiles, levels or art files, even if the request never mentions "art rules" or "style".
---

# Cyfil art and UI rules

These rules keep the game crisp, readable on a phone, and consistent from session to session. Most of them exist because pixel art breaks quietly: a blurry edge or an off-palette color looks "almost fine" until it is everywhere. Code lives in `src/`; the design reasoning is in `docs/DESIGN.md` §5-6.

## Rendering and scaling (hard constraints)

- The game draws at a fixed **256x192** and is scaled up by a whole number only (`computeScale` in `src/render/layout.ts`). Fractional scaling blurs pixels, so never add it.
- All canvas drawing uses whole-pixel coordinates with image smoothing off. The canvas is shown with `image-rendering: pixelated`.
- Never rotate or scale a sprite at runtime. Draw flipped frames through the atlas (flips are pre-baked) and add new frames for new poses.
- Dim or fade with a checkerboard in a palette color (`Renderer.dither`), not with alpha. Alpha invents colors that are not in the palette.
- Game visuals live on the canvas. Touch controls and menus are DOM elements outside it, placed by CSS (portrait: below the game; landscape: in the side gutters). Respect safe-area insets, because iPhone notches and corners cut things off.

## Palette (32 slots, locked)

- Art refers to palette **indexes**, never hex values. Hex lives in one file, `src/render/palette.ts`. Recoloring the whole game is editing hex values there.
- Cooper approved this palette (D-029). Changing a hex value is fine if asked. **Ask Cooper first** before reordering slots, giving a slot a new meaning, or adding colors, because every sprite grid depends on the meaning of each index.
- Slot roles: 0 transparent; 1 near-black outline; 2 navy background; 3-6 navy to pale-blue ramp (3 far skyline, 4 near scrap); 7 white; 8-12 rust and copper ramp (ground); 13-15 cyan (Cyfil's body); 16-18 magenta; 19-20 lemon and gold; 21-22 green; 23-24 red; 25-26 violet; 27-30 steel and greys; 31 hot orange.
- The world is navy, rust and steel. **Neon slots 13, 16, 19 and 21 are reserved** for the player, abilities, pickups and danger telegraphs, so those things pop. Do not spend neon on scenery.

## Sprites

- Format: palette-index grids in `src/content/sprites/`, one character per pixel (`.` = transparent, `0-9` = 0-9, `a-v` = 10-31). `validateSprite` rejects wrong sizes and illegal characters, and a unit test checks every sprite.
- Sizes: tiles 16x16; Cyfil 24x24; Toastbot 24x24; Fanfly 16x16; projectiles 8x8; pickups 16x16 (DESIGN §6.2).
- Anchor: the pixel that sits at the entity's position. Characters anchor at bottom-center, with `anchor.y` equal to the sprite height so the feet touch the ground line. Tiles and backgrounds anchor at the top-left (0, 0).
- Outlines (slot 1) are required on characters, enemies and pickups so they separate from the background. Tiles and backgrounds do not use outlines.
- Shading: light comes from the top-left. Each surface gets one highlight tone and one shadow tone. Aim for 8 colors or fewer per sprite. This keeps shapes readable at 16-24 pixels.
- Dithering is allowed in backgrounds only. On small sprites it reads as noise.
- Ability tiers and other recolors are **variants** (palette swaps declared on the sprite and baked into the atlas), not duplicate sprites. Tier visuals may also add small overlay sprites or particles.
- Animation: frame lists with an `fps`. Don't author left-facing frames; the engine flips.
- Current art is programmer art. Keep sizes, anchors and frame counts stable so real art can replace grids later without engine changes.

## Tiles and levels

- Tile grid is 16x16. A tileset maps tile names to a sprite and a kind (`solid`, `oneway`, `hazard`, `decor`, `empty`). Levels are JSON that refer to tiles by name through a one-character legend. Add new tile art in `src/content/sprites/tiles.ts` and register it in the tileset file.

## UI and text

- HUD text is drawn on the canvas in the built-in 3x5 pixel font (`src/render/tinyfont.ts`), upper case, at whole-number scales. Do not use browser fonts on the canvas: they anti-alias and break the look. Keep HUD elements (hearts, meter, combo) in the pixel style using palette colors.
- Larger menu and dialog text will need a 5x7 pixel font; add it when menus are built, rather than scaling the 3x5 font past what reads cleanly.
- Touch controls, save/export/import and settings are DOM. Style them with palette colors only. New touch targets are at least 44 CSS pixels. Never put save-file or imported text into the page as HTML; use `textContent`.
- Dev tools (`.dev-ui`) are a separate look and never ship in prod. Do not copy their styling into game UI.

## Naming

- Sprite ids: `group.name` or `group.name.state`, lowercase, e.g. `cyfil.idle`, `tile.ground_top`, `bg.far`, `toastbot.walk`.
- Tile names: `snake_case`. Level ids: kebab-case (`physics-course`). Variant names: lowercase single words (`gold`).
- Sprite code lives under `src/content/sprites/`, one file per character or group.

## Originality

All characters, art and names are original. The game is inspired by the genre only. Do not recreate, trace or closely imitate sprites, characters or names from existing games.

## When art changes

1. Run the unit tests (`npm run test`): they validate every sprite.
2. Look at it in the dev build's Sprites viewer.
3. If visuals changed on purpose, re-bless the golden frames (`UPDATE_GOLDEN=1 npx playwright test golden --project=chromium`), look at the PNG diffs, and mention it in `CHANGELOG.md`.
4. Palette or style rule changes get a line in `docs/DECISIONS.md`.
