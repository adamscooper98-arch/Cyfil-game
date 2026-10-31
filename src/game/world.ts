import { Btn, type InputState } from '../input/inputState.ts';
import { Combo, Hitstop, overlaps } from './combat.ts';
import { Dummy } from './dummy.ts';
import { type Level, TILE } from './level.ts';
import { Player } from './player.ts';
import { tuning } from './tuning.ts';

/** Things that happened this tick, for the scene to turn into sparks and (later) sound. Game logic never draws or plays. */
export interface HitEvent {
  readonly type: 'hit';
  readonly x: number;
  readonly y: number;
  readonly kill: boolean;
}

/** Everything that simulates during play: the player, enemies and the combat rules between them. */
export class World {
  readonly player: Player;
  readonly dummies: Dummy[] = [];
  readonly combo = new Combo();
  readonly hitstop = new Hitstop();
  readonly spawn: { x: number; y: number };
  /** Ticks simulated so far; frozen ticks (hitstop) do not count. */
  ticks = 0;
  events: HitEvent[] = [];
  /** Ticks an Attack press stays queued, so a press during a swing or a freeze frame is not lost. */
  private attackBuffer = 0;

  constructor(readonly level: Level) {
    this.spawn = { x: level.start.x * TILE + TILE / 2, y: (level.start.y + 1) * TILE };
    this.player = new Player(this.spawn.x, this.spawn.y);
    for (const e of level.entities) {
      if (e.type === 'dummy') this.dummies.push(new Dummy(e.x * TILE + TILE / 2, (e.y + 1) * TILE));
    }
  }

  update(input: InputState): void {
    this.events = [];
    if (input.wasPressed(Btn.ATTACK)) this.attackBuffer = tuning.bufferTicks;
    if (this.hitstop.step()) return;
    this.ticks++;

    this.combo.tick();
    if (this.attackBuffer > 0) {
      if (this.combo.press(this.player.facing)) this.attackBuffer = 0;
      else this.attackBuffer--;
    }
    this.player.update(input, this.level);
    for (const d of this.dummies) d.update(this.level);
    this.resolveHits();
  }

  private resolveHits(): void {
    const box = this.combo.activeBox(this.player.x, this.player.y);
    if (!box) return;
    const damage = this.combo.damage;
    let landed = false;
    for (const d of this.dummies) {
      if (d.dead) continue;
      const hurt = d.hurtbox;
      if (!overlaps(box, hurt)) continue;
      const kill = d.hurt(damage, this.combo.swingFacing, this.combo.knockback);
      const x0 = Math.max(box.x, hurt.x);
      const x1 = Math.min(box.x + box.w, hurt.x + hurt.w);
      const y0 = Math.max(box.y, hurt.y);
      const y1 = Math.min(box.y + box.h, hurt.y + hurt.h);
      this.events.push({ type: 'hit', x: (x0 + x1) / 2, y: (y0 + y1) / 2, kill });
      this.hitstop.start(kill);
      landed = true;
    }
    if (landed) this.combo.land();
  }

  respawnPlayer(): void {
    this.player.respawn(this.spawn.x, this.spawn.y);
    this.combo.reset();
  }
}
