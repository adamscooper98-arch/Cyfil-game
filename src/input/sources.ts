import { Btn } from './inputState.ts';

const KEY_MAP: Readonly<Record<string, number>> = {
  ArrowLeft: Btn.LEFT,
  KeyA: Btn.LEFT,
  ArrowRight: Btn.RIGHT,
  KeyD: Btn.RIGHT,
  ArrowUp: Btn.UP,
  KeyW: Btn.UP,
  ArrowDown: Btn.DOWN,
  KeyS: Btn.DOWN,
  Space: Btn.JUMP | Btn.CONFIRM,
  KeyZ: Btn.JUMP,
  KeyX: Btn.ATTACK,
  KeyC: Btn.ABILITY,
  KeyV: Btn.ULTIMATE,
  Escape: Btn.PAUSE,
  KeyP: Btn.PAUSE,
  Enter: Btn.CONFIRM,
};
const PREVENT_DEFAULT = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter']);

/** Any tap/click anywhere (outside dev UI) becomes CONFIRM for exactly one tick: start from the title, resume from pause. */
export class TapSource {
  private tapped = false;

  attach(target: Window): void {
    target.addEventListener('pointerdown', (e) => {
      if (e.target instanceof Element && e.target.closest('.dev-ui')) return;
      this.tapped = true;
    });
  }

  sample(): number {
    const mask = this.tapped ? Btn.CONFIRM : 0;
    this.tapped = false;
    return mask;
  }
}

/** Keyboard plus a few hooks tests use to inject input. Produces a raw button mask on demand. */
export class KeyboardSource {
  private readonly down = new Set<string>();
  /** Buttons pressed since the last sample, even if already released: a tap shorter than one tick must still count. */
  private pendingPress = 0;

  attach(target: Window): void {
    target.addEventListener('keydown', (e) => {
      if (e.code in KEY_MAP) {
        if (PREVENT_DEFAULT.has(e.code)) e.preventDefault();
        this.down.add(e.code);
        if (!e.repeat) this.pendingPress |= KEY_MAP[e.code] ?? 0;
      }
    });
    target.addEventListener('keyup', (e) => {
      this.down.delete(e.code);
    });
    target.addEventListener('blur', () => {
      this.releaseAll();
    });
  }

  sample(): number {
    let mask = this.pendingPress;
    this.pendingPress = 0;
    for (const code of this.down) mask |= KEY_MAP[code] ?? 0;
    return mask;
  }

  releaseAll(): void {
    this.down.clear();
    this.pendingPress = 0;
  }

  /** Test hook: replace the set of held keys. */
  setHeld(codes: readonly string[]): void {
    this.down.clear();
    for (const c of codes) if (c in KEY_MAP) this.down.add(c);
  }

  /** Test hook: press a key for exactly one tick. */
  pressOnce(code: string): void {
    this.pendingPress |= KEY_MAP[code] ?? 0;
  }
}
