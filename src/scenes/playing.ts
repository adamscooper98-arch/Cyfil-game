import { SCREEN_H } from '../config.ts';
import { TILE } from '../game/level.ts';
import { Camera, clamp } from '../render/camera.ts';
import { C } from '../render/palette.ts';
import { drawParallax, drawTilemap } from '../render/tilemap.ts';
import type { GameContext, Scene } from './scene.ts';

const SPEED = 1.5;
const HALF_W = 8;

/** M1 placeholder: Cyfil floats freely over the test level so scrolling, parallax and tiles can be judged. */
export class PlayingScene implements Scene {
  tick = 0;
  x: number;
  y: number;
  private facingLeft = false;
  private readonly cam = new Camera();

  constructor(private readonly ctx: GameContext) {
    this.x = ctx.level.start.x * TILE + TILE / 2;
    this.y = ctx.level.start.y * TILE + TILE;
    this.follow();
  }

  private follow(): void {
    const { level } = this.ctx;
    this.cam.follow(this.x, this.y - 12, level.width * TILE, level.height * TILE);
  }

  update(): void {
    const { input, level } = this.ctx;
    if (input.pausePressed()) {
      this.ctx.pause();
      return;
    }
    this.tick++;
    const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const dy = (input.downHeld ? 1 : 0) - (input.up ? 1 : 0);
    if (dx !== 0) this.facingLeft = dx < 0;
    this.x = clamp(this.x + dx * SPEED, HALF_W, level.width * TILE - HALF_W);
    this.y = clamp(this.y + dy * SPEED, 24, level.height * TILE);
    this.follow();
  }

  render(): void {
    const { r, level } = this.ctx;
    r.clear(C.navy);
    const { tileset } = level;
    drawParallax(r, tileset.parallaxFar, 64, 0, 0.25, this.cam);
    drawParallax(r, tileset.parallaxNear, 64, SCREEN_H - 128, 0.5, this.cam);
    drawTilemap(r, level, this.cam);
    r.drawAnimated('cyfil.idle', this.tick, this.x - this.cam.px, this.y - this.cam.py, { flip: this.facingLeft });
  }
}
