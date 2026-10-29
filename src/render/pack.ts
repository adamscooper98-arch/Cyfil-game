export interface Size {
  readonly w: number;
  readonly h: number;
}
export interface Placed {
  readonly x: number;
  readonly y: number;
}

/**
 * Simple shelf packer: places rectangles left to right in rows, tallest first within the input order given.
 * Returns positions in input order and the total height used. Throws if a rectangle is wider than the atlas.
 */
export function packRects(sizes: readonly Size[], atlasWidth: number): { placed: Placed[]; height: number } {
  const order = sizes.map((s, i) => ({ s, i })).sort((a, b) => b.s.h - a.s.h || a.i - b.i);
  const placed: Placed[] = new Array<Placed>(sizes.length);
  let x = 0;
  let y = 0;
  let rowH = 0;
  for (const { s, i } of order) {
    if (s.w > atlasWidth) throw new Error(`Rect ${String(s.w)}x${String(s.h)} wider than atlas (${String(atlasWidth)})`);
    if (x + s.w > atlasWidth) {
      y += rowH;
      x = 0;
      rowH = 0;
    }
    placed[i] = { x, y };
    x += s.w;
    rowH = Math.max(rowH, s.h);
  }
  return { placed, height: y + rowH };
}
