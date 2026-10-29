import type { SpriteDef } from '../../render/spriteTypes.ts';
import { patchRows } from './helpers.ts';

/**
 * Placeholder Cyfil (24x24): cassette body, big lens eye, magenta feet, antenna. Programmer art; replace the grids
 * whenever real art exists (the engine only cares about size, anchor and frames).
 * Palette indexes: 1 outline, d/e/f cyan family, 7 white, j lemon, g magenta, 3 navy.
 */
const window = (inner: string): string => `...1d1${inner}1d1...`;
const border = `...1d${'1'.repeat(14)}d1...`;
const NAVY = '3'.repeat(12);

/** Rows 0-19: antenna, head, eye window. Legs (rows 20-23) are added by `legRows`. */
const TOP: readonly string[] = [
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
];

/**
 * Rows 20-23: two legs with magenta feet. `lx`/`rx` are the stem columns; a lifted foot is drawn one row higher
 * with a shorter stem (used for the run cycle and the jump tuck).
 */
function legRows(lx: number, rx: number, lLift: boolean, rLift: boolean): string[] {
  const rows = Array.from({ length: 4 }, () => Array.from<string>({ length: 24 }).fill('.'));
  const set = (r: number, x: number, ch: string): void => {
    const row = rows[r];
    if (row && x >= 0 && x < 24) row[x] = ch;
  };
  const leg = (cx: number, footStart: number, lift: boolean): void => {
    const o = lift ? -1 : 0;
    set(0, cx, '1');
    if (!lift) set(1, cx, '1');
    '1gg1'.split('').forEach((ch, i) => {
      set(2 + o, footStart + i, ch);
    });
    '1111'.split('').forEach((ch, i) => {
      set(3 + o, footStart + i, ch);
    });
  };
  leg(lx, lx - 1, lLift);
  leg(rx, rx - 2, rLift);
  return rows.map((r) => r.join(''));
}

const withLegs = (legs: readonly string[]): string[] => [...TOP, ...legs];

const IDLE = withLegs(legRows(7, 16, false, false));
/** Eye closed: rows 9-15 are the window interior. */
const BLINK = patchRows(IDLE, {
  11: window(NAVY),
  12: window('331111111133'),
  13: window(NAVY),
  14: window(NAVY),
});

const RUN: readonly (readonly string[])[] = [
  withLegs(legRows(6, 17, false, true)),
  withLegs(legRows(7, 16, false, false)),
  withLegs(legRows(6, 17, true, false)),
  withLegs(legRows(7, 16, false, false)),
];
const JUMP = withLegs(legRows(8, 15, true, true));
const FALL = withLegs(legRows(5, 18, false, false));

const ANCHOR = { x: 12, y: 24 } as const;
// Palette swap proving the variant pipeline; the real ability tiers will define their own.
const VARIANTS = { gold: { 13: 20, 14: 10, 15: 19 } } as const;

export const CYFIL_SPRITES: readonly SpriteDef[] = [
  { id: 'cyfil.idle', w: 24, h: 24, anchor: ANCHOR, fps: 3, frames: [IDLE, IDLE, IDLE, IDLE, IDLE, BLINK], variants: VARIANTS },
  { id: 'cyfil.run', w: 24, h: 24, anchor: ANCHOR, fps: 12, frames: RUN, variants: VARIANTS },
  { id: 'cyfil.jump', w: 24, h: 24, anchor: ANCHOR, fps: 0, frames: [JUMP], variants: VARIANTS },
  { id: 'cyfil.fall', w: 24, h: 24, anchor: ANCHOR, fps: 0, frames: [FALL], variants: VARIANTS },
];
