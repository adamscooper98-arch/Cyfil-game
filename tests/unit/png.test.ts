import { describe, expect, it } from 'vitest';
import { renderIcon } from '../../scripts/icons.ts';
import { encodePng } from '../../scripts/png.ts';

describe('png encoder', () => {
  it('writes a valid PNG header and dimensions', () => {
    const png = encodePng(new Uint8Array(2 * 3 * 4), 2, 3);
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(png.readUInt32BE(16)).toBe(2);
    expect(png.readUInt32BE(20)).toBe(3);
  });

  it('rejects mismatched buffers', () => {
    expect(() => encodePng(new Uint8Array(3), 1, 1)).toThrow();
  });
});

describe('icons', () => {
  it('renders sizes that are multiples of the grid', () => {
    expect(renderIcon(192, false).readUInt32BE(16)).toBe(192);
    expect(renderIcon(512, true).readUInt32BE(16)).toBe(512);
  });

  it('dev badge changes the image', () => {
    expect(renderIcon(192, true).equals(renderIcon(192, false))).toBe(false);
  });

  it('rejects non-multiples', () => {
    expect(() => renderIcon(180, false)).toThrow();
  });
});
