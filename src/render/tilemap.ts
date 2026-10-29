import { SCREEN_H, SCREEN_W } from '../config.ts';
import { TILE, type Level, tileNameAt } from '../game/level.ts';
import type { Camera } from './camera.ts';
import type { Renderer } from './renderer.ts';

/** Draw only the tiles that can be on screen. */
export function drawTilemap(r: Renderer, level: Level, cam: Camera): void {
  const x0 = Math.floor(cam.px / TILE);
  const x1 = Math.floor((cam.px + SCREEN_W - 1) / TILE);
  const y0 = Math.floor(cam.py / TILE);
  const y1 = Math.floor((cam.py + SCREEN_H - 1) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const sprite = level.tileset.tiles[tileNameAt(level, tx, ty)]?.sprite;
      if (sprite) r.drawSprite(sprite, 0, tx * TILE - cam.px, ty * TILE - cam.py);
    }
  }
}

/** A horizontally tiling background layer that scrolls at `factor` of the camera speed. */
export function drawParallax(r: Renderer, spriteId: string, spriteW: number, y: number, factor: number, cam: Camera): void {
  const offset = Math.floor(cam.px * factor) % spriteW;
  for (let x = -offset; x < SCREEN_W; x += spriteW) r.drawSprite(spriteId, 0, x, y);
}
