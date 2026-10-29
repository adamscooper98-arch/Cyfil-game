/** A replay is the input mask for every tick, run-length encoded as [mask, count] pairs. */
export type ReplayRuns = readonly (readonly [mask: number, count: number])[];

export class Recorder {
  private readonly runs: [number, number][] = [];

  push(mask: number): void {
    const last = this.runs[this.runs.length - 1];
    if (last?.[0] === mask) last[1]++;
    else this.runs.push([mask, 1]);
  }

  get result(): ReplayRuns {
    return this.runs;
  }
}

export class ReplayPlayer {
  private run = 0;
  private used = 0;

  constructor(private readonly runs: ReplayRuns) {}

  /** Mask for the next tick; 0 after the replay ends. */
  next(): number {
    for (;;) {
      const r = this.runs[this.run];
      if (!r) return 0;
      if (this.used < r[1]) {
        this.used++;
        return r[0];
      }
      this.run++;
      this.used = 0;
    }
  }

  get finished(): boolean {
    const r = this.runs[this.run];
    return !r || (this.run === this.runs.length - 1 && this.used >= r[1]);
  }
}

export function expandReplay(runs: ReplayRuns): number[] {
  return runs.flatMap(([mask, count]) => Array.from({ length: count }, () => mask));
}
