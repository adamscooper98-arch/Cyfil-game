/**
 * What the game sees each tick: a bitmask of held buttons plus the edges (pressed/released this tick).
 * Keyboard, touch, replays and tests all produce the same mask, so game code never knows the source.
 */
export const Btn = {
  LEFT: 1 << 0,
  RIGHT: 1 << 1,
  UP: 1 << 2,
  DOWN: 1 << 3,
  JUMP: 1 << 4,
  ATTACK: 1 << 5,
  ABILITY: 1 << 6,
  ULTIMATE: 1 << 7,
  PAUSE: 1 << 8,
  /** Title/pause "confirm": Enter, Space, or any tap. */
  CONFIRM: 1 << 9,
} as const;

export const BTN_NAMES = Object.keys(Btn) as (keyof typeof Btn)[];

export class InputState {
  held = 0;
  pressed = 0;
  released = 0;

  /** Feed this tick's raw mask; computes the edges. Call exactly once per game update, before the scenes update. */
  update(raw: number): void {
    this.pressed = raw & ~this.held;
    this.released = this.held & ~raw;
    this.held = raw;
  }

  isHeld(b: number): boolean {
    return (this.held & b) !== 0;
  }

  wasPressed(b: number): boolean {
    return (this.pressed & b) !== 0;
  }

  wasReleased(b: number): boolean {
    return (this.released & b) !== 0;
  }

  reset(): void {
    this.held = 0;
    this.pressed = 0;
    this.released = 0;
  }
}
