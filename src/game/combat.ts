import { HALF_W } from './collision.ts';
import { tuning } from './tuning.ts';

/** Axis-aligned box, top-left origin. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** True when the boxes share area. Touching edges do not count. */
export function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/** How far up from the feet the attack box starts. */
const BOX_TOP_OFFSET = 16;

/**
 * Cyfil's 3-hit Attack chain (DESIGN §3.3). Call `tick()` once per game tick, then `press()` on an Attack press.
 * The chain only continues when the previous swing landed and the next press comes within `comboWindow` ticks of that
 * landing; a whiff or a late press starts over at hit 1.
 */
export class Combo {
  /** Stage (0, 1, 2) of the current or most recent swing. */
  stage = 0;
  /** Swing tick at which the last swing landed. */
  landTick = 0;
  /** Did the current swing already land? */
  landed = false;
  private swinging = false;
  private swingTick = 0;
  private facing: 1 | -1 = 1;
  /** Ticks since the last landed hit, or null when no chain is open. */
  private sinceHit: number | null = null;
  /** Stage of the last landed hit while a chain is open. */
  private chainStage = 0;

  get isSwinging(): boolean {
    return this.swinging;
  }

  /** Which way the current or most recent swing faces. */
  get swingFacing(): 1 | -1 {
    return this.facing;
  }

  /** The hitbox window is open (even if the swing already landed). Used to draw the swing effect. */
  get inActiveWindow(): boolean {
    return this.swinging && this.swingTick >= tuning.activeFrom && this.swingTick <= tuning.activeTo;
  }

  /** Knockback speed of the current swing: hits 1 and 2 only flinch the target so the chain stays in reach; hit 3 launches. */
  get knockback(): number {
    return tuning.knockback * (this.stage === 2 ? 1 : 0.4);
  }

  /** Damage of the current swing. */
  get damage(): number {
    return [tuning.comboDamage1, tuning.comboDamage2, tuning.comboDamage3][this.stage] ?? tuning.comboDamage1;
  }

  tick(): void {
    if (this.swinging) {
      this.swingTick++;
      if (this.swingTick >= tuning.swingTicks) {
        this.swinging = false;
        if (!this.landed) this.sinceHit = null; // whiff: the chain is broken
      }
    }
    if (this.sinceHit !== null) {
      this.sinceHit++;
      if (this.sinceHit > tuning.comboWindow) this.sinceHit = null;
    }
  }

  /** Try to start a swing. Returns false (and does nothing) while one is already in progress. */
  press(facing: 1 | -1): boolean {
    if (this.swinging) return false;
    const chains = this.sinceHit !== null && this.chainStage < 2;
    this.stage = chains ? this.chainStage + 1 : 0;
    this.swinging = true;
    this.swingTick = 0;
    this.landed = false;
    this.facing = facing;
    return true;
  }

  /** The live hitbox for the feet position (x, y), or null when there is none this tick. */
  activeBox(x: number, y: number): Box | null {
    if (!this.swinging || this.landed) return null;
    if (this.swingTick < tuning.activeFrom || this.swingTick > tuning.activeTo) return null;
    const w = tuning.attackReach;
    return { x: this.facing > 0 ? x + HALF_W : x - HALF_W - w, y: y - BOX_TOP_OFFSET, w, h: tuning.attackHeight };
  }

  /** Report that the live hitbox hit something. */
  land(): void {
    this.landed = true;
    this.landTick = this.swingTick;
    this.chainStage = this.stage;
    this.sinceHit = 0;
  }

  /** Forget the chain (taking damage, respawn). */
  reset(): void {
    this.swinging = false;
    this.landed = false;
    this.sinceHit = null;
    this.stage = 0;
  }
}

/** Freeze frames: the simulation pauses for a few ticks on a hit (longer on a kill). */
export class Hitstop {
  private left = 0;

  start(kill: boolean): void {
    this.left = Math.max(this.left, kill ? tuning.hitstopKill : tuning.hitstopHit);
  }

  /** Call once per game tick. Returns true when this tick is frozen and the simulation should be skipped. */
  step(): boolean {
    if (this.left <= 0) return false;
    this.left--;
    return true;
  }
}
