import type { App, SceneName } from './app.ts';
import type { ReplayRuns } from './core/replay.ts';

/** Present only in test builds (checked by scripts/check-prod-bundle.ts). Lets Playwright drive the game deterministically. */
export const TEST_HOOK_MARKER = 'CYFIL_TEST_HOOK_MARKER';

export interface CyfilTestApi {
  marker: string;
  goto(name: SceneName, level?: string): void;
  /** Hold these keys (e.g. ['ArrowRight']) until changed. */
  hold(codes: string[]): void;
  press(code: string): void;
  /** Run n fixed updates (from keyboard, touch controls, or an active replay), then draw one frame. */
  advance(ticks: number): void;
  /** Bitmask of buttons held on the last update (see src/input/inputState.ts). */
  held(): number;
  /** Feed these input runs ([mask, count] pairs) instead of live input. */
  play(runs: ReplayRuns): void;
  /** Current 256x192 frame as RGBA bytes. */
  pixels(): number[];
  /** Player state of the scene being played, or null. */
  player(): { x: number; y: number; vx: number; vy: number; onGround: boolean; reachedGoal: boolean } | null;
}

declare global {
  interface Window {
    __cyfil?: CyfilTestApi;
  }
}

export function installTestHook(app: App): void {
  window.__cyfil = {
    marker: TEST_HOOK_MARKER,
    goto: (name, level) => {
      if (level === undefined) app.goto(name);
      else app.goto(name, level);
      app.render();
    },
    hold: (codes) => {
      app.keyboard.setHeld(codes);
    },
    press: (code) => {
      app.keyboard.pressOnce(code);
    },
    advance: (ticks) => {
      for (let i = 0; i < ticks; i++) app.step();
      app.render();
    },
    held: () => app.inputState.held,
    play: (runs) => {
      app.playReplay(runs);
    },
    pixels: () => Array.from(app.renderer.ctx.getImageData(0, 0, 256, 192).data),
    player: () => app.playerState(),
  };
}
