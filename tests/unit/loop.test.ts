import { describe, expect, it } from 'vitest';
import { FixedLoop, MAX_CATCH_UP_STEPS } from '../../src/core/loop.ts';
import { Rng } from '../../src/core/rng.ts';

function run(frameMs: number, totalMs: number): number {
  let updates = 0;
  const loop = new FixedLoop(() => {
    updates++;
  });
  for (let t = 0; t < totalMs - 1e-6; t += frameMs) loop.advance(frameMs);
  return updates;
}

describe('FixedLoop', () => {
  it.each([
    ['60 Hz display', 1000 / 60],
    ['120 Hz display', 1000 / 120],
    ['30 Hz display (low power mode)', 1000 / 30],
    ['irregular 16 ms frames', 16],
  ])('runs 60 updates per second on a %s', (_name, frameMs) => {
    const updates = run(frameMs, 10_000);
    expect(updates).toBeGreaterThanOrEqual(599);
    expect(updates).toBeLessThanOrEqual(600);
  });

  it('runs exactly 60 updates for exactly one second', () => {
    let updates = 0;
    // cap lifted: 250 ms is 15 ticks, more than the default per-frame catch-up limit
    const loop = new FixedLoop(() => {
      updates++;
    }, 100);
    for (let i = 0; i < 4; i++) loop.advance(250);
    expect(updates).toBe(60);
  });

  it('caps catch-up work and drops the rest instead of spiraling', () => {
    let updates = 0;
    const loop = new FixedLoop(() => {
      updates++;
    });
    expect(loop.advance(5000)).toBe(MAX_CATCH_UP_STEPS);
    expect(updates).toBe(MAX_CATCH_UP_STEPS);
    // the dropped time is gone: a normal frame afterwards runs a normal number of updates
    expect(loop.advance(1000 / 60)).toBe(1);
  });

  it('ignores negative time and can be reset', () => {
    let updates = 0;
    const loop = new FixedLoop(() => {
      updates++;
    });
    loop.advance(-100);
    expect(updates).toBe(0);
    loop.advance(10);
    loop.reset();
    loop.advance(10);
    expect(updates).toBe(0);
  });
});

describe('Rng', () => {
  it('is deterministic for a seed', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()));
  });

  it('differs between seeds and stays in [0, 1)', () => {
    const a = new Rng(1);
    const b = new Rng(2);
    expect(a.next()).not.toBe(b.next());
    const r = new Rng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int() is inclusive of both ends', () => {
    const r = new Rng(3);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(r.int(1, 3));
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });
});
