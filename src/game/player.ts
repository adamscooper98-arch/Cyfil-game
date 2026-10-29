import { type Body, moveX, moveY } from './collision.ts';
import type { Level } from './level.ts';
import { Btn, type InputState } from '../input/inputState.ts';
import { tuning } from './tuning.ts';

export type PlayerAnim = 'idle' | 'run' | 'jump' | 'fall';

/** Cyfil's movement: run with acceleration, variable-height jump, coyote time, jump buffering, gravity. */
export class Player implements Body {
  vx = 0;
  vy = 0;
  onGround = false;
  facing: 1 | -1 = 1;
  anim: PlayerAnim = 'idle';
  animTick = 0;
  private coyote = 0;
  private buffer = 0;
  private jumping = false;

  constructor(
    public x: number,
    public y: number,
  ) {}

  update(input: InputState, level: Level): void {
    const t = tuning;

    const dir = (input.isHeld(Btn.RIGHT) ? 1 : 0) - (input.isHeld(Btn.LEFT) ? 1 : 0);
    if (dir !== 0) {
      this.facing = dir > 0 ? 1 : -1;
      this.vx = Math.max(-t.runMax, Math.min(t.runMax, this.vx + dir * t.runAccel));
    } else {
      const f = this.onGround ? t.groundFriction : t.airFriction;
      this.vx = Math.abs(this.vx) <= f ? 0 : this.vx - Math.sign(this.vx) * f;
    }

    this.buffer = input.wasPressed(Btn.JUMP) ? t.bufferTicks : Math.max(0, this.buffer - 1);
    this.coyote = this.onGround ? t.coyoteTicks : Math.max(0, this.coyote - 1);

    if (this.buffer > 0 && this.coyote > 0) {
      this.vy = -t.jumpSpeed;
      this.jumping = true;
      this.coyote = 0;
      this.buffer = 0;
      this.onGround = false;
    }
    // releasing jump early cuts the rise short
    if (this.jumping && !input.isHeld(Btn.JUMP) && this.vy < -t.jumpCut) this.vy = -t.jumpCut;

    this.vy = Math.min(this.vy + t.gravity, t.maxFall);
    moveX(this, level);
    moveY(this, level);
    if (this.onGround || this.vy >= 0) this.jumping = false;

    const next: PlayerAnim = !this.onGround ? (this.vy < 0 ? 'jump' : 'fall') : Math.abs(this.vx) > 0.1 ? 'run' : 'idle';
    this.animTick = next === this.anim ? this.animTick + 1 : 0;
    this.anim = next;
  }

  respawn(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.coyote = 0;
    this.buffer = 0;
    this.jumping = false;
  }
}
