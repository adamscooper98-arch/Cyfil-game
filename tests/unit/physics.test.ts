import { describe, expect, it } from 'vitest';
import { BODY_H, HALF_W } from '../../src/game/collision.ts';
import { DEFAULT_TUNING, TUNING_DEFS, tuning } from '../../src/game/tuning.ts';
import { Btn, InputState } from '../../src/input/inputState.ts';
import { Sim, makeLevel } from '../support/sim.ts';

// Flat world: ground top at y = 128 (row 8). Columns are 16 px wide.
const FLAT = [...Array.from({ length: 8 }, () => '.'.repeat(20)), '#'.repeat(20), '#'.repeat(20)];
const GROUND_Y = 8 * 16;

function withTiles(base: readonly string[], edits: readonly [row: number, col0: number, col1: number, ch: string][]): string[] {
  const rows = base.map((r) => r.split(''));
  for (const [row, c0, c1, ch] of edits) {
    const r = rows[row];
    if (!r) throw new Error(`no row ${String(row)}`);
    for (let c = c0; c <= c1; c++) r[c] = ch;
  }
  return rows.map((r) => r.join(''));
}

describe('tuning', () => {
  it('defaults match DESIGN §3.1', () => {
    expect(DEFAULT_TUNING).toMatchObject({ runAccel: 0.25, runMax: 1.5, groundFriction: 0.3, jumpSpeed: 4.2, gravity: 0.22, maxFall: 4.5 });
    expect(DEFAULT_TUNING.coyoteTicks).toBe(6);
    expect(DEFAULT_TUNING.bufferTicks).toBe(6);
  });

  it('every tuning key has a slider definition and the default sits inside its range', () => {
    expect(TUNING_DEFS.map((d) => d.key).sort()).toEqual(Object.keys(DEFAULT_TUNING).sort());
    for (const d of TUNING_DEFS) {
      expect(DEFAULT_TUNING[d.key], d.key).toBeGreaterThanOrEqual(d.min);
      expect(DEFAULT_TUNING[d.key], d.key).toBeLessThanOrEqual(d.max);
    }
  });
});

describe('InputState', () => {
  it('computes pressed and released edges', () => {
    const s = new InputState();
    s.update(Btn.JUMP);
    expect([s.wasPressed(Btn.JUMP), s.isHeld(Btn.JUMP)]).toEqual([true, true]);
    s.update(Btn.JUMP);
    expect([s.wasPressed(Btn.JUMP), s.isHeld(Btn.JUMP)]).toEqual([false, true]);
    s.update(0);
    expect([s.wasReleased(Btn.JUMP), s.isHeld(Btn.JUMP)]).toEqual([true, false]);
  });

  it('tracks buttons independently', () => {
    const s = new InputState();
    s.update(Btn.LEFT | Btn.ATTACK);
    s.update(Btn.LEFT | Btn.ATTACK | Btn.JUMP);
    expect(s.wasPressed(Btn.JUMP)).toBe(true);
    expect(s.wasPressed(Btn.ATTACK)).toBe(false);
  });
});

describe('gravity and ground', () => {
  it('falls, lands exactly on the ground surface, and stays grounded', () => {
    const sim = new Sim(makeLevel(FLAT), 40, 60);
    expect(sim.until(() => sim.player.onGround)).toBe(true);
    expect(sim.player.y).toBe(GROUND_Y);
    for (let i = 0; i < 60; i++) {
      sim.step();
      expect(sim.player.onGround).toBe(true);
      expect(sim.player.y).toBe(GROUND_Y);
    }
  });

  it('never exceeds max fall speed', () => {
    const tall = [...Array.from({ length: 60 }, () => '.'.repeat(8)), '#'.repeat(8)];
    const sim = new Sim(makeLevel(tall), 40, 0);
    let fastest = 0;
    for (let i = 0; i < 200; i++) {
      sim.step();
      fastest = Math.max(fastest, sim.player.vy);
    }
    expect(fastest).toBe(tuning.maxFall);
  });
});

describe('running', () => {
  it('accelerates to top speed, then stops with friction', () => {
    const sim = new Sim(makeLevel(FLAT), 30, GROUND_Y);
    sim.run(2); // settle
    sim.run(30, Btn.RIGHT);
    expect(sim.player.vx).toBe(tuning.runMax);
    sim.run(20);
    expect(sim.player.vx).toBe(0);
  });

  it('turns around smoothly and faces the direction of travel', () => {
    const sim = new Sim(makeLevel(FLAT), 150, GROUND_Y);
    sim.run(20, Btn.RIGHT);
    expect(sim.player.facing).toBe(1);
    sim.run(5, Btn.LEFT);
    expect(sim.player.facing).toBe(-1);
    expect(sim.player.vx).toBeLessThan(tuning.runMax);
  });
});

