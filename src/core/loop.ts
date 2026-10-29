/** Game logic runs at exactly 60 updates per second, independent of the display refresh rate (DESIGN §5.1). */
export const TICKS_PER_SECOND = 60;
export const MAX_CATCH_UP_STEPS = 5;
/** Longest frame gap we believe; anything longer (tab switch, debugger) is treated as this. */
export const MAX_FRAME_MS = 250;

const EPSILON = 1e-9;

export class FixedLoop {
  private pendingTicks = 0;

  constructor(
    private readonly update: () => void,
    private readonly maxSteps: number = MAX_CATCH_UP_STEPS,
  ) {}

  /**
   * Feed elapsed real time; runs as many fixed updates as are due (at most maxSteps).
   * Time beyond maxSteps is dropped rather than caught up later (prevents the spiral of death).
   * Returns the number of updates run.
   */
  advance(elapsedMs: number): number {
    const clamped = Math.min(Math.max(elapsedMs, 0), MAX_FRAME_MS);
    this.pendingTicks += (clamped * TICKS_PER_SECOND) / 1000;
    let steps = 0;
    while (this.pendingTicks >= 1 - EPSILON && steps < this.maxSteps) {
      this.update();
      this.pendingTicks -= 1;
      steps++;
    }
    if (this.pendingTicks >= 1 - EPSILON) this.pendingTicks = 0;
    return steps;
  }

  /** Forget accumulated time (e.g. after resuming from pause). */
  reset(): void {
    this.pendingTicks = 0;
  }
}
