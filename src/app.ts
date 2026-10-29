import testLevelJson from './content/levels/test-level.json';
import { ALL_SPRITES } from './content/sprites/index.ts';
import { FixedLoop } from './core/loop.ts';
import { recordFrame } from './core/perf.ts';
import { Rng } from './core/rng.ts';
import { parseLevel } from './game/level.ts';
import { Input } from './input/input.ts';
import { buildAtlas } from './render/atlas.ts';
import { Renderer } from './render/renderer.ts';
import { PausedScene } from './scenes/paused.ts';
import { PlayingScene } from './scenes/playing.ts';
import { type GameContext, SceneManager } from './scenes/scene.ts';
import { TestCardScene } from './scenes/testcard.ts';
import { TitleScene } from './scenes/title.ts';

export type SceneName = 'title' | 'playing' | 'testcard';

/** Owns the game objects and the frame loop. The DOM-facing bits (canvas, events) are wired in main.ts. */
export class App {
  readonly atlas;
  readonly renderer: Renderer;
  readonly input: Input;
  readonly scenes = new SceneManager();
  readonly ctx: GameContext;
  private readonly loop: FixedLoop;
  private lastFrame = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement, context2d: CanvasRenderingContext2D) {
    this.atlas = buildAtlas(ALL_SPRITES);
    this.renderer = new Renderer(context2d, this.atlas);
    this.input = new Input(canvas);
    this.ctx = {
      r: this.renderer,
      input: this.input,
      level: parseLevel(testLevelJson),
      rng: new Rng(1),
      scenes: this.scenes,
      pause: () => {
        this.pause();
      },
    };
    this.loop = new FixedLoop(() => {
      this.step();
    });
  }

  goto(name: SceneName): void {
    switch (name) {
      case 'title':
        this.scenes.switchTo(new TitleScene(this.ctx));
        break;
      case 'playing':
        this.scenes.switchTo(new PlayingScene(this.ctx));
        break;
      case 'testcard':
        this.scenes.switchTo(new TestCardScene(this.ctx));
        break;
    }
  }

  /** One fixed game update. */
  step(): void {
    this.scenes.update();
    this.input.endTick();
  }

  render(): void {
    this.scenes.render();
  }

  pause(): void {
    const cur = this.scenes.current;
    if (cur instanceof PlayingScene) {
      this.input.releaseAll();
      this.scenes.switchTo(
        new PausedScene(this.ctx, cur, () => {
          this.loop.reset();
        }),
      );
    }
  }

  /** Start the real-time loop (requestAnimationFrame). */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    const frame = (now: number): void => {
      const t0 = performance.now();
      this.loop.advance(now - this.lastFrame);
      this.lastFrame = now;
      const t1 = performance.now();
      this.render();
      recordFrame(now, t1 - t0, performance.now() - t1);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}
