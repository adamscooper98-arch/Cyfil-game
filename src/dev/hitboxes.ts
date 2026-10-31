import type { Camera } from '../render/camera.ts';
import type { Renderer } from '../render/renderer.ts';
import type { World } from '../game/world.ts';
import { HALF_W, BODY_H } from '../game/collision.ts';

/** Present only in dev/test builds (checked by scripts/check-prod-bundle.ts). */
export const HITBOX_VIEWER_MARKER = 'CYFIL_HITBOX_VIEWER_MARKER';

/** Dev-only switches flipped from the dev menu. */
export const devFlags = { hitboxes: false, marker: HITBOX_VIEWER_MARKER };

function outline(r: Renderer, color: number, x: number, y: number, w: number, h: number): void {
  r.fillRect(color, x, y, w, 1);
  r.fillRect(color, x, y + h - 1, w, 1);
  r.fillRect(color, x, y, 1, h);
  r.fillRect(color, x + w - 1, y, 1, h);
}

/** Outlines every hurtbox (cyan: Cyfil, magenta: dummies) and the live attack box (lemon). Palette indexes 13, 16, 19. */
export function drawHitboxes(r: Renderer, world: World, cam: Camera): void {
  const p = world.player;
  outline(r, 13, Math.round(p.x - HALF_W - cam.px), Math.round(p.y - BODY_H - cam.py), HALF_W * 2, BODY_H);
  for (const d of world.dummies) {
    if (d.dead) continue;
    const b = d.hurtbox;
    outline(r, 16, Math.round(b.x - cam.px), Math.round(b.y - cam.py), b.w, b.h);
  }
  const a = world.combo.activeBox(p.x, p.y);
  if (a) outline(r, 19, Math.round(a.x - cam.px), Math.round(a.y - cam.py), a.w, a.h);
}
