import { App, type SceneName } from './app.ts';
import { DEFAULT_LEVEL } from './app-constants.ts';
import { SCREEN_H, SCREEN_W } from './config.ts';
import { watchLayout } from './render/layout.ts';
import { registerServiceWorker } from './pwa/register.ts';
import { TouchControls } from './ui/touchControls.ts';

interface Start {
  scene: SceneName;
  level: string;
  touch: boolean;
}

function startFromUrl(): Start {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  // Scene/level/touch selection is a dev/test convenience; the prod build ignores the query string.
  if (!__DEV_TOOLS__) return { scene: 'title', level: DEFAULT_LEVEL, touch: coarse };
  const q = new URLSearchParams(window.location.search);
  const scene = q.get('scene');
  return {
    scene: scene === 'playing' || scene === 'testcard' ? scene : 'title',
    level: q.get('level') ?? DEFAULT_LEVEL,
    touch: coarse || q.has('touch'),
  };
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

  const start = startFromUrl();
  const app = new App(ctx);
  if (start.touch) {
    app.attachTouch(new TouchControls(document.body));
    document.body.classList.add('touch-ui');
  }
  app.goto(start.scene, start.level);
  app.render();
  watchLayout(canvas, () => {
    app.releaseInputs();
  });
  registerServiceWorker();

  // Pause when the tab/app is hidden so nothing runs (or ticks forward) in the background.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      app.releaseInputs();
      app.pause();
    }
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
