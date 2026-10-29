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

export function applyLayout(canvas: HTMLCanvasElement): void {
  const vv = window.visualViewport;
  const vw = vv?.width ?? window.innerWidth;
  const vh = vv?.height ?? window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  const { w, h } = cssSize(computeScale(vw, vh, dpr), dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
}

/** iOS fires resize/orientationchange late and inconsistently, so re-check shortly after. */
export function watchLayout(canvas: HTMLCanvasElement): void {
  const run = (): void => {
    applyLayout(canvas);
  };
  const runSoonAfter = (): void => {
    run();
    window.setTimeout(run, 300);
  };
  window.addEventListener('resize', runSoonAfter);
  window.addEventListener('orientationchange', runSoonAfter);
  window.visualViewport?.addEventListener('resize', run);
  run();
}
