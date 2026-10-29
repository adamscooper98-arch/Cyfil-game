import { PALETTE_SIZE } from './palette.ts';

/** One char per pixel: '.' = 0 (transparent), '0'-'9' = 0-9, 'a'-'v' = 10-31. */
const ALPHABET = '0123456789abcdefghijklmnopqrstuv';

export function charToIndex(ch: string): number {
  if (ch === '.') return 0;
  const i = ALPHABET.indexOf(ch);
  if (ch.length !== 1 || i < 0 || i >= PALETTE_SIZE) {
    throw new Error(`Illegal sprite character: ${JSON.stringify(ch)}`);
  }
  return i;
}

/** Parse a palette-index grid. Throws on wrong dimensions or illegal characters. */
export function parseGrid(rows: readonly string[], w: number, h: number): Uint8Array {
  if (rows.length !== h) throw new Error(`Sprite has ${rows.length} rows, expected ${h}`);
  const out = new Uint8Array(w * h);
  rows.forEach((row, y) => {
    if (row.length !== w) throw new Error(`Sprite row ${y} has length ${row.length}, expected ${w}`);
    for (let x = 0; x < w; x++) out[y * w + x] = charToIndex(row.charAt(x));
  });
  return out;
}
