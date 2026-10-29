import { DEV_BADGE, ICON_GRID, ICON_SIZE } from '../src/content/sprites/icon.ts';
import { paletteRgb } from '../src/render/palette.ts';
import { parseGrid } from '../src/render/sprite.ts';
import { forEachTextPixel } from '../src/render/tinyfont.ts';
import { encodePng } from './png.ts';

/** Render the icon grid (optionally with the DEV badge) to a nearest-neighbor scaled PNG. */
export function renderIcon(size: number, withDevBadge: boolean): Buffer {
  if (size % ICON_SIZE !== 0) throw new Error(`Icon size ${size} must be a multiple of ${ICON_SIZE}`);
  const grid = parseGrid(ICON_GRID, ICON_SIZE, ICON_SIZE);

  if (withDevBadge) {
    for (let y = DEV_BADGE.y0; y <= DEV_BADGE.y1; y++) {
      for (let x = 0; x < ICON_SIZE; x++) grid[y * ICON_SIZE + x] = DEV_BADGE.bandIndex;
    }
    forEachTextPixel('DEV', (x, y) => {
      grid[(DEV_BADGE.textY + y) * ICON_SIZE + DEV_BADGE.textX + x] = DEV_BADGE.textIndex;
    });
  }

  const scale = size / ICON_SIZE;
  const rgba = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = grid[Math.floor(y / scale) * ICON_SIZE + Math.floor(x / scale)] ?? 0;
      const rgb = paletteRgb(idx) ?? [0, 0, 0];
      rgba.set([rgb[0], rgb[1], rgb[2], 255], (y * size + x) * 4);
    }
  }
  return encodePng(rgba, size, size);
}
