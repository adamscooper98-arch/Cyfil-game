import { describe, expect, it } from 'vitest';
import testLevel from '../../src/content/levels/test-level.json';
import { parseLevel, tileNameAt } from '../../src/game/level.ts';
import { Camera, clamp } from '../../src/render/camera.ts';

type Raw = Record<string, unknown>;
const good = (): Raw => structuredClone(testLevel);
const entities = (l: Raw): unknown[] => l.entities as unknown[];
const legend = (l: Raw): Record<string, string> => l.legend as Record<string, string>;
const tiles = (l: Raw): string[] => l.tiles as string[];

describe('parseLevel', () => {
  it('accepts the test level', () => {
    const level = parseLevel(testLevel);
    expect(level.width).toBe(64);
    expect(level.height).toBe(12);
    expect(level.start).toEqual({ x: 2, y: 8 });
    expect(tileNameAt(level, 0, 9)).toBe('ground_top');
    expect(tileNameAt(level, 0, 10)).toBe('ground');
    expect(tileNameAt(level, 21, 9)).toBe('empty');
  });

  it('treats out-of-bounds tiles as empty', () => {
    const level = parseLevel(testLevel);
    expect(tileNameAt(level, -1, 0)).toBe('empty');
    expect(tileNameAt(level, 0, 99)).toBe('empty');
    expect(tileNameAt(level, 999, 0)).toBe('empty');
  });

  const cases: [string, (l: Raw) => void][] = [
    ['wrong format', (l) => (l.format = 2)],
    ['unknown top-level key', (l) => (l.extra = 1)],
    ['bad id', (l) => (l.id = 'Bad ID!')],
    ['unknown tileset', (l) => (l.tileset = 'nope')],
    ['prototype tileset name', (l) => (l.tileset = 'constructor')],
    ['zero width', (l) => (l.width = 0)],
    ['non-integer height', (l) => (l.height = 12.5)],
    ['row count mismatch', (l) => tiles(l).pop()],
    ['row length mismatch', (l) => (tiles(l)[0] = '.')],
    ['char not in legend', (l) => (tiles(l)[0] = `Z${'.'.repeat(63)}`)],
    ['legend maps to unknown tile', (l) => (legend(l).x = 'lava')],
    ['legend maps to prototype name', (l) => (legend(l).x = 'toString')],
    ['legend key longer than 1 char', (l) => (legend(l).ab = 'empty')],
    ['entities not an array', (l) => (l.entities = {})],
    ['unknown entity type', (l) => entities(l).push({ type: 'dragon', x: 1, y: 1 })],
    ['entity out of bounds', (l) => entities(l).push({ type: 'checkpoint', x: 64, y: 1 })],
    ['entity with extra key', (l) => entities(l).push({ type: 'checkpoint', x: 1, y: 1, hp: 5 })],
    ['bad ability', (l) => entities(l).push({ type: 'abilityPickup', x: 1, y: 1, ability: 'laser' })],
    ['missing playerStart', (l) => (l.entities = (l.entities as { type: string }[]).filter((e) => e.type !== 'playerStart'))],
    ['two goals', (l) => entities(l).push({ type: 'goal', x: 3, y: 3 })],
    ['too many entities', (l) => (l.entities = Array.from({ length: 1001 }, () => ({ type: 'checkpoint', x: 1, y: 1 })))],
  ];

  it.each(cases)('rejects: %s', (_name, mutate) => {
    const l = good();
    mutate(l);
    expect(() => parseLevel(l)).toThrow(/Invalid level/);
  });

  it.each([null, 5, 'str', [], undefined])('rejects non-object input %j', (v) => {
    expect(() => parseLevel(v)).toThrow(/Invalid level/);
  });

  it('accepts a valid ability pickup', () => {
    const l = good();
    entities(l).push({ type: 'abilityPickup', x: 6, y: 8, ability: 'wrench' });
    expect(parseLevel(l).entities.some((e) => e.type === 'abilityPickup')).toBe(true);
  });
});

describe('Camera', () => {
  it('centers on the target and clamps to the level', () => {
    const cam = new Camera();
    cam.follow(500, 96, 1024, 192);
    expect(cam.x).toBe(372);
    expect(cam.y).toBe(0);
    cam.follow(0, 0, 1024, 192);
    expect(cam.x).toBe(0);
    cam.follow(5000, 0, 1024, 192);
    expect(cam.x).toBe(1024 - 256);
  });

  it('does not scroll when the level is smaller than the screen', () => {
    const cam = new Camera();
    cam.follow(50, 50, 100, 100);
    expect([cam.x, cam.y]).toEqual([0, 0]);
  });

  it('rounds to whole pixels for drawing', () => {
    const cam = new Camera();
    cam.x = 10.6;
    expect(cam.px).toBe(11);
  });

  it('clamp', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
  });
});
