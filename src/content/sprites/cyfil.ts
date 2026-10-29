import type { SpriteDef } from '../../render/spriteTypes.ts';
import { patchRows } from './helpers.ts';

/**
 * Placeholder Cyfil (24x24): cassette body, big lens eye, magenta feet, antenna. Programmer art for M1;
 * replace the grids whenever real art exists (the engine only cares about size, anchor and frames).
 * Palette indexes: 1 outline, d/e/f cyan family, 7 white, j lemon, g magenta, 3 navy.
 */
const window = (inner: string): string => `...1d1${inner}1d1...`;
const border = `...1d${'1'.repeat(14)}d1...`;
const NAVY = '3'.repeat(12);

const OPEN: readonly string[] = [
  '.'.repeat(24),
  `${'.'.repeat(11)}gg${'.'.repeat(11)}`,
  `${'.'.repeat(11)}gg${'.'.repeat(11)}`,
  `${'.'.repeat(11)}11${'.'.repeat(11)}`,
  `${'.'.repeat(11)}11${'.'.repeat(11)}`,
  `....${'1'.repeat(16)}....`,
  `...1${'f'.repeat(16)}1...`,
  `...1${'d'.repeat(16)}1...`,
  border,
  window(NAVY),
  window('333777777333'),
  window('3377jjjj7733'),
  window('3377j11j7733'),
  window('3377jjjj7733'),
  window('333777777333'),
  window(NAVY),
  border,
  `...1${'d'.repeat(16)}1...`,
  `...1${'e'.repeat(16)}1...`,
  `....${'1'.repeat(16)}....`,
  '.......1........1.......',
  '.......1........1.......',
  '......1gg1....1gg1......',
  '......1111....1111......',
];

/** Eye closed: rows 9-15 are the window interior. */
const BLINK: readonly string[] = patchRows(OPEN, {
  11: window(NAVY),
  12: window('331111111133'),
  13: window(NAVY),
  14: window(NAVY),
});

export const CYFIL_SPRITES: readonly SpriteDef[] = [
  {
    id: 'cyfil.idle',
    w: 24,
    h: 24,
    anchor: { x: 12, y: 24 },
    fps: 3,
    frames: [OPEN, OPEN, OPEN, OPEN, OPEN, BLINK],
    // Palette swap proving the variant pipeline; the real ability tiers will define their own.
    variants: { gold: { 13: 20, 14: 10, 15: 19 } },
  },
];
