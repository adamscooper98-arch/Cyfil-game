/** Authoring helpers that output sprite grids (rows of palette-index characters). The result is still plain data. */
export type GridOp =
  | { readonly rect: readonly [x: number, y: number, w: number, h: number]; readonly ch: string }
  | { readonly px: readonly (readonly [x: number, y: number])[]; readonly ch: string };

export function makeGrid(w: number, h: number, fill: string, ops: readonly GridOp[]): string[] {
  const rows = Array.from({ length: h }, () => Array.from<string>({ length: w }).fill(fill));
  const set = (x: number, y: number, ch: string): void => {
    const row = rows[y];
    if (row && x >= 0 && x < w) row[x] = ch;
  };
  for (const op of ops) {
    if ('rect' in op) {
      const [rx, ry, rw, rh] = op.rect;
      for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) set(x, y, op.ch);
    } else {
      for (const [x, y] of op.px) set(x, y, op.ch);
    }
  }
  return rows.map((r) => r.join(''));
}

/** Copy of `base` with some rows replaced (row index -> new row). */
export function patchRows(base: readonly string[], patches: Readonly<Record<number, string>>): string[] {
  return base.map((row, i) => patches[i] ?? row);
}
