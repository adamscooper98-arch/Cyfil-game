import type { SpriteDef } from '../../render/spriteTypes.ts';
import { makeGrid } from './helpers.ts';

/** Parallax layers: 64 px wide, tiled horizontally. Far = navy towers (3), near = slate scrap piles (4). */
const FAR = makeGrid(64, 192, '.', [
  { rect: [0, 118, 14, 74], ch: '3' },
  { rect: [14, 96, 10, 96], ch: '3' },
  { rect: [24, 130, 16, 62], ch: '3' },
  { rect: [40, 88, 12, 104], ch: '3' },
  { rect: [52, 124, 12, 68], ch: '3' },
  { rect: [18, 90, 2, 6], ch: '3' },
  { rect: [45, 80, 2, 8], ch: '3' },
  { px: [[4, 126], [8, 134], [18, 106], [20, 114], [30, 140], [45, 100], [48, 112], [57, 136]], ch: '4' },
]);

const NEAR = makeGrid(64, 128, '.', [
  { rect: [0, 92, 18, 36], ch: '4' },
  { rect: [4, 84, 8, 8], ch: '4' },
  { rect: [18, 74, 14, 54], ch: '4' },
  { rect: [32, 98, 14, 30], ch: '4' },
  { rect: [46, 84, 18, 44], ch: '4' },
  { rect: [52, 76, 6, 8], ch: '4' },
  { px: [[6, 100], [24, 90], [26, 98], [38, 108], [52, 96], [58, 104]], ch: '5' },
]);

export const BACKGROUND_SPRITES: readonly SpriteDef[] = [
  { id: 'bg.far', w: 64, h: 192, anchor: { x: 0, y: 0 }, fps: 0, frames: [FAR] },
  { id: 'bg.near', w: 64, h: 128, anchor: { x: 0, y: 0 }, fps: 0, frames: [NEAR] },
];
