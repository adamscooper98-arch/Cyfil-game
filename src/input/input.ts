/**
 * M1 input: keyboard plus a throwaway "move toward where you touch" pointer scheme so the scrolling world can
 * be checked on a phone. M2 replaces this with the real InputState, touch pad and buttons (DESIGN §5.6).
 */
const GAME_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter']);
const DEAD_ZONE = 0.3;

export class Input {
  private readonly down = new Set<string>();
  private readonly pressed = new Set<string>();
  private readonly pointers = new Map<number, { nx: number; ny: number }>();
  private tapped = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      if (GAME_KEYS.has(e.code)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.code);
      this.down.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.down.delete(e.code);
    });
    window.addEventListener('blur', () => {
      this.releaseAll();
    });

    const track = (e: PointerEvent): void => {
      if (e.target instanceof Element && e.target.closest('.dev-ui')) return;
      const rect = this.canvas.getBoundingClientRect();
      this.pointers.set(e.pointerId, {
        nx: (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2),
        ny: (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2),
      });
    };
    window.addEventListener('pointerdown', (e) => {
      if (e.target instanceof Element && e.target.closest('.dev-ui')) return;
      this.tapped = true;
      track(e);
    });
    window.addEventListener('pointermove', (e) => {
      if (this.pointers.has(e.pointerId)) track(e);
    });
    const end = (e: PointerEvent): void => {
      this.pointers.delete(e.pointerId);
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }

  private pointerDir(axis: 'nx' | 'ny', sign: 1 | -1): boolean {
    for (const p of this.pointers.values()) if (p[axis] * sign > DEAD_ZONE) return true;
    return false;
  }

  get left(): boolean {
    return this.down.has('ArrowLeft') || this.down.has('KeyA') || this.pointerDir('nx', -1);
  }
  get right(): boolean {
    return this.down.has('ArrowRight') || this.down.has('KeyD') || this.pointerDir('nx', 1);
  }
  get up(): boolean {
    return this.down.has('ArrowUp') || this.down.has('KeyW') || this.pointerDir('ny', -1);
  }
  get downHeld(): boolean {
    return this.down.has('ArrowDown') || this.down.has('KeyS') || this.pointerDir('ny', 1);
  }

  /** True for exactly one update after Enter/Space or a tap. */
  confirmPressed(): boolean {
    return this.pressed.has('Enter') || this.pressed.has('Space') || this.tapped;
  }

  pausePressed(): boolean {
    return this.pressed.has('Escape') || this.pressed.has('KeyP');
  }

  /** Call once after every update so "pressed" events last exactly one tick. */
  endTick(): void {
    this.pressed.clear();
    this.tapped = false;
  }

  releaseAll(): void {
    this.down.clear();
    this.pointers.clear();
  }

  /** Test hook: set held keys directly. */
  setHeld(codes: readonly string[]): void {
    this.down.clear();
    for (const c of codes) this.down.add(c);
  }

  /** Test hook: simulate a one-tick key press (Enter, Escape...). */
  pressOnce(code: string): void {
    this.pressed.add(code);
  }
}
