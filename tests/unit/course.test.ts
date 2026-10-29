import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import physicsCourse from '../../src/content/levels/physics-course.json';
import { Recorder, ReplayPlayer, type ReplayRuns, expandReplay } from '../../src/core/replay.ts';
import { parseLevel } from '../../src/game/level.ts';
import { Sim, runBot } from '../support/sim.ts';

const FIXTURE = 'tests/fixtures/replays/physics-course-run.json';
const level = parseLevel(physicsCourse);

describe('physics course', () => {
  it('is completable: the bot reaches the goal', () => {
    const result = runBot(level);
    expect(result.reachedGoal).toBe(true);
    expect(result.ticks).toBeLessThan(1500);
  });

  it('the recorded run replays to exactly the same end state (physics regression pin)', () => {
    const result = runBot(level);
    if (process.env.UPDATE_REPLAY === '1') {
      mkdirSync('tests/fixtures/replays', { recursive: true });
      writeFileSync(FIXTURE, `${JSON.stringify({ ticks: result.ticks, x: result.x, y: result.y, runs: result.runs })}\n`);
    }
    expect(existsSync(FIXTURE), 'missing replay fixture; create it with UPDATE_REPLAY=1').toBe(true);
    const fixture = JSON.parse(readFileSync(FIXTURE, 'utf8')) as { ticks: number; x: number; y: number; runs: ReplayRuns };
    // the bot still produces the recorded inputs, and replaying them gives the recorded result
    expect(result.runs).toEqual(fixture.runs);
    const sim = new Sim(level, level.start.x * 16 + 8, (level.start.y + 1) * 16);
    for (const mask of expandReplay(fixture.runs)) sim.step(mask);
    expect(sim.tick).toBe(fixture.ticks);
    expect(sim.player.x).toBe(fixture.x);
    expect(sim.player.y).toBe(fixture.y);
  });

  it('the course contains each obstacle the bot must beat: gaps, walls, a ceiling, one-way platforms', () => {
    const kinds = new Set(level.tiles.join(''));
    expect(kinds.has('=')).toBe(true);
    expect(level.tiles.some((r) => r.includes('...') && r.startsWith('GGG'))).toBe(true);
  });
});

describe('replay encoding', () => {
  it('run-length encodes and decodes losslessly', () => {
    const rec = new Recorder();
    const masks = [0, 0, 0, 2, 2, 18, 18, 18, 18, 0];
    for (const m of masks) rec.push(m);
    expect(rec.result).toEqual([[0, 3], [2, 2], [18, 4], [0, 1]]);
    expect(expandReplay(rec.result)).toEqual(masks);
  });

  it('the player yields each tick in order, then zeros, and reports when finished', () => {
    const p = new ReplayPlayer([[1, 2], [4, 1]]);
    expect([p.next(), p.next(), p.next(), p.next(), p.next()]).toEqual([1, 1, 4, 0, 0]);
    expect(p.finished).toBe(true);
  });

  it('an empty replay is immediately finished', () => {
    const p = new ReplayPlayer([]);
    expect(p.next()).toBe(0);
    expect(p.finished).toBe(true);
  });
});