describe('walls and edges', () => {
  it('stops flush against a wall and keeps falling beside it', () => {
    const world = withTiles(FLAT, [[6, 10, 10, '#'], [7, 10, 10, '#']]); // 2-high wall at col 10 (x = 160)
    const sim = new Sim(makeLevel(world), 40, GROUND_Y);
    sim.run(200, Btn.RIGHT);
    expect(sim.player.x).toBe(10 * 16 - HALF_W);
    expect(sim.player.vx).toBe(0);
    expect(sim.player.y).toBe(GROUND_Y);
  });

  it('does not stick to a wall while falling alongside it', () => {
    const world = withTiles(FLAT, [[2, 10, 10, '#'], [3, 10, 10, '#'], [4, 10, 10, '#'], [5, 10, 10, '#'], [6, 10, 10, '#'], [7, 10, 10, '#']]);
    const sim = new Sim(makeLevel(world), 10 * 16 - HALF_W, 20); // already touching the wall, high up
    sim.run(5, Btn.RIGHT);
    const y0 = sim.player.y;
    sim.run(10, Btn.RIGHT);
    expect(sim.player.y).toBeGreaterThan(y0);
  });

  it('the left and right edges of the level are walls', () => {
    const sim = new Sim(makeLevel(FLAT), 40, GROUND_Y);
    sim.run(200, Btn.LEFT);
    expect(sim.player.x).toBe(HALF_W);
    sim.run(400, Btn.RIGHT);
    expect(sim.player.x).toBe(20 * 16 - HALF_W);
  });

  it('lands when only the edge of the feet overlaps a block', () => {
    const world = withTiles(FLAT, [[8, 6, 19, '.'], [9, 6, 19, '.']]); // ground only in cols 0-5 (x < 96)
    const sim = new Sim(makeLevel(world), 96 + HALF_W - 1, 100); // 1 px of the box over the block
    expect(sim.until(() => sim.player.onGround)).toBe(true);
    expect(sim.player.y).toBe(GROUND_Y);
  });

  it('falls off a ledge and keeps falling into a pit', () => {
    const world = withTiles(FLAT, [[8, 6, 19, '.'], [9, 6, 19, '.']]);
    const sim = new Sim(makeLevel(world), 80, GROUND_Y);
    sim.run(100, Btn.RIGHT);
    expect(sim.player.onGround).toBe(false);
    expect(sim.player.y).toBeGreaterThan(GROUND_Y + 20);
  });
});

describe('jumping', () => {
  function peakHeight(holdTicks: number): number {
    const sim = new Sim(makeLevel(FLAT), 40, GROUND_Y);
    sim.run(2);
    let minY = sim.player.y;
    for (let i = 0; i < 80; i++) {
      sim.step(i < holdTicks ? Btn.JUMP : 0);
      minY = Math.min(minY, sim.player.y);
    }
    return GROUND_Y - minY;
  }

  it('a full jump clears about 2.5 tiles', () => {
    const h = peakHeight(80);
    expect(h).toBeGreaterThan(36);
    expect(h).toBeLessThan(44);
  });

  it('releasing early gives a short hop (less than half the height)', () => {
    expect(peakHeight(3)).toBeLessThan(peakHeight(80) / 2);
  });

  it('holding jump does not re-jump on landing; a fresh press does', () => {
    const sim = new Sim(makeLevel(FLAT), 40, GROUND_Y);
    sim.run(2);
    sim.run(120, Btn.JUMP); // one jump, then stays held through the landing
    expect(sim.player.onGround).toBe(true);
    sim.run(5, Btn.JUMP);
    expect(sim.player.onGround).toBe(true);
    sim.step(0);
    sim.step(Btn.JUMP);
    expect(sim.player.onGround).toBe(false);
  });

  it('cannot jump in mid-air', () => {
    const sim = new Sim(makeLevel(FLAT), 40, 40); // high above the ground
    sim.run(3);
    const vy = sim.player.vy;
    sim.step(Btn.JUMP);
    expect(sim.player.vy).toBeGreaterThan(vy);
  });

  it('coyote time: jump still works for a few ticks after leaving a ledge, not after', () => {
    const world = withTiles(FLAT, [[8, 6, 19, '.'], [9, 6, 19, '.']]);
    const worked: boolean[] = [];
    for (let delay = 0; delay <= 14; delay++) {
      const sim = new Sim(makeLevel(world), 80, GROUND_Y);
      sim.run(2);
      expect(sim.until(() => !sim.player.onGround, Btn.RIGHT)).toBe(true);
      sim.run(delay, Btn.RIGHT);
      sim.step(Btn.RIGHT | Btn.JUMP);
      worked.push(sim.player.vy < 0);
    }
    const last = worked.lastIndexOf(true);
    expect(worked[0]).toBe(true);
    expect(last).toBeGreaterThanOrEqual(tuning.coyoteTicks - 2);
    expect(last).toBeLessThanOrEqual(tuning.coyoteTicks);
    expect(worked.slice(last + 1).every((w) => !w)).toBe(true);
  });

  it('jump buffer: a press just before landing jumps on landing; too early does not', () => {
    const worked: boolean[] = [];
    for (let before = 0; before <= 14; before++) {
      const sim = new Sim(makeLevel(FLAT), 40, GROUND_Y - 30);
      // find the tick the player lands, in a dry run
      const dry = new Sim(makeLevel(FLAT), 40, GROUND_Y - 30);
      dry.until(() => dry.player.onGround);
      const landTick = dry.tick;
      const press = landTick - before;
      for (let t = 0; t < landTick + 3; t++) sim.step(t === press ? Btn.JUMP : 0);
      worked.push(sim.player.vy < 0);
    }
    const last = worked.lastIndexOf(true);
    expect(worked[0]).toBe(true);
    expect(last).toBeGreaterThanOrEqual(tuning.bufferTicks - 2);
    expect(last).toBeLessThanOrEqual(tuning.bufferTicks + 1);
    expect(worked.slice(last + 1).every((w) => !w)).toBe(true);
  });
});

