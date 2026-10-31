/**
 * Movement numbers (DESIGN §3.1). Units: pixels and ticks (1 tick = 1/60 s). These are first guesses; Cooper tunes them
 * live from the dev tuning panel and reports the values that feel right, which then become the defaults here.
 */
export interface Tuning {
  /** Horizontal acceleration while a direction is held (px/tick^2). */
  runAccel: number;
  /** Top running speed (px/tick). */
  runMax: number;
  /** Ground deceleration when no direction is held (px/tick^2). */
  groundFriction: number;
  /** Air deceleration when no direction is held (px/tick^2). */
  airFriction: number;
  /** Upward speed at the start of a jump (px/tick, positive number). */
  jumpSpeed: number;
  /** Releasing jump early caps upward speed to this (px/tick, positive number): the short-hop. */
  jumpCut: number;
  gravity: number;
  maxFall: number;
  /** Ticks after leaving a ledge during which jump still works. */
  coyoteTicks: number;
  /** Ticks a jump press is remembered before landing. */
  bufferTicks: number;
  /** Ticks after a landed hit during which the next Attack press chains to the next hit (DESIGN §3.3). */
  comboWindow: number;
  comboDamage1: number;
  comboDamage2: number;
  comboDamage3: number;
  /** Length of one swing, in ticks. A new Attack press is ignored until it ends. */
  swingTicks: number;
  /** The swing's hitbox is live from this tick of the swing to `activeTo`, inclusive (1-based). */
  activeFrom: number;
  activeTo: number;
  /** Hitbox size in front of Cyfil (px). */
  attackReach: number;
  attackHeight: number;
  /** Freeze frames on a hit and on a kill. */
  hitstopHit: number;
  hitstopKill: number;
  /** Horizontal speed a hit gives its target (px/tick). */
  knockback: number;
}

export const DEFAULT_TUNING: Readonly<Tuning> = {
  runAccel: 0.25,
  runMax: 1.5,
  groundFriction: 0.3,
  airFriction: 0.1,
  jumpSpeed: 4.2,
  jumpCut: 1.5,
  gravity: 0.22,
  maxFall: 4.5,
  coyoteTicks: 6,
  bufferTicks: 6,
  comboWindow: 18,
  comboDamage1: 1,
  comboDamage2: 1,
  comboDamage3: 2,
  swingTicks: 14,
  activeFrom: 3,
  activeTo: 8,
  attackReach: 14,
  attackHeight: 14,
  hitstopHit: 3,
  hitstopKill: 6,
  knockback: 1.5,
};

export interface TuningDef {
  readonly key: keyof Tuning;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

export const TUNING_DEFS: readonly TuningDef[] = [
  { key: 'runAccel', label: 'Run accel', min: 0.05, max: 1, step: 0.01 },
  { key: 'runMax', label: 'Run speed', min: 0.5, max: 4, step: 0.05 },
  { key: 'groundFriction', label: 'Ground friction', min: 0.05, max: 1.5, step: 0.01 },
  { key: 'airFriction', label: 'Air friction', min: 0, max: 1, step: 0.01 },
  { key: 'jumpSpeed', label: 'Jump speed', min: 2, max: 8, step: 0.1 },
  { key: 'jumpCut', label: 'Short-hop cut', min: 0.5, max: 4, step: 0.1 },
  { key: 'gravity', label: 'Gravity', min: 0.05, max: 0.8, step: 0.01 },
  { key: 'maxFall', label: 'Max fall', min: 2, max: 10, step: 0.1 },
  { key: 'coyoteTicks', label: 'Coyote ticks', min: 0, max: 15, step: 1 },
  { key: 'bufferTicks', label: 'Buffer ticks', min: 0, max: 15, step: 1 },
  { key: 'comboWindow', label: 'Combo window', min: 6, max: 40, step: 1 },
  { key: 'comboDamage1', label: 'Hit 1 damage', min: 1, max: 5, step: 1 },
  { key: 'comboDamage2', label: 'Hit 2 damage', min: 1, max: 5, step: 1 },
  { key: 'comboDamage3', label: 'Hit 3 damage', min: 1, max: 8, step: 1 },
  { key: 'swingTicks', label: 'Swing length', min: 6, max: 30, step: 1 },
  { key: 'activeFrom', label: 'Hitbox from tick', min: 1, max: 10, step: 1 },
  { key: 'activeTo', label: 'Hitbox to tick', min: 2, max: 20, step: 1 },
  { key: 'attackReach', label: 'Attack reach', min: 6, max: 30, step: 1 },
  { key: 'attackHeight', label: 'Attack height', min: 6, max: 24, step: 1 },
  { key: 'hitstopHit', label: 'Hitstop (hit)', min: 0, max: 10, step: 1 },
  { key: 'hitstopKill', label: 'Hitstop (kill)', min: 0, max: 16, step: 1 },
  { key: 'knockback', label: 'Knockback', min: 0, max: 4, step: 0.1 },
];

/** The live values the game reads every tick. Tests call resetTuning() first so they never depend on dev tweaks. */
export const tuning: Tuning = { ...DEFAULT_TUNING };

export function resetTuning(): void {
  Object.assign(tuning, DEFAULT_TUNING);
}
