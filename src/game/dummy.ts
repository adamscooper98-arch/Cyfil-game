import { BODY_H, type Body, HALF_W, moveX, moveY } from './collision.ts';
import type { Box } from './combat.ts';
import type { Level } from './level.ts';
import { tuning } from './tuning.ts';

export const DUMMY_HP = 12;
/** A knocked-out training dummy stands back up after this many ticks (real enemies never respawn in the slice). */
const REVIVE_TICKS = 90;
const FLASH_TICKS = 6;
const FRICTION = 0.15;

/** Training dummy: takes hits, gets knocked back, stands back up. Uses Cyfil's 12x18 collision box. */
export class Dummy implements Body {
  vx = 0;
  vy = 0;
  onGround = false;
  hp = DUMMY_HP;
  flash = 0;
  dead = false;
  private deadTicks = 0;

  constructor(
    public x: number,
    public y: number,
  ) {}

  get hurtbox(): Box {
    return { x: this.x - HALF_W, y: this.y - BODY_H, w: HALF_W * 2, h: BODY_H };
  }

  /** Returns true when this hit knocked the dummy out. */
  hurt(damage: number, dir: 1 | -1, knockback: number): boolean {
    this.hp = Math.max(0, this.hp - damage);
    this.flash = FLASH_TICKS;
    this.vx = dir * knockback;
    if (this.hp > 0) return false;
    this.dead = true;
    this.deadTicks = 0;
    return true;
  }

  update(level: Level): void {
    if (this.flash > 0) this.flash--;
    if (this.dead) {
      if (++this.deadTicks >= REVIVE_TICKS) {
        this.dead = false;
        this.hp = DUMMY_HP;
        this.vx = 0;
      }
      return;
    }
    this.vx = Math.abs(this.vx) <= FRICTION ? 0 : this.vx - Math.sign(this.vx) * FRICTION;
    this.vy = Math.min(this.vy + tuning.gravity, tuning.maxFall);
    moveX(this, level);
    moveY(this, level);
  }
}
