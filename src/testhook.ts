import type { App, SceneName } from './app.ts';

/** Present only in test builds (checked by scripts/check-prod-bundle.ts). Lets Playwright drive the game deterministically. */
export const TEST_HOOK_MARKER = 'CYFIL_TEST_HOOK_MARKER';

export interface CyfilTestApi {
  marker: string;
  goto(name: SceneName): void;
  /** Hold these keys (e.g. ['ArrowRight']) until changed. */
  hold(codes: string[]): void;
  press(code: string): void;
  /** Run n fixed updates, then draw one frame. */
  advance(ticks: number): void;
  /** Current 256x192 frame as RGBA bytes. */
  pixels(): number[];
}

declare global {
  interface Window {
    __cyfil?: CyfilTestApi;
  }
}

export function installTestHook(app: App): void {
  window.__cyfil = {
    marker: TEST_HOOK_MARKER,
    goto: (name) => {
      app.goto(name);
      app.render();
    },
    hold: (codes) => {
      app.input.setHeld(codes);
    },
    press: (code) => {
      app.input.pressOnce(code);
    },
    advance: (ticks) => {
      for (let i = 0; i < ticks; i++) app.step();
      app.render();
    },
    pixels: () => Array.from(app.renderer.ctx.getImageData(0, 0, 256, 192).data),
  };
}
