import { HALF_W, tileKind } from '../../src/game/collision.ts';
import { type Level, TILE, parseLevel } from '../../src/game/level.ts';
import { Player } from '../../src/game/player.ts';
import { resetTuning } from '../../src/game/tuning.ts';
import { Recorder, type ReplayRuns } from '../../src/core/replay.ts';
import { Btn, InputState } from '../../src/input/inputState.ts';

/** Build a small level from ASCII rows: '.' empty, '#' solid ground, '=' one-way platform. */
export function makeLevel(rows: readonly string[]): Level {
  const width = rows[0]?.length ?? 0;
  return parseLevel({
    format: 1,
    id: 'test',
    name: 'Test',
    tileset: 'scrapyard',
    width,
    height: rows.length,
    legend: { '.': 'empty', '#': 'ground', '=': 'platform_oneway' },
    tiles: rows,
    entities: [
      { type: 'playerStart', x: 1, y: 0 },
      { type: 'goal', x: Math.max(0, width - 2), y: 0 },
    ],
  });
}

/** A player plus input state, stepped one tick at a time with explicit button masks. */
export class Sim {
  readonly player: Player;
  readonly input = new InputState();
  tick = 0;

  constructor(
    readonly level: Level,
    x: number,
    y: number,
  ) {
    resetTuning();
    this.player = new Player(x, y);
  }

  step(mask = 0): void {
    this.input.update(mask);
    this.player.update(this.input, this.level);
    this.tick++;
  }

  run(ticks: number, mask = 0): void {
    for (let i = 0; i < ticks; i++) this.step(mask);
  }

  /** Step until `cond` holds (or give up after `max` ticks). Returns true if it held. */
  until(cond: () => boolean, mask = 0, max = 600): boolean {
    for (let i = 0; i < max; i++) {
      if (cond()) return true;
      this.step(mask);
    }
    return cond();
  }
}

export interface BotResult {
  readonly runs: ReplayRuns;
  readonly ticks: number;
  readonly reachedGoal: boolean;
  readonly x: number;
  readonly y: number;
}

/**
 * A simple reactive player: runs right, jumps at ledges and walls, and holds jump while rising.
 * Used to prove a level is completable and to record a replay for end-to-end tests.
 */
export function runBot(level: Level, maxTicks = 3000): BotResult {
  resetTuning();
  const start = level.start;
  const player = new Player(start.x * TILE + TILE / 2, (start.y + 1) * TILE);
  const goal = level.entities.find((e) => e.type === 'goal');
  const goalX = goal ? goal.x * TILE + TILE / 2 : Infinity;
  const input = new InputState();
  const rec = new Recorder();
  let prev = 0;
  let ticks = 0;
  let reached = false;

  for (; ticks < maxTicks && !reached; ticks++) {
    let mask: number = Btn.RIGHT;
    const feetRow = Math.floor(player.y / TILE);
    const aheadCol = Math.floor((player.x + HALF_W + 2) / TILE);
    const groundAhead = ['solid', 'oneway'].includes(tileKind(level, aheadCol, feetRow));
    const wallAhead = tileKind(level, aheadCol, Math.floor((player.y - 4) / TILE)) === 'solid';
    if (player.onGround && (!groundAhead || wallAhead)) mask |= Btn.JUMP;
    else if (!player.onGround && (prev & Btn.JUMP) !== 0 && player.vy < 0) mask |= Btn.JUMP;
    prev = mask;

    rec.push(mask);
    input.update(mask);
    player.update(input, level);
    if (Math.abs(player.x - goalX) < 10) reached = true;
  }
  return { runs: rec.result, ticks, reachedGoal: reached, x: player.x, y: player.y };
}
