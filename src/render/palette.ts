/**
 * The 32-entry palette (DESIGN §6.1). Index 0 is transparent.
 *
 * Sprites, tiles and the UI refer to colors only by index, never by hex. To recolor the whole game, edit
 * the hex values below; nothing else needs to change. To add or reorder colors, remember sprite grids use
 * these indexes, so changing which slot means what is an art change, not just a recolor.
 * Cooper approved this palette for M1 (2026-10-29); revisit freely.
 */
export const PALETTE: readonly (string | null)[] = [
  null,
  '#0b0e1f', '#1a1f3d', '#2b335f', '#45508a', '#6f7fc0', '#b4c3ff', '#ffffff',
  '#3b1f1a', '#6b3420', '#a85a2c', '#d98b3a', '#ffc46b',
  '#00e5ff', '#0093b8', '#7dffef',
  '#ff2fa6', '#b0127a', '#ff9bd6',
  '#fff23a', '#ffb800',
  '#39ff6a', '#149e4a',
  '#ff4a3d', '#a8162b',
  '#8c5cff', '#4b2a9e',
  '#30303c', '#5c5a66', '#8f8d99', '#c9c6d1',
  '#ff7a1a',
];

export const PALETTE_SIZE = 32;

/** Named indexes used by engine code; sprites use raw indexes. */
export const C = {
  transparent: 0,
  outline: 1,
  navy: 2,
  slate: 4,
  white: 7,
  cyan: 13,
  magenta: 16,
  lemon: 19,
  grey: 29,
} as const;

export function paletteRgb(index: number): [number, number, number] | null {
  const hex = PALETTE[index];
  if (!hex) return null;
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** CSS color string for a palette index (transparent -> 'transparent'). */
export function paletteCss(index: number): string {
  const rgb = paletteRgb(index);
  return rgb ? `rgb(${String(rgb[0])} ${String(rgb[1])} ${String(rgb[2])})` : 'transparent';
}
