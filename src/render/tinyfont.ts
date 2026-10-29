/** 3x5 bitmap font. Glyphs are 5 rows of 3 chars separated by '/', 'X' = pixel. Used for the test card and DEV icon badge. */
const GLYPH_SRC: Readonly<Record<string, string>> = {
  A: '.X./X.X/XXX/X.X/X.X', B: 'XX./X.X/XX./X.X/XX.', C: '.XX/X../X../X../.XX', D: 'XX./X.X/X.X/X.X/XX.',
  E: 'XXX/X../XX./X../XXX', F: 'XXX/X../XX./X../X..', G: '.XX/X../X.X/X.X/.XX', H: 'X.X/X.X/XXX/X.X/X.X',
  I: 'XXX/.X./.X./.X./XXX', J: '..X/..X/..X/X.X/.X.', K: 'X.X/X.X/XX./X.X/X.X', L: 'X../X../X../X../XXX',
  M: 'X.X/XXX/XXX/X.X/X.X', N: 'XX./X.X/X.X/X.X/X.X', O: '.X./X.X/X.X/X.X/.X.', P: 'XX./X.X/XX./X../X..',
  Q: '.X./X.X/X.X/XX./.XX', R: 'XX./X.X/XX./X.X/X.X', S: '.XX/X../.X./..X/XX.', T: 'XXX/.X./.X./.X./.X.',
  U: 'X.X/X.X/X.X/X.X/XXX', V: 'X.X/X.X/X.X/X.X/.X.', W: 'X.X/X.X/XXX/XXX/X.X', X: 'X.X/X.X/.X./X.X/X.X',
  Y: 'X.X/X.X/.X./.X./.X.', Z: 'XXX/..X/.X./X../XXX',
  '0': 'XXX/X.X/X.X/X.X/XXX', '1': '.X./XX./.X./.X./XXX', '2': 'XX./..X/.X./X../XXX', '3': 'XX./..X/.X./..X/XX.',
  '4': 'X.X/X.X/XXX/..X/..X', '5': 'XXX/X../XX./..X/XX.', '6': '.XX/X../XXX/X.X/XXX', '7': 'XXX/..X/.X./.X./.X.',
  '8': 'XXX/X.X/XXX/X.X/XXX', '9': 'XXX/X.X/XXX/..X/XX.',
  ' ': '.../.../.../.../...', '-': '.../.../XXX/.../...', '.': '.../.../.../.../.X.',
};

export const GLYPH_W = 3;
export const GLYPH_H = 5;

function glyphRows(ch: string): string[] | undefined {
  const key = ch.toUpperCase();
  return Object.hasOwn(GLYPH_SRC, key) ? GLYPH_SRC[key]?.split('/') : undefined;
}

export function hasGlyph(ch: string): boolean {
  return glyphRows(ch) !== undefined;
}

/** Every glyph key, for tests. */
export function glyphKeys(): string[] {
  return Object.keys(GLYPH_SRC);
}

export function glyphSource(ch: string): string | undefined {
  return Object.hasOwn(GLYPH_SRC, ch.toUpperCase()) ? GLYPH_SRC[ch.toUpperCase()] : undefined;
}

export function textWidth(text: string): number {
  const n = text.length;
  return n === 0 ? 0 : n * (GLYPH_W + 1) - 1;
}

/** Calls plot(x, y) for each lit pixel of `text`, relative to its top-left. Unknown chars render as blanks. */
export function forEachTextPixel(text: string, plot: (x: number, y: number) => void): void {
  let cursor = 0;
  for (const ch of text) {
    const rows = glyphRows(ch);
    rows?.forEach((row, y) => {
      for (let x = 0; x < GLYPH_W; x++) {
        if (row.charAt(x) === 'X') plot(cursor + x, y);
      }
    });
    cursor += GLYPH_W + 1;
  }
}
