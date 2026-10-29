import { packRects } from './pack.ts';
import { paletteRgb } from './palette.ts';
import { parseGrid } from './sprite.ts';
import { type SpriteDef, validateSprite } from './spriteTypes.ts';

export interface AtlasRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export const ATLAS_WIDTH = 512;

export function variantKey(variant: string | undefined, flip: boolean): string {
  return `${variant ?? ''}|${flip ? 'f' : ''}`;
}

/** RGBA pixels of one frame, with an optional palette swap and horizontal flip applied. Pure, so unit-testable. */
export function renderFramePixels(
  rows: readonly string[],
  w: number,
  h: number,
  swap: Readonly<Record<number, number>> | undefined,
  flip: boolean,
): Uint8ClampedArray<ArrayBuffer> {
  const grid = parseGrid(rows, w, h);
  const out = new Uint8ClampedArray(new ArrayBuffer(w * h * 4));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcX = flip ? w - 1 - x : x;
      const raw = grid[y * w + srcX] ?? 0;
      const idx = swap?.[raw] ?? raw;
      const rgb = paletteRgb(idx);
      if (rgb) out.set([rgb[0], rgb[1], rgb[2], 255], (y * w + x) * 4);
    }
  }
  return out;
}

export interface Atlas {
  readonly canvas: HTMLCanvasElement;
  readonly defs: ReadonlyMap<string, SpriteDef>;
  /** `${id}` -> variantKey -> per-frame source rects. */
  readonly rects: ReadonlyMap<string, ReadonlyMap<string, readonly AtlasRect[]>>;
}

interface Job {
  def: SpriteDef;
  key: string;
  variant: string | undefined;
  flip: boolean;
  frame: number;
}

/** Draws every sprite frame (base, flipped, and each palette variant, also flipped) into one offscreen canvas. */
export function buildAtlas(defs: readonly SpriteDef[]): Atlas {
  const byId = new Map<string, SpriteDef>();
  for (const def of defs) {
    validateSprite(def);
    if (byId.has(def.id)) throw new Error(`Duplicate sprite id "${def.id}"`);
    byId.set(def.id, def);
  }

  const jobs: Job[] = [];
  for (const def of defs) {
    const variants: (string | undefined)[] = [undefined, ...Object.keys(def.variants ?? {})];
    for (const variant of variants) {
      for (const flip of [false, true]) {
        def.frames.forEach((_, frame) => {
          jobs.push({ def, key: variantKey(variant, flip), variant, flip, frame });
        });
      }
    }
  }

  const { placed, height } = packRects(
    jobs.map((j) => ({ w: j.def.w, h: j.def.h })),
    ATLAS_WIDTH,
  );

  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_WIDTH;
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable for atlas');

  const rects = new Map<string, Map<string, AtlasRect[]>>();
  jobs.forEach((job, i) => {
    const pos = placed[i];
    const rows = job.def.frames[job.frame];
    if (!pos || !rows) throw new Error('atlas job out of range');
    const swap = job.variant === undefined ? undefined : job.def.variants?.[job.variant];
    const pixels = renderFramePixels(rows, job.def.w, job.def.h, swap, job.flip);
    ctx.putImageData(new ImageData(pixels, job.def.w, job.def.h), pos.x, pos.y);

    let perKey = rects.get(job.def.id);
    if (!perKey) rects.set(job.def.id, (perKey = new Map<string, AtlasRect[]>()));
    let frames = perKey.get(job.key);
    if (!frames) perKey.set(job.key, (frames = []));
    frames[job.frame] = { x: pos.x, y: pos.y, w: job.def.w, h: job.def.h };
  });

  return { canvas, defs: byId, rects };
}
