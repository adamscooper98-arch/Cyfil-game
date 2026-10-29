import { SCREEN_H, SCREEN_W } from './config.ts';
import { watchLayout } from './render/layout.ts';
import { registerServiceWorker } from './pwa/register.ts';
import { drawTestCard } from './testcard.ts';

function boot(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#game');
  if (!canvas) throw new Error('Missing #game canvas');
  canvas.width = SCREEN_W;
  canvas.height = SCREEN_H;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('2D canvas unavailable');

  drawTestCard(ctx);
  watchLayout(canvas);
  registerServiceWorker();

  if (__DEV_TOOLS__) {
    void import('./dev/devtools.ts').then((m) => {
      m.initDevTools();
    });
  }
}

boot();
