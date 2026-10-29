import type { Tileset } from '../content/tilesets/scrapyard.ts';
import { TILESETS } from '../content/tilesets/scrapyard.ts';

export const TILE = 16;

export type AbilityId = 'wrench' | 'spark';
const ABILITIES: readonly string[] = ['wrench', 'spark'];

export type LevelEntity =
  | { readonly type: 'playerStart' | 'goal' | 'checkpoint' | 'toastbot' | 'fanfly'; readonly x: number; readonly y: number }
  | { readonly type: 'abilityPickup'; readonly x: number; readonly y: number; readonly ability: AbilityId };

export interface Level {
  readonly id: string;
  readonly name: string;
  readonly tileset: Tileset;
  readonly width: number;
  readonly height: number;
  readonly legend: ReadonlyMap<string, string>;
  readonly tiles: readonly string[];
  readonly entities: readonly LevelEntity[];
  readonly start: { readonly x: number; readonly y: number };
}

const SIMPLE_ENTITIES = ['playerStart', 'goal', 'checkpoint', 'toastbot', 'fanfly'] as const;
const MAX_ENTITIES = 1000;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function fail(msg: string): never {
  throw new Error(`Invalid level: ${msg}`);
}

function onlyKeys(obj: Record<string, unknown>, allowed: readonly string[], where: string): void {
  for (const k of Object.keys(obj)) if (!allowed.includes(k)) fail(`${where}: unknown key "${k}"`);
}

function intIn(v: unknown, lo: number, hi: number, where: string): number {
  if (typeof v !== 'number' || !Number.isInteger(v) || v < lo || v > hi) fail(`${where} must be an integer in ${String(lo)}..${String(hi)}`);
  return v;
}

function str(v: unknown, re: RegExp, where: string): string {
  if (typeof v !== 'string' || !re.test(v)) fail(`${where} is not valid`);
  return v;
}

/** Validates untrusted-shaped data (level files are ours, but a typo should fail loudly, not draw garbage). */
export function parseLevel(raw: unknown): Level {
  if (!isRecord(raw)) fail('not an object');
  onlyKeys(raw, ['format', 'id', 'name', 'tileset', 'width', 'height', 'legend', 'tiles', 'entities'], 'level');
  if (raw.format !== 1) fail('format must be 1');

  const id = str(raw.id, /^[a-z0-9-]{1,40}$/, 'id');
  const name = str(raw.name, /^.{1,60}$/, 'name');
  const tilesetId = str(raw.tileset, /^[a-z0-9_-]{1,40}$/, 'tileset');
  if (!Object.hasOwn(TILESETS, tilesetId)) fail(`unknown tileset "${tilesetId}"`);
  const tileset = TILESETS[tilesetId];
  if (!tileset) fail(`unknown tileset "${tilesetId}"`);

  const width = intIn(raw.width, 1, 2048, 'width');
  const height = intIn(raw.height, 1, 256, 'height');

  const rawLegend = raw.legend;
  if (!isRecord(rawLegend)) fail('legend must be an object');
  const legend = new Map<string, string>();
  for (const [ch, tileName] of Object.entries(rawLegend)) {
    if (ch.length !== 1) fail(`legend key "${ch}" must be one character`);
    if (typeof tileName !== 'string' || !Object.hasOwn(tileset.tiles, tileName)) {
      fail(`legend "${ch}" -> unknown tile "${String(tileName)}"`);
    }
    legend.set(ch, tileName);
  }

  const rawTiles = raw.tiles;
  if (!Array.isArray(rawTiles) || rawTiles.length !== height) fail(`tiles must have ${String(height)} rows`);
  const tiles: string[] = [];
  (rawTiles as unknown[]).forEach((row, y) => {
    if (typeof row !== 'string' || row.length !== width) fail(`tiles row ${String(y)} must be a string of length ${String(width)}`);
    for (const ch of row) if (!legend.has(ch)) fail(`tiles row ${String(y)}: character "${ch}" not in legend`);
    tiles.push(row);
  });

  const rawEntities = raw.entities;
  if (!Array.isArray(rawEntities) || rawEntities.length > MAX_ENTITIES) fail('entities must be an array (max 1000)');
  const entities: LevelEntity[] = [];
  (rawEntities as unknown[]).forEach((e, i) => {
    const where = `entities[${String(i)}]`;
    if (!isRecord(e)) fail(`${where} must be an object`);
    const type = e.type;
    const x = intIn(e.x, 0, width - 1, `${where}.x`);
    const y = intIn(e.y, 0, height - 1, `${where}.y`);
    if (type === 'abilityPickup') {
      onlyKeys(e, ['type', 'x', 'y', 'ability'], where);
      const ability = e.ability;
      if (typeof ability !== 'string' || !ABILITIES.includes(ability)) fail(`${where}.ability is not valid`);
      entities.push({ type, x, y, ability: ability as AbilityId });
    } else if (typeof type === 'string' && (SIMPLE_ENTITIES as readonly string[]).includes(type)) {
      onlyKeys(e, ['type', 'x', 'y'], where);
      entities.push({ type: type as (typeof SIMPLE_ENTITIES)[number], x, y });
    } else {
      fail(`${where}.type is not a known entity`);
    }
  });

  const starts = entities.filter((e) => e.type === 'playerStart');
  if (starts.length !== 1) fail('exactly one playerStart is required');
  if (entities.filter((e) => e.type === 'goal').length !== 1) fail('exactly one goal is required');
  const start = starts[0];
  if (!start) fail('exactly one playerStart is required');

  return { id, name, tileset, width, height, legend, tiles, entities, start: { x: start.x, y: start.y } };
}

/** Tile name at tile coordinates; out-of-bounds counts as empty. */
export function tileNameAt(level: Level, tx: number, ty: number): string {
  const ch = level.tiles[ty]?.charAt(tx);
  if (ch === undefined || ch === '') return 'empty';
  return level.legend.get(ch) ?? 'empty';
}
