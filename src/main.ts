import { App, type SceneName } from './app.ts';
import { SCREEN_H, SCREEN_W } from './config.ts';
import { watchLayout } from './render/layout.ts';
import { registerServiceWorker } from './pwa/register.ts';

function sceneFromUrl(): SceneName {
  // Scene/manual selection is a dev/test convenience; the prod build ignores the query string.
  if (!__DEV_TOOLS__) return 'title';
  const scene = new URLSearchParams(window.location.search).get('scene');
  return scene === 'playing' || scene === 'testcard' ? scene : 'title';
}

function boot(): void {
  if (__DEV_TOOLS__) {
    // Catch errors thrown while booting, before the dev tools have loaded; the dev console shows them later.
    window.__earlyErrors = [];
    window.addEventListener('error', (e) => {
      window.__earlyErrors?.push(e.message);
    });
  }
  const canvas = document.querySelector<HTMLCanvasElement>('#game');
  if (!canvas) throw new Error('Missing #game canvas');
  canvas.width = SCREEN_W;
  canvas.height = SCREEN_H;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('2D canvas unavailable');

  const app = new App(canvas, ctx);
  app.goto(sceneFromUrl());
  app.render();
  watchLayout(canvas);
  registerServiceWorker();

  // Pause when the tab/app is hidden so nothing runs (or ticks forward) in the background.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) app.pause();
  });

  const manual = __APP_ENV__ === 'test' && new URLSearchParams(window.location.search).has('manual');
  if (__APP_ENV__ === 'test') {
    void import('./testhook.ts').then((m) => {
      m.installTestHook(app);
    });
  }
  if (!manual) app.start();

  if (__DEV_TOOLS__) {
    void import('./dev/devtools.ts').then((m) => {
      m.initDevTools(app);
    });
  }
}

boot();
