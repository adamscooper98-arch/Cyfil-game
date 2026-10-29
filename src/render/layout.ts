import { SCREEN_H, SCREEN_W } from '../config.ts';

/**
 * Largest whole-number scale (in device pixels) at which the game fits the viewport.
 * Integer scaling keeps pixels uniform and crisp. Never below 1.
 */
export function computeScale(viewportCssW: number, viewportCssH: number, dpr: number): number {
  const w = Math.floor((viewportCssW * dpr) / SCREEN_W);
  const h = Math.floor((viewportCssH * dpr) / SCREEN_H);
  return Math.max(1, Math.min(w, h));
}

/** CSS size for the canvas at a device-pixel scale. */
export function cssSize(scale: number, dpr: number): { w: number; h: number } {
  return { w: (SCREEN_W * scale) / dpr, h: (SCREEN_H * scale) / dpr };
}

/** Sizes the canvas and publishes where it sits (--game-left/right/bottom) so the touch-control zones can hug it. */
export function applyLayout(canvas: HTMLCanvasElement): void {
  const vv = window.visualViewport;
  const vw = vv?.width ?? window.innerWidth;
  const vh = vv?.height ?? window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  const { w, h } = cssSize(computeScale(vw, vh, dpr), dpr);
  canvas.style.width = `${String(w)}px`;
  canvas.style.height = `${String(h)}px`;

  const rect = canvas.getBoundingClientRect();
  const root = document.documentElement.style;
  root.setProperty('--game-left', `${String(Math.max(0, rect.left))}px`);
  root.setProperty('--game-right', `${String(Math.max(0, window.innerWidth - rect.right))}px`);
  root.setProperty('--game-bottom', `${String(rect.bottom)}px`);
}

/**
 * Re-layout on resize/rotation. iOS fires these late and inconsistently, so re-check shortly after.
 * `onChange` runs on every viewport change (used to release held touches so rotation never leaves a stuck input).
 */
export function watchLayout(canvas: HTMLCanvasElement, onChange?: () => void): void {
  const run = (): void => {
    applyLayout(canvas);
  };
  const changed = (): void => {
    onChange?.();
    run();
    window.setTimeout(run, 300);
  };
  window.addEventListener('resize', changed);
  window.addEventListener('orientationchange', changed);
  window.visualViewport?.addEventListener('resize', run);
  run();
}
