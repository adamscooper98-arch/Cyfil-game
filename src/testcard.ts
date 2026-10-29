import { GAME_NAME, SCREEN_H, SCREEN_W } from './config.ts';
import { ICON_GRID, ICON_SIZE } from './content/sprites/icon.ts';
import { PALETTE, paletteRgb } from './render/palette.ts';
import { parseGrid } from './render/sprite.ts';
import { forEachTextPixel, textWidth } from './render/tinyfont.ts';

const UPDATE_TEST_LABEL = 'TEST A';

const COLS = 8;
const CELL_W = 30;
const CELL_H = 24;
const ORIGIN_X = 8;
const ORIGIN_Y = 64;

/** Pixel rectangle of palette swatch `index` on the test card. */
export function swatchRect(index: number): { x: number; y: number; w: number; h: number } {
  return {
    x: ORIGIN_X + (index % COLS) * CELL_W,
    y: ORIGIN_Y + Math.floor(index / COLS) * CELL_H,
    w: CELL_W - 2,
    h: CELL_H - 2,
  };
}

function fill(ctx: CanvasRenderingContext2D, index: number, x: number, y: number, w: number, h: number): void {
  const rgb = paletteRgb(index);
  if (!rgb) return;
  ctx.fillStyle = `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
  ctx.fillRect(x, y, w, h);
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, index: number): void {
  forEachTextPixel(text, (px, py) => {
    fill(ctx, index, x + px, y + py, 1, 1);
  });
}

/** M0 placeholder screen: the palette test card, the icon sprite, and the game name. */
export function drawTestCard(ctx: CanvasRenderingContext2D): void {
  fill(ctx, 2, 0, 0, SCREEN_W, SCREEN_H);

  const icon = parseGrid(ICON_GRID, ICON_SIZE, ICON_SIZE);
  icon.forEach((idx, i) => {
    fill(ctx, idx, 8 + (i % ICON_SIZE), 8 + Math.floor(i / ICON_SIZE), 1, 1);
  });

  const name = GAME_NAME.toUpperCase();
  drawText(ctx, name, 32, 12, 13);
  drawText(ctx, 'PALETTE TEST', 32, 22, 29);

  // TEMPORARY (update-flow test): big label. Revert this block and UPDATE_TEST_LABEL after testing.
  forEachTextPixel(UPDATE_TEST_LABEL, (px, py) => {
    fill(ctx, 31, 32 + px * 3, 33 + py * 3, 3, 3);
  });

  PALETTE.forEach((_, i) => {
    const r = swatchRect(i);
    if (i === 0) {
      // transparent: checkerboard
      for (let y = 0; y < r.h; y += 4) {
        for (let x = 0; x < r.w; x += 4) fill(ctx, (x + y) % 8 === 0 ? 29 : 28, r.x + x, r.y + y, 4, 4);
      }
    } else {
      fill(ctx, i, r.x, r.y, r.w, r.h);
    }
  });

  const footer = `${String(SCREEN_W)}X${String(SCREEN_H)}`;
  drawText(ctx, footer, SCREEN_W - textWidth(footer) - 8, SCREEN_H - 12, 29);
}
