import { SCREEN_H, SCREEN_W } from '../config.ts';

/** Horizontal/vertical scroll position in pixels. Drawing uses whole pixels only (see `px`/`py`). */
export class Camera {
  x = 0;
  y = 0;

  /** Center on a world point, clamped so the view never leaves the level. */
  follow(targetX: number, targetY: number, levelW: number, levelH: number): void {
    this.x = clamp(targetX - SCREEN_W / 2, 0, Math.max(0, levelW - SCREEN_W));
    this.y = clamp(targetY - SCREEN_H / 2, 0, Math.max(0, levelH - SCREEN_H));
  }

  get px(): number {
    return Math.round(this.x);
  }

  get py(): number {
    return Math.round(this.y);
  }
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}
