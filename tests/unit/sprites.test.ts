import { describe, expect, it } from 'vitest';
import { ALL_SPRITES } from '../../src/content/sprites/index.ts';
import { TILESETS } from '../../src/content/tilesets/scrapyard.ts';
import { ATLAS_WIDTH, renderFramePixels } from '../../src/render/atlas.ts';
import { packRects } from '../../src/render/pack.ts';
import { paletteRgb } from '../../src/render/palette.ts';
import { type SpriteDef, validateSprite } from '../../src/render/spriteTypes.ts';

describe('sprite content', () => {
  it('every sprite is valid', () => {
    for (const def of ALL_SPRITES) {
      expect(() => {
        validateSprite(def);
      }, def.id).not.toThrow();
    }
  });

  it('ids are unique', () => {
    const ids = ALL_SPRITES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Cyfil is 24x24 and tiles are 16x16', () => {
    const byId = new Map(ALL_SPRITES.map((s) => [s.id, s]));
    expect(byId.get('cyfil.idle')).toMatchObject({ w: 24, h: 24 });
    for (const id of ['tile.ground', 'tile.ground_top', 'tile.platform', 'tile.crate']) {
      expect(byId.get(id), id).toMatchObject({ w: 16, h: 16 });
    }
  });

  it('tilesets only reference sprites that exist', () => {
    const ids = new Set(ALL_SPRITES.map((s) => s.id));
    for (const ts of Object.values(TILESETS)) {
      for (const tile of Object.values(ts.tiles)) {
        if (tile.sprite) expect(ids.has(tile.sprite), tile.sprite).toBe(true);
      }
      expect(ids.has(ts.parallaxFar)).toBe(true);
      expect(ids.has(ts.parallaxNear)).toBe(true);
    }
  });

  it('all sprites fit the atlas width', () => {
    for (const def of ALL_SPRITES) expect(def.w).toBeLessThanOrEqual(ATLAS_WIDTH);
  });
});

describe('validateSprite', () => {
  const base: SpriteDef = { id: 'a.b', w: 2, h: 2, anchor: { x: 0, y: 0 }, fps: 0, frames: [['11', '11']] };

  it('accepts a good sprite', () => {
    expect(() => {
      validateSprite(base);
    }).not.toThrow();
  });

  it.each([
    ['bad id', { ...base, id: 'Bad Id' }],
    ['no frames', { ...base, frames: [] }],
    ['wrong row length', { ...base, frames: [['111', '11']] }],
    ['illegal char', { ...base, frames: [['1z', '11']] }],
    ['anchor outside', { ...base, anchor: { x: 5, y: 0 } }],
    ['bad variant index', { ...base, variants: { x: { 99: 1 } } }],
  ])('rejects %s', (_name, def) => {
    expect(() => {
      validateSprite(def);
    }).toThrow();
  });
});

describe('renderFramePixels', () => {
  const rows = ['1.', '.d'];

  it('maps palette indexes to RGBA, transparent stays alpha 0', () => {
    const px = renderFramePixels(rows, 2, 2, undefined, false);
    const outline = paletteRgb(1) ?? [0, 0, 0];
    expect([...px.slice(0, 4)]).toEqual([...outline, 255]);
    expect(px[7]).toBe(0);
  });

  it('flips horizontally', () => {
    const px = renderFramePixels(rows, 2, 2, undefined, true);
    expect(px[3]).toBe(0);
    expect(px[7]).toBe(255);
  });

  it('applies palette swaps', () => {
    const px = renderFramePixels(rows, 2, 2, { 1: 7 }, false);
    expect([...px.slice(0, 4)]).toEqual([255, 255, 255, 255]);
  });
});

describe('packRects', () => {
  it('places everything inside the atlas without overlap', () => {
    const sizes = [
      { w: 24, h: 24 },
      { w: 16, h: 16 },
      { w: 64, h: 192 },
      { w: 64, h: 128 },
      { w: 24, h: 24 },
      { w: 16, h: 16 },
      { w: 200, h: 8 },
      { w: 300, h: 40 },
    ];
    const { placed, height } = packRects(sizes, 512);
    sizes.forEach((s, i) => {
      const p = placed[i];
      expect(p).toBeDefined();
      if (!p) return;
      expect(p.x + s.w).toBeLessThanOrEqual(512);
      expect(p.y + s.h).toBeLessThanOrEqual(height);
      sizes.forEach((o, j) => {
        const q = placed[j];
        if (i >= j || !q) return;
        const overlap = p.x < q.x + o.w && q.x < p.x + s.w && p.y < q.y + o.h && q.y < p.y + s.h;
        expect(overlap, `${String(i)} vs ${String(j)}`).toBe(false);
      });
    });
  });

  it('rejects rects wider than the atlas', () => {
    expect(() => packRects([{ w: 600, h: 4 }], 512)).toThrow();
  });
});
