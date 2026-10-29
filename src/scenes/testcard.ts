import { drawTestCard } from '../testcard.ts';
import type { GameContext, Scene } from './scene.ts';

/** The palette test card from M0, kept as a diagnostic scene (reachable with ?scene=testcard in non-prod builds). */
export class TestCardScene implements Scene {
  constructor(private readonly ctx: GameContext) {}

  update(): void {
    // static
  }

  render(): void {
    drawTestCard(this.ctx.r.ctx);
  }
}
