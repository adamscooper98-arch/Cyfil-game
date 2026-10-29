import { SCREEN_W } from '../config.ts';
import { Player } from '../game/player.ts';
import { type Level, TILE } from '../game/level.ts';
import { Btn } from '../input/inputState.ts';
import { Camera } from '../render/camera.ts';
import { C } from '../render/palette.ts';
import { textWidth } from '../render/tinyfont.ts';
import { drawParallax, drawTilemap } from '../render/tilemap.ts';
import type { GameContext, Scene } from './scene.ts';

/** Falling this far below the level counts as dying in a pit (M2: just respawn at the start). */
const PIT_MARGIN = 48;
const GOAL_REACH = 10;

export class PlayingScene implements Scene {
  tick = 0;
  readonly player: Player;
  reachedGoal = false;
  private readonly cam = new Camera();
  private readonly spawn: { x: number; y: number };
  private readonly goal: { x: number; y: number } | undefined;

  constructor(
    private readonly ctx: GameContext,
    readonly level: Level,
  ) {
    this.spawn = { x: level.start.x * TILE + TILE / 2, y: (level.start.y + 1) * TILE };
    this.player = new Player(this.spawn.x, this.spawn.y);
    const g = level.entities.find((e) => e.type === 'goal');
    this.goal = g ? { x: g.x * TILE + TILE / 2, y: (g.y + 1) * TILE } : undefined;
    this.follow();
  }

  private follow(): void {
    this.cam.follow(this.player.x, this.player.y - 12, this.level.width * TILE, this.level.height * TILE);
  }

  update(): void {
    const { input } = this.ctx;
    if (input.wasPressed(Btn.PAUSE)) {
      this.ctx.pause();
      return;
    }
    this.tick++;
    this.player.update(input, this.level);

    if (this.player.y > this.level.height * TILE + PIT_MARGIN) this.player.respawn(this.spawn.x, this.spawn.y);
    if (this.goal && Math.abs(this.player.x - this.goal.x) < GOAL_REACH && Math.abs(this.player.y - this.goal.y) < TILE) {
      this.reachedGoal = true;
    }
    this.follow();
  }

  render(): void {
    const { r } = this.ctx;
    const { level, player, cam } = this;
    r.clear(C.navy);
    const levelPxH = level.height * TILE;
    // Layers sit on the level's bottom edge and scroll with the camera, so the skyline stays "on the ground".
    drawParallax(r, level.tileset.parallaxFar, 64, levelPxH - cam.py - 192, 0.25, cam);
    drawParallax(r, level.tileset.parallaxNear, 64, levelPxH - cam.py - 128, 0.5, cam);
    drawTilemap(r, level, cam);
    r.drawAnimated(`cyfil.${player.anim}`, player.animTick, player.x - cam.px, player.y - cam.py, { flip: player.facing < 0 });
    if (this.reachedGoal) {
      const msg = 'GOAL';
      r.drawText(msg, Math.round((SCREEN_W - textWidth(msg) * 4) / 2), 24, C.lemon, 4);
    }
  }

  /** One line of player state for the dev overlay. */
  debugLine(): string {
    const p = this.player;
    return `x ${p.x.toFixed(1)} y ${p.y.toFixed(1)} vx ${p.vx.toFixed(2)} vy ${p.vy.toFixed(2)} ${p.onGround ? 'G' : '-'}`;
  }
}

