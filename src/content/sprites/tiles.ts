import type { SpriteDef } from '../../render/spriteTypes.ts';
import { makeGrid } from './helpers.ts';

/** 16x16 scrapyard tiles. Palette: 8 dark rust, 9 rust, a copper, b light copper, s steel, r dark steel, u light grey. */
const GROUND = makeGrid(16, 16, '9', [
  { px: [[2, 3], [9, 1], [13, 6], [5, 9], [11, 12], [1, 14], [7, 6]], ch: '8' },
  { px: [[4, 1], [12, 3], [1, 8], [8, 11], [14, 14], [6, 14]], ch: 'a' },
]);

const GROUND_TOP = makeGrid(16, 16, '9', [
  { rect: [0, 0, 16, 3], ch: 'a' },
  { rect: [0, 0, 16, 1], ch: 'b' },
  { rect: [0, 3, 16, 1], ch: '8' },
  { px: [[3, 1], [10, 2], [6, 1], [14, 1]], ch: 'k' },
  { px: [[2, 7], [11, 6], [6, 10], [13, 12], [3, 13]], ch: '8' },
  { px: [[8, 5], [1, 11], [12, 9]], ch: 'a' },
]);

const PLATFORM = makeGrid(16, 16, '.', [
  { rect: [0, 0, 16, 4], ch: 's' },
  { rect: [0, 0, 16, 1], ch: 'u' },
  { rect: [0, 3, 16, 1], ch: 'r' },
  { px: [[2, 1], [13, 1], [7, 2]], ch: '1' },
]);

const CRATE = makeGrid(16, 16, '.', [
  { rect: [1, 1, 14, 14], ch: '1' },
  { rect: [2, 2, 12, 12], ch: 'a' },
  { rect: [2, 2, 12, 1], ch: 'b' },
  { rect: [2, 7, 12, 2], ch: '9' },
  { rect: [7, 2, 2, 12], ch: '9' },
  { px: [[3, 3], [12, 3], [3, 12], [12, 12]], ch: '1' },
]);

export const TILE_SPRITES: readonly SpriteDef[] = [
  { id: 'tile.ground', w: 16, h: 16, anchor: { x: 0, y: 0 }, fps: 0, frames: [GROUND] },
  { id: 'tile.ground_top', w: 16, h: 16, anchor: { x: 0, y: 0 }, fps: 0, frames: [GROUND_TOP] },
  { id: 'tile.platform', w: 16, h: 16, anchor: { x: 0, y: 0 }, fps: 0, frames: [PLATFORM] },
  { id: 'tile.crate', w: 16, h: 16, anchor: { x: 0, y: 0 }, fps: 0, frames: [CRATE] },
];
