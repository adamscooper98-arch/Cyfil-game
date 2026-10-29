import type { Atlas } from '../render/atlas.ts';
import { PALETTE, PALETTE_SIZE, paletteCss } from '../render/palette.ts';
import { forEachTextPixel } from '../render/tinyfont.ts';

const CELL = 24;
const COLS = 8;

function paletteCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = COLS * CELL;
  c.height = Math.ceil(PALETTE_SIZE / COLS) * CELL;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  PALETTE.forEach((hex, i) => {
    const x = (i % COLS) * CELL;
    const y = Math.floor(i / COLS) * CELL;
    ctx.fillStyle = hex ? paletteCss(i) : '#555';
    ctx.fillRect(x, y, CELL - 1, CELL - 1);
    // index label: black text on light swatches, white on dark
    const light = hex !== null && parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16) > 380;
    ctx.fillStyle = light ? '#000' : '#fff';
    forEachTextPixel(String(i), (px, py) => {
      ctx.fillRect(x + 2 + px, y + 2 + py, 1, 1);
    });
  });
  return c;
}

/** Palette with indexes, the baked atlas, and a list of every sprite with its variants. For judging art on a phone. */
export function createSpriteViewer(atlas: Atlas): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'dev-ui dev-panel';
  panel.hidden = true;

  const bar = document.createElement('div');
  bar.className = 'dev-panel-bar';
  bar.textContent = 'Sprites';

  const body = document.createElement('div');
  body.className = 'dev-panel-body';

  const heading = (text: string): HTMLElement => {
    const h = document.createElement('div');
    h.className = 'dev-heading';
    h.textContent = text;
    return h;
  };

  const pal = paletteCanvas();
  pal.className = 'dev-pixel';
  const copy = document.createElement('canvas');
  copy.width = atlas.canvas.width;
  copy.height = atlas.canvas.height;
  copy.className = 'dev-pixel dev-atlas';
  copy.getContext('2d')?.drawImage(atlas.canvas, 0, 0);

  const list = document.createElement('div');
  for (const def of atlas.defs.values()) {
    const row = document.createElement('div');
    const variants = Object.keys(def.variants ?? {});
    row.textContent = `${def.id}  ${String(def.w)}x${String(def.h)}  ${String(def.frames.length)}f @${String(def.fps)}fps${
      variants.length ? `  [${variants.join(', ')}]` : ''
    }`;
    list.append(row);
  }

  body.append(heading('Palette (index on swatch)'), pal, heading('Atlas'), copy, heading('Sprites'), list);
  panel.append(bar, body);
  return panel;
}
