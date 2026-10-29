import { PALETTE_SIZE } from './palette.ts';
import { parseGrid } from './sprite.ts';

/**
 * A sprite is data: palette-index grids (see sprite.ts for the character set), never colors.
 * Changing the palette recolors every sprite; changing a grid changes the art. Neither touches engine code.
 */
export interface SpriteDef {
  readonly id: string;
  readonly w: number;
  readonly h: number;
  /** Pixel inside the sprite that sits at the entity's position (e.g. the feet). */
  readonly anchor: { readonly x: number; readonly y: number };
  /** Animation speed in frames per second. 0 or a single frame means static. */
  readonly fps: number;
  readonly frames: readonly (readonly string[])[];
  /** Named palette swaps: source palette index -> replacement index. Baked into the atlas at boot. */
  readonly variants?: Readonly<Record<string, Readonly<Record<number, number>>>>;
}

/** Throws with a precise message if the definition is malformed. Run at boot and in unit tests. */
export function validateSprite(def: SpriteDef): void {
  const where = `sprite "${def.id}"`;
  if (!/^[a-z0-9_.]+$/.test(def.id)) throw new Error(`${where}: id must match [a-z0-9_.]+`);
  if (!Number.isInteger(def.w) || !Number.isInteger(def.h) || def.w < 1 || def.h < 1) {
    throw new Error(`${where}: bad size ${String(def.w)}x${String(def.h)}`);
  }
  if (def.frames.length === 0) throw new Error(`${where}: no frames`);
  if (def.anchor.x < 0 || def.anchor.x > def.w || def.anchor.y < 0 || def.anchor.y > def.h) {
    throw new Error(`${where}: anchor outside sprite`);
  }
  def.frames.forEach((rows, i) => {
    try {
      parseGrid(rows, def.w, def.h);
    } catch (err) {
      throw new Error(`${where} frame ${String(i)}: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
    }
  });
  for (const [name, map] of Object.entries(def.variants ?? {})) {
    for (const [from, to] of Object.entries(map)) {
      const f = Number(from);
      if (!Number.isInteger(f) || f < 0 || f >= PALETTE_SIZE || !Number.isInteger(to) || to < 0 || to >= PALETTE_SIZE) {
        throw new Error(`${where} variant "${name}": bad palette swap ${from} -> ${String(to)}`);
      }
    }
  }
}