describe('ceilings', () => {
  it('bumps the head on a low ceiling and falls back down', () => {
    const world = withTiles(FLAT, [[5, 4, 8, '#']]); // ceiling bottom at y = 96, 32 px above the ground
    const sim = new Sim(makeLevel(world), 70, GROUND_Y);
    sim.run(2);
    let lowestHead = Infinity;
    for (let i = 0; i < 40; i++) {
      sim.step(Btn.JUMP);
      lowestHead = Math.min(lowestHead, sim.player.y - BODY_H);
    }
    expect(lowestHead).toBe(96);
    sim.run(60);
    expect(sim.player.onGround).toBe(true);
  });
});

describe('one-way platforms', () => {
  const world = withTiles(FLAT, [[6, 4, 8, '=']]); // platform top at y = 96, cols 4-8 (x 64..144)

  it('lets you jump up through from below and land on top', () => {
    const sim = new Sim(makeLevel(world), 100, GROUND_Y);
    sim.run(2);
    let wentAbove = false;
    for (let i = 0; i < 80; i++) {
      sim.step(i < 20 ? Btn.JUMP : 0);
      if (sim.player.y < 96) wentAbove = true;
    }
    expect(wentAbove).toBe(true);
    expect(sim.player.onGround).toBe(true);
    expect(sim.player.y).toBe(96);
  });

  it('lands on top when falling from above, and stays', () => {
    const sim = new Sim(makeLevel(world), 100, 40);
    expect(sim.until(() => sim.player.onGround)).toBe(true);
    expect(sim.player.y).toBe(96);
    sim.run(60);
    expect(sim.player.y).toBe(96);
  });

  it('never blocks sideways movement', () => {
    const sim = new Sim(makeLevel(world), 20, GROUND_Y);
    sim.run(2);
    sim.run(120, Btn.RIGHT);
    expect(sim.player.x).toBeGreaterThan(160);
    expect(sim.player.y).toBe(GROUND_Y);
  });

  it('does not catch a player whose feet are already below the platform top', () => {
    const sim = new Sim(makeLevel(world), 100, 108); // feet 12 px below the platform top, falling
    sim.run(2);
    sim.until(() => sim.player.onGround);
    expect(sim.player.y).toBe(GROUND_Y);
  });
});

describe('animation state', () => {
  it('idle, run, jump, fall', () => {
    const sim = new Sim(makeLevel(FLAT), 40, GROUND_Y);
    sim.run(3);
    expect(sim.player.anim).toBe('idle');
    sim.run(10, Btn.RIGHT);
    expect(sim.player.anim).toBe('run');
    sim.step(Btn.RIGHT | Btn.JUMP);
    expect(sim.player.anim).toBe('jump');
    sim.until(() => sim.player.vy > 0, Btn.RIGHT);
    expect(sim.player.anim).toBe('fall');
  });
});
