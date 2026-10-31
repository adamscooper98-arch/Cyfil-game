import { SCREEN_W } from '../config.ts';
import { devFlags, drawHitboxes } from '../dev/hitboxes.ts';
import { DUMMY_HP } from '../game/dummy.ts';
import { type Level, TILE } from '../game/level.ts';
import type { Player } from '../game/player.ts';
import { World } from '../game/world.ts';
import { Btn } from '../input/inputState.ts';
import { Camera } from '../render/camera.ts';
import { C } from '../render/palette.ts';
import { textWidth } from '../render/tinyfont.ts';
import { drawParallax, drawTilemap } from '../render/tilemap.ts';
import type { GameContext, Scene } from './scene.ts';

/** Falling this far below the level counts as dying in a pit (M2: just respawn at the start). */
const PIT_MARGIN = 48;
const GOAL_REACH = 10;
/** Three spark frames at 20 fps, 3 ticks each. */
const SPARK_TICKS = 9;

interface Spark {
  x: number;
  y: number;
  age: number;
}

export class PlayingScene implements Scene {
  tick = 0;
  readonly world: World;
  reachedGoal = false;
  private readonly cam = new Camera();
  private readonly goal: { x: number; y: number } | undefined;
  private readonly sparks: Spark[] = [];

  constructor(
    private readonly ctx: GameContext,
    readonly level: Level,
  ) {
    this.world = new World(level);
    const g = level.entities.find((e) => e.type === 'goal');
    this.goal = g ? { x: g.x * TILE + TILE / 2, y: (g.y + 1) * TILE } : undefined;
    this.follow();
  }

  get player(): Player {
    return this.world.player;
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
    for (const s of this.sparks) s.age++;
    while (this.sparks[0] && this.sparks[0].age >= SPARK_TICKS) this.sparks.shift();

    this.world.update(input);
    for (const e of this.world.events) this.sparks.push({ x: e.x, y: e.y, age: 0 });

    const { player } = this;
    if (player.y > this.level.height * TILE + PIT_MARGIN) this.world.respawnPlayer();
    if (this.goal && Math.abs(player.x - this.goal.x) < GOAL_REACH && Math.abs(player.y - this.goal.y) < TILE) {
      this.reachedGoal = true;
    }
    this.follow();
  }

  render(): void {
    const { r } = this.ctx;
    const { level, player, cam, world } = this;
    r.clear(C.navy);
    const levelPxH = level.height * TILE;
    // Layers sit on the level's bottom edge and scroll with the camera, so the skyline stays "on the ground".
    drawParallax(r, level.tileset.parallaxFar, 64, levelPxH - cam.py - 192, 0.25, cam);
    drawParallax(r, level.tileset.parallaxNear, 64, levelPxH - cam.py - 128, 0.5, cam);
    drawTilemap(r, level, cam);

    for (const d of world.dummies) {
      if (d.dead) continue;
      const x = d.x - cam.px;
      const y = d.y - cam.py;
      r.drawSprite('dummy.idle', 0, x, y, d.flash > 0 ? { variant: 'flash' } : {});
      // placeholder health bar (the real HUD arrives with M3 step 6)
      r.fillRect(C.outline, x - 7, y - 24, 14, 4);
      r.fillRect(C.slate, x - 6, y - 23, 12, 2);
      r.fillRect(C.lemon, x - 6, y - 23, Math.round((d.hp / DUMMY_HP) * 12), 2);
    }

    r.drawAnimated(`cyfil.${player.anim}`, player.animTick, player.x - cam.px, player.y - cam.py, { flip: player.facing < 0 });
    this.drawSwing();
    for (const s of this.sparks) r.drawAnimated('fx.spark', s.age, s.x - cam.px, s.y - cam.py);
    if (__DEV_TOOLS__ && devFlags.hitboxes) drawHitboxes(r, world, cam);

    if (this.reachedGoal) {
      const msg = 'GOAL';
      r.drawText(msg, Math.round((SCREEN_W - textWidth(msg) * 4) / 2), 24, C.lemon, 4);
    }
  }

  /** Placeholder swing effect: an arc in front of Cyfil for hits 1 and 2, a ring around Cyfil for hit 3. */
  private drawSwing(): void {
    const { r } = this.ctx;
    const { combo, player } = this.world;
    if (!combo.inActiveWindow) return;
    const x = player.x - this.cam.px;
    const y = player.y - this.cam.py;
    if (combo.stage === 2) r.drawSprite('fx.spin', 0, x, y - 10);
    else r.drawSprite('fx.slash', 0, x + combo.swingFacing * 6, y - 9, { flip: combo.swingFacing < 0 });
  }

  /** One line of player state for the dev overlay. */
  debugLine(): string {
    const p = this.player;
    const base = `x ${p.x.toFixed(1)} y ${p.y.toFixed(1)} vx ${p.vx.toFixed(2)} vy ${p.vy.toFixed(2)} ${p.onGround ? 'G' : '-'}`;
    const hp = this.world.dummies.map((d) => (d.dead ? 'x' : String(d.hp))).join(',');
    return hp ? `${base} dummy ${hp}` : base;
  }
}
