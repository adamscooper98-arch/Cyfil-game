import { SCREEN_H, SCREEN_W } from '../config.ts';
import { type Atlas, variantKey } from './atlas.ts';
import { paletteCss } from './palette.ts';
import { forEachTextPixel } from './tinyfont.ts';

export interface DrawOpts {
  readonly flip?: boolean | undefined;
  readonly variant?: string | undefined;
}

/** Frame index for an animation `tick` ticks in (60 ticks per second). */
export function frameAt(frameCount: number, fps: number, tick: number): number {
  if (frameCount <= 1 || fps <= 0) return 0;
  return Math.floor((tick * fps) / 60) % frameCount;
}

/** All drawing goes through here, at internal resolution and integer coordinates only. */
export class Renderer {
  private readonly ditherMasks = new Map<number, HTMLCanvasElement>();

  constructor(
    readonly ctx: CanvasRenderingContext2D,
    readonly atlas: Atlas,
  ) {
    ctx.imageSmoothingEnabled = false;
  }

  fillRect(colorIndex: number, x: number, y: number, w: number, h: number): void {
    this.ctx.fillStyle = paletteCss(colorIndex);
    this.ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  clear(colorIndex: number): void {
    this.fillRect(colorIndex, 0, 0, SCREEN_W, SCREEN_H);
  }

  /** Draw one frame of a sprite so its anchor lands on (x, y). */
  drawSprite(id: string, frame: number, x: number, y: number, opts: DrawOpts = {}): void {
    const def = this.atlas.defs.get(id);
    const rect = this.atlas.rects.get(id)?.get(variantKey(opts.variant, opts.flip === true))?.[frame];
    if (!def || !rect) {
      throw new Error(`Unknown sprite/frame/variant: ${id} #${String(frame)} ${opts.variant ?? ''}`);
    }
    const ax = opts.flip === true ? def.w - def.anchor.x : def.anchor.x;
    this.ctx.drawImage(
      this.atlas.canvas,
      rect.x,
      rect.y,
      rect.w,
      rect.h,
      Math.round(x - ax),
      Math.round(y - def.anchor.y),
      rect.w,
      rect.h,
    );
  }

  /** Draw the animation frame for `tick`. */
  drawAnimated(id: string, tick: number, x: number, y: number, opts: DrawOpts = {}): void {
    const def = this.atlas.defs.get(id);
    if (!def) throw new Error(`Unknown sprite: ${id}`);
    this.drawSprite(id, frameAt(def.frames.length, def.fps, tick), x, y, opts);
  }

  /** 3x5 pixel text, each font pixel drawn as a scale x scale block. */
  drawText(text: string, x: number, y: number, colorIndex: number, scale = 1): void {
    this.ctx.fillStyle = paletteCss(colorIndex);
    forEachTextPixel(text, (px, py) => {
      this.ctx.fillRect(Math.round(x) + px * scale, Math.round(y) + py * scale, scale, scale);
    });
  }

  /** Checkerboard overlay in a palette color: dims the screen without leaving the palette. */
  dither(colorIndex: number): void {
    let mask = this.ditherMasks.get(colorIndex);
    if (!mask) {
      mask = document.createElement('canvas');
      mask.width = SCREEN_W;
      mask.height = SCREEN_H;
      const mctx = mask.getContext('2d');
      if (!mctx) throw new Error('2D canvas unavailable');
      mctx.fillStyle = paletteCss(colorIndex);
      for (let y = 0; y < SCREEN_H; y++) {
        for (let x = (y % 2); x < SCREEN_W; x += 2) mctx.fillRect(x, y, 1, 1);
      }
      this.ditherMasks.set(colorIndex, mask);
    }
    this.ctx.drawImage(mask, 0, 0);
  }
}
