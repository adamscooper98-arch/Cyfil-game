/**
 * Movement numbers (DESIGN §3.1). Units: pixels and ticks (1 tick = 1/60 s). These are first guesses; Cooper tunes them
 * live from the dev tuning panel and tells me the values he likes, which then become the defaults here.
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
];

/** The live values the game reads every tick. Tests call resetTuning() first so they never depend on dev tweaks. */
export const tuning: Tuning = { ...DEFAULT_TUNING };

export function resetTuning(): void {
  Object.assign(tuning, DEFAULT_TUNING);
}
