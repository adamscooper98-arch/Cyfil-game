import type { SpriteDef } from '../../render/spriteTypes.ts';
import { makeGrid } from './helpers.ts';

/**
 * Placeholder combat art (programmer art; replace the grids whenever real art exists).
 * Palette indexes: 1 outline, 7 white, 8-12 rust ramp, f cyan-light (15), d cyan (13), g magenta (16), j lemon (19), s grey (28).
 */

/** Training dummy, 16x20: target head on a post and a weighted base. */
const DUMMY = makeGrid(16, 20, '.', [
  { rect: [3, 0, 10, 8], ch: '1' },
  { rect: [4, 1, 8, 6], ch: 'a' },
  { rect: [5, 2, 6, 4], ch: 'b' },
  { rect: [7, 3, 2, 2], ch: 'g' },
  { rect: [7, 8, 2, 2], ch: '1' },
  { rect: [2, 9, 12, 6], ch: '1' },
  { rect: [3, 10, 10, 4], ch: 'a' },
  { rect: [3, 12, 10, 1], ch: 'b' },
  { rect: [1, 15, 14, 5], ch: '1' },
  { rect: [2, 16, 12, 3], ch: 's' },
]);

/** Flat, white-hot version of the dummy for the hit flash. */
const DUMMY_FLASH = { 8: 7, 9: 7, 10: 7, 11: 7, 12: 7, 16: 7, 17: 7, 28: 7, 29: 7 } as const;

/** Row spans (start, end inclusive) for the top half of the jab arc; the bottom half mirrors it. */
const ARC_TOP: readonly (readonly [number, number])[] = [
  [1, 8],
  [7, 12],
  [11, 15],
  [14, 17],
  [16, 18],
  [17, 19],
  [18, 19],
  [18, 19],
];

function arc(): string[] {
  const ops = [...ARC_TOP, ...[...ARC_TOP].reverse()].flatMap(([a, b], y) => [
    { rect: [a, y, b - a + 1, 1] as const, ch: 'f' },
    { rect: [Math.max(a, b - 1), y, Math.min(2, b - a + 1), 1] as const, ch: '7' },
  ]);
  return makeGrid(20, 16, '.', ops);
}

/** Ring around Cyfil for the spin bump, 32x24. */
const SPIN = makeGrid(32, 24, '.', [
  { rect: [4, 0, 24, 2], ch: 'f' },
  { rect: [4, 22, 24, 2], ch: 'f' },
  { rect: [0, 4, 2, 16], ch: 'f' },
  { rect: [30, 4, 2, 16], ch: 'f' },
  { px: [[3, 2], [2, 3], [28, 2], [29, 3], [3, 21], [2, 20], [28, 21], [29, 20]], ch: 'f' },
  { rect: [10, 0, 6, 1], ch: '7' },
  { rect: [16, 23, 6, 1], ch: '7' },
]);

/** Impact spark, 9x9, three frames: small, big, fading. */
const SPARK_1 = makeGrid(9, 9, '.', [{ rect: [3, 3, 3, 3], ch: 'j' }, { rect: [4, 4, 1, 1], ch: '7' }]);
const SPARK_2 = makeGrid(9, 9, '.', [
  { rect: [4, 0, 1, 9], ch: 'j' },
  { rect: [0, 4, 9, 1], ch: 'j' },
  { px: [[2, 2], [6, 2], [2, 6], [6, 6]], ch: 'j' },
  { rect: [3, 3, 3, 3], ch: '7' },
]);
const SPARK_3 = makeGrid(9, 9, '.', [
  { px: [[4, 0], [4, 8], [0, 4], [8, 4], [1, 1], [7, 1], [1, 7], [7, 7]], ch: 'j' },
  { rect: [4, 4, 1, 1], ch: '7' },
]);

export const COMBAT_SPRITES: readonly SpriteDef[] = [
  { id: 'dummy.idle', w: 16, h: 20, anchor: { x: 8, y: 20 }, fps: 0, frames: [DUMMY], variants: { flash: DUMMY_FLASH } },
  { id: 'fx.slash', w: 20, h: 16, anchor: { x: 0, y: 8 }, fps: 0, frames: [arc()] },
  { id: 'fx.spin', w: 32, h: 24, anchor: { x: 16, y: 12 }, fps: 0, frames: [SPIN] },
  { id: 'fx.spark', w: 9, h: 9, anchor: { x: 4, y: 4 }, fps: 20, frames: [SPARK_1, SPARK_2, SPARK_3] },
];
