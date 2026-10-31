import { beforeEach, describe, expect, it } from 'vitest';
import { Combo, Hitstop, overlaps } from '../../src/game/combat.ts';
import { DEFAULT_TUNING, resetTuning, tuning } from '../../src/game/tuning.ts';

beforeEach(resetTuning);

/** Run ticks with no input. */
function wait(c: Combo, n: number): void {
  for (let i = 0; i < n; i++) c.tick();
}

/** Start a swing, run it to its end (landing a hit on its first active tick if asked), and return the stage it was. */
function swing(c: Combo, lands: boolean): number {
  expect(c.press(1)).toBe(true);
  const stage = c.stage;
  for (let i = 0; i < tuning.swingTicks; i++) {
    c.tick();
    if (lands && c.activeBox(100, 100) && !c.landed) c.land();
  }
  return stage;
}

describe('overlaps', () => {
  it('detects overlap and treats touching edges as a miss', () => {
    const a = { x: 0, y: 0, w: 10, h: 10 };
    expect(overlaps(a, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
    expect(overlaps(a, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
    expect(overlaps(a, { x: 0, y: 10, w: 10, h: 10 })).toBe(false);
    expect(overlaps(a, { x: -10, y: 0, w: 10, h: 10 })).toBe(false);
    expect(overlaps(a, { x: 9.5, y: 9.5, w: 1, h: 1 })).toBe(true);
  });
});

describe('combat defaults', () => {
  it('match DESIGN 3.3', () => {
    expect(DEFAULT_TUNING).toMatchObject({
      comboWindow: 18,
      comboDamage1: 1,
      comboDamage2: 1,
      comboDamage3: 2,
      hitstopHit: 3,
      hitstopKill: 6,
    });
  });
});

describe('combo chain', () => {
  it('deals 1, 1, 2 in a chain of landed hits', () => {
    const c = new Combo();
    const dmg: number[] = [];
    for (let i = 0; i < 3; i++) {
      expect(c.press(1)).toBe(true);
      dmg.push(c.damage);
      for (let t = 0; t < tuning.swingTicks; t++) {
        c.tick();
        if (c.activeBox(100, 100) && !c.landed) c.land();
      }
    }
    expect(dmg).toEqual([1, 1, 2]);
  });

  it('chains when pressed exactly comboWindow ticks after the hit, and not one tick later', () => {
    for (const [gap, expectedStage] of [
      [18, 1],
      [19, 0],
    ] as const) {
      const c = new Combo();
      swing(c, true); // swing is over by now; the window started at the landing tick
      const sinceLanding = tuning.swingTicks - c.landTick;
      // bring the time since landing to exactly `gap`
      wait(c, gap - sinceLanding);
      expect(c.press(1)).toBe(true);
      expect(c.stage, `gap ${String(gap)}`).toBe(expectedStage);
    }
  });

  it('the third hit ends the chain: the next press starts a new one', () => {
    const c = new Combo();
    swing(c, true);
    swing(c, true);
    expect(swing(c, true)).toBe(2);
    expect(c.press(1)).toBe(true);
    expect(c.stage).toBe(0);
  });

  it('a whiffed swing breaks the chain, even when the window would still be open', () => {
    tuning.comboWindow = 40; // otherwise the window runs out during the whiff anyway and hides the rule
    const c = new Combo();
    swing(c, true);
    expect(swing(c, false)).toBe(1); // chained, but landed nothing
    expect(c.press(1)).toBe(true);
    expect(c.stage).toBe(0);
  });

  it('ignores a press while a swing is in progress', () => {
    const c = new Combo();
    expect(c.press(1)).toBe(true);
    c.tick();
    expect(c.press(1)).toBe(false);
    expect(c.stage).toBe(0);
  });

  it('only one hit per swing, and the hitbox is live only during the active ticks', () => {
    const c = new Combo();
    c.press(1);
    const live: boolean[] = [];
    for (let t = 0; t < tuning.swingTicks; t++) {
      c.tick();
      live.push(c.activeBox(100, 100) !== null);
    }
    expect(live.indexOf(true)).toBe(tuning.activeFrom - 1);
    expect(live.lastIndexOf(true)).toBe(tuning.activeTo - 1);
    expect(live.slice(0, tuning.activeFrom - 1).some(Boolean)).toBe(false);
    expect(live.slice(tuning.activeTo).some(Boolean)).toBe(false);

    const d = new Combo();
    d.press(1);
    for (let t = 0; t < tuning.activeFrom; t++) d.tick();
    expect(d.activeBox(100, 100)).not.toBeNull();
    d.land();
    expect(d.activeBox(100, 100)).toBeNull();
  });

  it('puts the hitbox in front of Cyfil on either side', () => {
    const right = new Combo();
    right.press(1);
    for (let t = 0; t < tuning.activeFrom; t++) right.tick();
    const rb = right.activeBox(100, 100);
    const left = new Combo();
    left.press(-1);
    for (let t = 0; t < tuning.activeFrom; t++) left.tick();
    const lb = left.activeBox(100, 100);
    expect(rb).not.toBeNull();
    expect(lb).not.toBeNull();
    expect(rb?.x).toBeGreaterThanOrEqual(100);
    expect((lb?.x ?? 0) + (lb?.w ?? 0)).toBeLessThanOrEqual(100);
    expect(rb?.w).toBe(lb?.w);
  });
});

describe('hitstop', () => {
  it('freezes the sim for 3 ticks on a hit and 6 on a kill', () => {
    for (const [kill, n] of [
      [false, 3],
      [true, 6],
    ] as const) {
      const h = new Hitstop();
      expect(h.step()).toBe(false);
      h.start(kill);
      const frozen: boolean[] = [];
      for (let i = 0; i < n + 2; i++) frozen.push(h.step());
      expect(frozen.filter(Boolean).length).toBe(n);
      expect(frozen.slice(0, n).every(Boolean)).toBe(true);
    }
  });

  it('a short freeze never shortens a longer one', () => {
    const h = new Hitstop();
    h.start(true);
    h.start(false);
    let n = 0;
    while (h.step()) n++;
    expect(n).toBe(6);
  });
});

describe('knockback', () => {
  it('only the third hit launches; the first two flinch', () => {
    const c = new Combo();
    const kb: number[] = [];
    for (let i = 0; i < 3; i++) {
      swing(c, true);
      kb.push(c.knockback);
    }
    expect(kb[0]).toBeLessThan(tuning.knockback);
    expect(kb[1]).toBe(kb[0]);
    expect(kb[2]).toBe(tuning.knockback);
  });
});
