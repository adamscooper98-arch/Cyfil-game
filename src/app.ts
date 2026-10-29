import { DEFAULT_LEVEL } from './app-constants.ts';
import physicsCourseJson from './content/levels/physics-course.json';
import testLevelJson from './content/levels/test-level.json';
import { ALL_SPRITES } from './content/sprites/index.ts';
import { FixedLoop } from './core/loop.ts';
import { recordFrame } from './core/perf.ts';
import { Recorder, ReplayPlayer, type ReplayRuns } from './core/replay.ts';
import { Rng } from './core/rng.ts';
import { type Level, parseLevel } from './game/level.ts';
import { InputState } from './input/inputState.ts';
import { KeyboardSource, TapSource } from './input/sources.ts';
import { type Atlas, buildAtlas } from './render/atlas.ts';
import { Renderer } from './render/renderer.ts';
import { PausedScene } from './scenes/paused.ts';
import { PlayingScene } from './scenes/playing.ts';
import { type GameContext, SceneManager } from './scenes/scene.ts';
import { TestCardScene } from './scenes/testcard.ts';
import { TitleScene } from './scenes/title.ts';
import type { TouchControls } from './ui/touchControls.ts';

export type SceneName = 'title' | 'playing' | 'testcard';

/** Owns the game objects and the frame loop. The DOM-facing bits (canvas, events) are wired in main.ts. */
export class App {
  readonly atlas: Atlas;
  readonly renderer: Renderer;
  readonly inputState = new InputState();
  readonly keyboard = new KeyboardSource();
  readonly scenes = new SceneManager();
  readonly ctx: GameContext;
  private readonly tap = new TapSource();
  private touch: TouchControls | null = null;
  private readonly loop: FixedLoop;
  private lastFrame = 0;
  private running = false;
  private recorder: Recorder | null = null;
  private replay: ReplayPlayer | null = null;

  constructor(context2d: CanvasRenderingContext2D) {
    this.atlas = buildAtlas(ALL_SPRITES);
    this.renderer = new Renderer(context2d, this.atlas);
    this.keyboard.attach(window);
    this.tap.attach(window);
    this.ctx = {
      r: this.renderer,
      input: this.inputState,
      rng: new Rng(1),
      scenes: this.scenes,
      levels: {
        'test-level': parseLevel(testLevelJson),
        'physics-course': parseLevel(physicsCourseJson),
      },
      pause: () => {
        this.pause();
      },
    };
    this.loop = new FixedLoop(() => {
      this.step();
    });
  }

  attachTouch(controls: TouchControls): void {
    this.touch = controls;
  }

  goto(name: SceneName, levelId: string = DEFAULT_LEVEL): void {
    switch (name) {
      case 'title':
        this.scenes.switchTo(new TitleScene(this.ctx));
        break;
      case 'playing': {
        const level: Level | undefined = this.ctx.levels[levelId];
        if (!level) throw new Error(`Unknown level "${levelId}"`);
        this.scenes.switchTo(new PlayingScene(this.ctx, level));
        break;
      }
      case 'testcard':
        this.scenes.switchTo(new TestCardScene(this.ctx));
        break;
    }
  }

  /** Raw button mask from every live source. */
  private sampleRaw(): number {
    return this.keyboard.sample() | this.tap.sample() | (this.touch?.sample() ?? 0);
  }

  /** One fixed game update. */
  step(): void {
    const live = this.sampleRaw();
    const raw = this.replay ? this.replay.next() : live;
    this.recorder?.push(raw);
    this.inputState.update(raw);
    this.scenes.update();
  }

  render(): void {
    this.scenes.render();
  }

  pause(): void {
    const cur = this.scenes.current;
    if (cur instanceof PlayingScene) {
      this.scenes.switchTo(
        new PausedScene(this.ctx, cur, () => {
          this.loop.reset();
        }),
      );
    }
  }

  /** Let go of every held input (rotation, backgrounding). */
  releaseInputs(): void {
    this.keyboard.releaseAll();
    this.touch?.releaseAll();
    this.inputState.reset();
  }

  startRecording(): void {
    this.recorder = new Recorder();
  }

  stopRecording(): ReplayRuns {
    const runs = this.recorder?.result ?? [];
    this.recorder = null;
    return runs;
  }

  /** Feed these input runs instead of live input until they end. */
  playReplay(runs: ReplayRuns): void {
    this.replay = new ReplayPlayer(runs);
  }

  /** Player state of the level being played (also while paused), or null. */
  playerState(): { x: number; y: number; vx: number; vy: number; onGround: boolean; reachedGoal: boolean } | null {
    const cur = this.scenes.current;
    const playing = cur instanceof PausedScene ? cur.under : cur;
    if (!(playing instanceof PlayingScene)) return null;
    const { x, y, vx, vy, onGround } = playing.player;
    return { x, y, vx, vy, onGround, reachedGoal: playing.reachedGoal };
  }

  /** One line of player state for the dev overlay, if a level is being played. */
  debugLine(): string {
    const cur = this.scenes.current;
    const playing = cur instanceof PausedScene ? cur.under : cur;
    return playing instanceof PlayingScene ? playing.debugLine() : '';
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
