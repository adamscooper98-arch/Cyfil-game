import type { Rng } from '../core/rng.ts';
import type { Level } from '../game/level.ts';
import type { Input } from '../input/input.ts';
import type { Renderer } from '../render/renderer.ts';

export interface Scene {
  update(): void;
  render(): void;
}

/** What scenes get to use. Scenes never touch the DOM or canvas directly. */
export interface GameContext {
  readonly r: Renderer;
  readonly input: Input;
  readonly level: Level;
  readonly rng: Rng;
  readonly scenes: SceneManager;
  /** Ask the app to pause (shows the paused scene over the current one). */
  readonly pause: () => void;
}

export class SceneManager {
  current: Scene | null = null;

  switchTo(scene: Scene): void {
    this.current = scene;
  }

  update(): void {
    this.current?.update();
  }

  render(): void {
    this.current?.render();
  }
}
