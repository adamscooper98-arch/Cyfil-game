import type { TileKind } from '../content/tilesets/scrapyard.ts';
import { TILE, type Level, tileNameAt } from './level.ts';

/** Cyfil's collision box: 12 wide, 18 tall, anchored at the bottom center (DESIGN §6.2). */
export const HALF_W = 6;
export const BODY_H = 18;
const EPS = 1e-4;

export interface Body {
  /** Bottom-center of the collision box. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
}

/** Kind of tile at tile coordinates. The left/right edges of the level are walls; above/below are open. */
export function tileKind(level: Level, tx: number, ty: number): TileKind {
  if (tx < 0 || tx >= level.width) return 'solid';
  if (ty < 0 || ty >= level.height) return 'empty';
  return level.tileset.tiles[tileNameAt(level, tx, ty)]?.kind ?? 'empty';
}

function colRange(x: number): [number, number] {
  return [Math.floor((x - HALF_W + EPS) / TILE), Math.floor((x + HALF_W - EPS) / TILE)];
}

function rowRange(y: number): [number, number] {
  return [Math.floor((y - BODY_H + EPS) / TILE), Math.floor((y - EPS) / TILE)];
}

/** Does the box at (x, y) overlap any solid tile? */
export function hitsSolid(level: Level, x: number, y: number): boolean {
  const [x0, x1] = colRange(x);
  const [y0, y1] = rowRange(y);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (tileKind(level, tx, ty) === 'solid') return true;
  return false;
}

/** Horizontal move with wall collision (one-way tiles never block sideways). */
export function moveX(b: Body, level: Level): void {
  b.x += b.vx;
  if (!hitsSolid(level, b.x, b.y)) return;
  if (b.vx > 0) {
    b.x = Math.floor((b.x + HALF_W - EPS) / TILE) * TILE - HALF_W;
  } else if (b.vx < 0) {
    b.x = (Math.floor((b.x - HALF_W + EPS) / TILE) + 1) * TILE + HALF_W;
  }
  b.vx = 0;
}

/** Vertical move: lands on solid and one-way tiles, bumps the head on solid ceilings. Sets onGround. */
export function moveY(b: Body, level: Level): void {
  const prevY = b.y;
  b.y += b.vy;
  b.onGround = false;

  if (b.vy > 0) {
    if (hitsSolid(level, b.x, b.y)) {
      b.y = Math.floor((b.y - EPS) / TILE) * TILE;
      b.vy = 0;
      b.onGround = true;
      return;
    }
    // One-way platforms: land only if the feet were at or above the tile top last tick.
    const row = Math.floor((b.y - EPS) / TILE);
    const top = row * TILE;
    if (prevY <= top + EPS && b.y > top) {
      const [x0, x1] = colRange(b.x);
      for (let tx = x0; tx <= x1; tx++) {
        if (tileKind(level, tx, row) === 'oneway') {
          b.y = top;
          b.vy = 0;
          b.onGround = true;
          return;
        }
      }
    }
  } else if (b.vy < 0 && hitsSolid(level, b.x, b.y)) {
    const row = Math.floor((b.y - BODY_H + EPS) / TILE);
    b.y = (row + 1) * TILE + BODY_H;
    b.vy = 0;
  }
}
