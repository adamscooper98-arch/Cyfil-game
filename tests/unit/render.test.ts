import { describe, expect, it } from 'vitest';
import { SCREEN_H, SCREEN_W } from '../../src/config.ts';
import { ICON_GRID, ICON_SIZE } from '../../src/content/sprites/icon.ts';
import { computeScale, cssSize } from '../../src/render/layout.ts';
import { PALETTE, PALETTE_SIZE, paletteRgb } from '../../src/render/palette.ts';
import { charToIndex, parseGrid } from '../../src/render/sprite.ts';
import { GLYPH_H, GLYPH_W, forEachTextPixel, glyphKeys, glyphSource, textWidth } from '../../src/render/tinyfont.ts';

describe('palette', () => {
  it('has exactly 32 entries with index 0 transparent', () => {
    expect(PALETTE).toHaveLength(PALETTE_SIZE);
    expect(PALETTE[0]).toBeNull();
  });

  it('has valid, unique hex colors', () => {
    const colors = PALETTE.slice(1) as string[];
    for (const c of colors) expect(c).toMatch(/^#[0-9a-f]{6}$/);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('converts to rgb', () => {
    expect(paletteRgb(0)).toBeNull();
    expect(paletteRgb(7)).toEqual([255, 255, 255]);
  });
});

describe('sprite grid parsing', () => {
  it('maps characters to palette indexes', () => {
    expect(charToIndex('.')).toBe(0);
    expect(charToIndex('9')).toBe(9);
    expect(charToIndex('a')).toBe(10);
    expect(charToIndex('v')).toBe(31);
  });

  it.each(['w', 'Z', '#', '', 'ab'])('rejects illegal character %j', (ch) => {
    expect(() => charToIndex(ch)).toThrow();
  });

  it('rejects wrong dimensions', () => {
    expect(() => parseGrid(['..', '..'], 3, 2)).toThrow(/row 0/);
    expect(() => parseGrid(['..'], 2, 2)).toThrow(/rows/);
  });

  it('parses the app icon', () => {
    const px = parseGrid(ICON_GRID, ICON_SIZE, ICON_SIZE);
    expect(px).toHaveLength(ICON_SIZE * ICON_SIZE);
    expect(px.every((i) => i < PALETTE_SIZE)).toBe(true);
    // the icon is opaque (it becomes the iOS home-screen icon)
    expect(px.includes(0)).toBe(false);
  });
});

describe('tiny font', () => {
  it('every glyph is 5 rows of 3 chars', () => {
    for (const key of glyphKeys()) {
      const rows = glyphSource(key)?.split('/') ?? [];
      expect(rows, key).toHaveLength(GLYPH_H);
      for (const row of rows) expect(row, key).toMatch(new RegExp(`^[X.]{${String(GLYPH_W)}}$`));
    }
  });

  it('covers A-Z and 0-9', () => {
    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') expect(glyphKeys()).toContain(ch);
  });

  it('measures and plots text', () => {
    expect(textWidth('')).toBe(0);
    expect(textWidth('AB')).toBe(7);
    const pts: string[] = [];
    forEachTextPixel('I', (x, y) => pts.push(`${String(x)},${String(y)}`));
    expect(pts).toContain('0,0');
    expect(pts).toContain('1,2');
  });
});

describe('layout', () => {
  it('picks the largest integer device-pixel scale that fits', () => {
    // iPhone-ish portrait: 390x844 css @3x -> 1170 device px wide -> 4x (1024)
    expect(computeScale(390, 844, 3)).toBe(4);
    // landscape 844x390 @3x -> height-limited: 1170/192 = 6
    expect(computeScale(844, 390, 3)).toBe(6);
  });

  it('never goes below 1 and yields whole device pixels', () => {
    expect(computeScale(10, 10, 1)).toBe(1);
    const { w, h } = cssSize(4, 3);
    expect(w * 3).toBe(SCREEN_W * 4);
    expect(h * 3).toBe(SCREEN_H * 4);
  });
});
