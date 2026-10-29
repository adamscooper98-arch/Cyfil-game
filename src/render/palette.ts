/**
 * The locked 32-entry palette (DESIGN §6.1). Index 0 is transparent.
 * Placeholder hex values until M1 sign-off, after which this file is frozen.
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

/** Named indexes used by code; sprites use raw indexes. */
export const C = {
  transparent: 0,
  outline: 1,
  navy: 2,
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
