import { Btn } from '../input/inputState.ts';

/** CSS pixels of finger travel before the pad registers a direction. */
export const PAD_DEAD_ZONE = 10;
/** Travel beyond this drags the pad's origin along, so reversing direction never needs a long swipe back. */
export const PAD_MAX_TRAVEL = 36;
/** Vertical travel for UP/DOWN. */
export const PAD_VERTICAL = 28;

interface ButtonSpec {
  readonly btn: number;
  readonly cls: string;
  readonly label: string;
}

const BUTTONS: readonly ButtonSpec[] = [
  { btn: Btn.JUMP, cls: 'tbtn-jump', label: 'JUMP' },
  { btn: Btn.ATTACK, cls: 'tbtn-attack', label: 'HIT' },
  { btn: Btn.ABILITY, cls: 'tbtn-ability', label: 'SKILL' },
  { btn: Btn.ULTIMATE, cls: 'tbtn-ultimate', label: 'ULT' },
];

function capture(el: Element, id: number): void {
  try {
    el.setPointerCapture(id);
  } catch {
    // synthetic or already-ended pointers cannot be captured; the events still work
  }
}

/**
 * On-screen controls: a floating slide pad (touch anywhere in the zone and slide; the pad centers where you first
 * touch) plus JUMP / HIT / SKILL / ULT buttons and a small pause button. Multi-touch by pointerId.
 * Where the zones sit is pure CSS (portrait: below the game; landscape: in the side gutters).
 */
export class TouchControls {
  readonly root: HTMLElement;
  private readonly padZone: HTMLElement;
  private readonly ring: HTMLElement;
  private readonly dot: HTMLElement;
  private padPointer: number | null = null;
  private padRect: DOMRect | null = null;
  private origin = { x: 0, y: 0 };
  private cur = { x: 0, y: 0 };
  private readonly buttonPointers = new Map<number, Set<number>>();
  /** Buttons pressed since the last sample, even if already released (a tap shorter than one tick still counts). */
  private latched = 0;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.id = 'controls';
    this.root.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    this.padZone = document.createElement('div');
    this.padZone.className = 'pad-zone';
    const hint = document.createElement('div');
    hint.className = 'pad-hint';
    hint.textContent = 'SLIDE TO MOVE';
    this.ring = document.createElement('div');
    this.ring.className = 'pad-ring';
    this.ring.hidden = true;
    this.dot = document.createElement('div');
    this.dot.className = 'pad-dot';
    this.dot.hidden = true;
    this.padZone.append(hint, this.ring, this.dot);
    this.bindPad();

    const cluster = document.createElement('div');
    cluster.className = 'btn-cluster';
    for (const spec of BUTTONS) cluster.append(this.makeButton(spec.btn, `tbtn ${spec.cls}`, spec.label));

    const pause = this.makeButton(Btn.PAUSE, 'tbtn tbtn-pause', 'II');
    this.root.append(this.padZone, cluster, pause);
    parent.append(this.root);
  }

  private makeButton(btn: number, cls: string, label: string): HTMLElement {
    const el = document.createElement('div');
    el.className = cls;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', label);
    el.textContent = label;
    const pointers = new Set<number>();
    this.buttonPointers.set(btn, pointers);
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      capture(el, e.pointerId);
      pointers.add(e.pointerId);
      this.latched |= btn;
      el.classList.add('down');
    });
    const up = (e: PointerEvent): void => {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) el.classList.remove('down');
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    return el;
  }

  private bindPad(): void {
    const z = this.padZone;
    z.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.padPointer !== null) return;
      capture(z, e.pointerId);
      this.padPointer = e.pointerId;
      this.padRect = z.getBoundingClientRect();
      this.origin = { x: e.clientX, y: e.clientY };
      this.cur = { x: e.clientX, y: e.clientY };
      this.ring.hidden = false;
      this.dot.hidden = false;
      this.drawPad();
    });
    z.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.padPointer) return;
      this.cur = { x: e.clientX, y: e.clientY };
      const dx = this.cur.x - this.origin.x;
      if (dx > PAD_MAX_TRAVEL) this.origin.x = this.cur.x - PAD_MAX_TRAVEL;
      else if (dx < -PAD_MAX_TRAVEL) this.origin.x = this.cur.x + PAD_MAX_TRAVEL;
      const dy = this.cur.y - this.origin.y;
      if (dy > PAD_MAX_TRAVEL) this.origin.y = this.cur.y - PAD_MAX_TRAVEL;
      else if (dy < -PAD_MAX_TRAVEL) this.origin.y = this.cur.y + PAD_MAX_TRAVEL;
      this.drawPad();
    });
    const end = (e: PointerEvent): void => {
      if (e.pointerId === this.padPointer) this.releasePad();
    };
    z.addEventListener('pointerup', end);
    z.addEventListener('pointercancel', end);
    z.addEventListener('lostpointercapture', end);
  }

  private drawPad(): void {
    const r = this.padRect;
    if (!r) return;
    this.ring.style.left = `${String(this.origin.x - r.left)}px`;
    this.ring.style.top = `${String(this.origin.y - r.top)}px`;
    this.dot.style.left = `${String(this.cur.x - r.left)}px`;
    this.dot.style.top = `${String(this.cur.y - r.top)}px`;
  }

  private releasePad(): void {
    this.padPointer = null;
    this.ring.hidden = true;
    this.dot.hidden = true;
  }

  /** Raw button mask for this tick. */
  sample(): number {
    let mask = 0;
    if (this.padPointer !== null) {
      const dx = this.cur.x - this.origin.x;
      const dy = this.cur.y - this.origin.y;
      if (dx < -PAD_DEAD_ZONE) mask |= Btn.LEFT;
      if (dx > PAD_DEAD_ZONE) mask |= Btn.RIGHT;
      if (dy > PAD_VERTICAL) mask |= Btn.DOWN;
      if (dy < -PAD_VERTICAL) mask |= Btn.UP;
    }
    for (const [btn, pointers] of this.buttonPointers) if (pointers.size > 0) mask |= btn;
    mask |= this.latched;
    this.latched = 0;
    return mask;
  }

  /** Let go of everything (rotation, app backgrounded, pause): no stuck inputs. */
  releaseAll(): void {
    this.releasePad();
    this.latched = 0;
    for (const set of this.buttonPointers.values()) set.clear();
    for (const el of this.root.querySelectorAll('.down')) el.classList.remove('down');
  }
}
