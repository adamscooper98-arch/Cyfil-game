import { SCREEN_H, SCREEN_W } from '../config.ts';
import { C } from '../render/palette.ts';
import { textWidth } from '../render/tinyfont.ts';
import type { PlayingScene } from './playing.ts';
import type { GameContext, Scene } from './scene.ts';

/** Shows the frozen game dimmed (palette-pure dither) until the player resumes. */
export class PausedScene implements Scene {
  constructor(
    private readonly ctx: GameContext,
    private readonly under: PlayingScene,
    private readonly onResume: () => void,
  ) {}

  update(): void {
    const { input, scenes } = this.ctx;
    if (input.confirmPressed() || input.pausePressed()) {
      scenes.switchTo(this.under);
      this.onResume();
    }
  }

  render(): void {
    const { r } = this.ctx;
    this.under.render();
    r.dither(C.navy);
    const title = 'PAUSED';
    r.drawText(title, Math.round((SCREEN_W - textWidth(title) * 4) / 2), 70, C.white, 4);
    const hint = 'TAP TO RESUME';
    r.drawText(hint, Math.round((SCREEN_W - textWidth(hint)) / 2), SCREEN_H - 24, C.grey);
  }
}
