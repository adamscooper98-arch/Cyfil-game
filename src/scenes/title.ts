import { GAME_NAME, SCREEN_H, SCREEN_W } from '../config.ts';
import { C } from '../render/palette.ts';
import { textWidth } from '../render/tinyfont.ts';
import { PlayingScene } from './playing.ts';
import type { GameContext, Scene } from './scene.ts';

export class TitleScene implements Scene {
  private tick = 0;

  constructor(private readonly ctx: GameContext) {}

  update(): void {
    this.tick++;
    if (this.ctx.input.confirmPressed()) this.ctx.scenes.switchTo(new PlayingScene(this.ctx));
  }

  render(): void {
    const { r } = this.ctx;
    r.clear(C.navy);
    const name = GAME_NAME.toUpperCase();
    const scale = 6;
    r.drawText(name, Math.round((SCREEN_W - textWidth(name) * scale) / 2), 36, C.cyan, scale);
    r.drawAnimated('cyfil.idle', this.tick, SCREEN_W / 2, 118, { variant: this.tick % 120 < 60 ? undefined : 'gold' });
    const prompt = 'TAP OR PRESS ENTER';
    if (this.tick % 60 < 40) {
      r.drawText(prompt, Math.round((SCREEN_W - textWidth(prompt)) / 2), SCREEN_H - 36, C.grey);
    }
  }
}
