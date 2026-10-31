import { describe, expect, it } from 'vitest';
import { DUMMY_HP } from '../../src/game/dummy.ts';
import { World } from '../../src/game/world.ts';
import { resetTuning, tuning } from '../../src/game/tuning.ts';
import { Btn, InputState } from '../../src/input/inputState.ts';
import { makeLevel } from '../support/sim.ts';

// Ground top at y = 128 (row 8). Player starts at column 1; the dummy stands `gap` columns in front.
const ROWS = [...Array.from({ length: 8 }, () => '.'.repeat(30)), '#'.repeat(30), '#'.repeat(30)];

function arena(dummyCol: number): World {
  resetTuning();
  const level = makeLevel(ROWS, [{ type: 'dummy', x: dummyCol, y: 7 }]);
  const w = new World(level);
  w.player.y = 128;
  return w;
}

class Driver {
  readonly input = new InputState();
  constructor(readonly world: World) {}
  step(mask = 0): void {
    this.input.update(mask);
    this.world.update(this.input);
  }
  run(ticks: number, mask = 0): void {
    for (let i = 0; i < ticks; i++) this.step(mask);
  }
  /** Step until `cond` holds; fails the test instead of hanging when it never does. */
  until(cond: () => boolean, max = 300): void {
    for (let i = 0; i < max && !cond(); i++) this.step();
    expect(cond(), `condition not reached within ${String(max)} ticks`).toBe(true);
  }
}

/** Dummy at column 3: its box starts 14 px past Cyfil's box edge, within reach. */
function adjacent(): Driver {
  const d = new Driver(arena(2)); // dummy x = 40, player x = 24
  d.run(5); // settle
  return d;
}

describe('attack on a training dummy', () => {
  it('a full 3-hit combo removes 1, 1, then 2 hit points', () => {
    const d = adjacent();
    const dummy = d.world.dummies[0];
    if (!dummy) throw new Error('no dummy');
    const seen: number[] = [];
    let last = dummy.hp;
    for (let t = 0; t < 90; t++) {
      d.step(t % 16 === 0 && t < 48 ? Btn.ATTACK : 0);
      if (dummy.hp !== last) {
        seen.push(last - dummy.hp);
        last = dummy.hp;
      }
    }
    expect(seen).toEqual([1, 1, 2]);
    expect(dummy.hp).toBe(DUMMY_HP - 4);
  });

  it('works in the air: the first hit lands while Cyfil is airborne', () => {
    const d = adjacent();
    d.world.player.y = 128 - 10; // fall from just above the ground
    d.world.player.onGround = false;
    const dummy = d.world.dummies[0];
    if (!dummy) throw new Error('no dummy');
    d.step(Btn.ATTACK);
    let airborneAtHit: boolean | null = null;
    for (let t = 0; t < 30 && airborneAtHit === null; t++) {
      d.step();
      if (dummy.hp < DUMMY_HP) airborneAtHit = !d.world.player.onGround;
    }
    expect(dummy.hp).toBe(DUMMY_HP - 1);
    expect(airborneAtHit).toBe(true);
  });

  it('a swing at empty air does nothing and breaks the chain', () => {
    const d = new Driver(arena(20)); // far away
    d.run(5);
    d.step(Btn.ATTACK);
    d.run(30);
    expect(d.world.dummies[0]?.hp).toBe(DUMMY_HP);
    expect(d.world.combo.isSwinging).toBe(false);
    expect(d.world.events).toHaveLength(0);
  });

  it('does not hit a dummy standing behind Cyfil', () => {
    const d = adjacent();
    d.world.player.facing = -1;
    d.step(Btn.ATTACK);
    d.run(30);
    expect(d.world.dummies[0]?.hp).toBe(DUMMY_HP);
  });

  it('a hit freezes the simulation for 3 ticks, and the dummy is knocked away', () => {
    const d = adjacent();
    const dummy = d.world.dummies[0];
    if (!dummy) throw new Error('no dummy');
    const x0 = dummy.x;
    d.step(Btn.ATTACK);
    d.until(() => dummy.hp < DUMMY_HP);
    const ticksAtHit = d.world.ticks;
    d.run(3);
    expect(d.world.ticks).toBe(ticksAtHit); // three frozen ticks
    d.step();
    expect(d.world.ticks).toBe(ticksAtHit + 1);
    d.run(10);
    expect(dummy.x).toBeGreaterThan(x0);
  });

  it('a killing blow freezes for 6 ticks, emits a kill event, and the dummy stands back up later', () => {
    const d = adjacent();
    const dummy = d.world.dummies[0];
    if (!dummy) throw new Error('no dummy');
    dummy.hp = 1;
    d.step(Btn.ATTACK);
    let kill = false;
    d.until(() => {
      if (d.world.events.some((e) => e.kill)) kill = true;
      return dummy.dead;
    });
    expect(kill).toBe(true);
    const ticksAtHit = d.world.ticks;
    d.run(6);
    expect(d.world.ticks).toBe(ticksAtHit);
    d.step();
    expect(d.world.ticks).toBe(ticksAtHit + 1);
    d.run(100);
    expect(dummy.dead).toBe(false);
    expect(dummy.hp).toBe(DUMMY_HP);
  });

  /** Land the first hit, wait out the freeze plus `wait` live ticks, then press Attack once. Returns hp after 30 more ticks. */
  function pressLater(wait: number): number {
    const d = adjacent();
    const dummy = d.world.dummies[0];
    if (!dummy) throw new Error('no dummy');
    d.step(Btn.ATTACK);
    d.until(() => dummy.hp < DUMMY_HP);
    d.run(tuning.hitstopHit + wait);
    d.step(Btn.ATTACK);
    d.run(30);
    return dummy.hp;
  }

  it('an Attack press shortly before the swing ends is remembered and chains', () => {
    expect(pressLater(6)).toBeLessThanOrEqual(DUMMY_HP - 2); // swing has ~5 ticks left, buffer is 6
  });

  it('an Attack press much earlier than that is dropped (buffer is bufferTicks long)', () => {
    expect(pressLater(0)).toBe(DUMMY_HP - 1);
  });

  it('a knocked-out dummy cannot be hit again until it stands back up', () => {
    const d = adjacent();
    const dummy = d.world.dummies[0];
    if (!dummy) throw new Error('no dummy');
    dummy.hp = 1;
    d.step(Btn.ATTACK);
    d.until(() => dummy.dead);
    let extra = 0;
    for (let t = 0; t < 40; t++) {
      d.step(t % 16 === 0 ? Btn.ATTACK : 0);
      extra += d.world.events.length;
    }
    expect(extra).toBe(0);
    expect(dummy.hp).toBe(0);
  });

  it('respawning clears the combo', () => {
    const d = adjacent();
    d.step(Btn.ATTACK);
    d.world.respawnPlayer();
    expect(d.world.combo.isSwinging).toBe(false);
  });
});

describe('combat tuning is live', () => {
  it('a larger hit-3 damage value changes the third hit', () => {
    const d = adjacent();
    tuning.comboDamage3 = 5;
    const dummy = d.world.dummies[0];
    if (!dummy) throw new Error('no dummy');
    for (let t = 0; t < 90; t++) d.step(t % 16 === 0 && t < 48 ? Btn.ATTACK : 0);
    expect(dummy.hp).toBe(DUMMY_HP - 7);
  });
});
