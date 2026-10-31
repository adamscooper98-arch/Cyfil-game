import type { App } from '../app.ts';
import { PausedScene } from '../scenes/paused.ts';
import { PlayingScene } from '../scenes/playing.ts';
import { TestCardScene } from '../scenes/testcard.ts';
import { TitleScene } from '../scenes/title.ts';
import { devFlags } from './hitboxes.ts';
import { createConsolePanel } from './console.ts';
import { addEntry, installLogCapture } from './log.ts';
import { DEV_TOOLS_MARKER, createOverlay } from './overlay.ts';
import { createSpriteViewer } from './spriteViewer.ts';
import { createTuningPanel, loadSavedTuning } from './tuningPanel.ts';

export { DEV_TOOLS_MARKER };

function sceneName(app: App): string {
  const cur = app.scenes.current;
  if (cur instanceof TitleScene) return 'title';
  if (cur instanceof PlayingScene) return 'playing';
  if (cur instanceof PausedScene) return 'paused';
  if (cur instanceof TestCardScene) return 'testcard';
  return '?';
}

/** Dev menu: Console, Sprites, Tuning. Opened by tapping the overlay, the backtick key, or a 3-finger tap. */
export function initDevTools(app: App): void {
  installLogCapture();
  for (const msg of window.__earlyErrors ?? []) addEntry('error', msg);
  loadSavedTuning();
  console.info(`Cyfil ${__APP_ENV__} build ${__COMMIT__} booted on ${navigator.userAgent.slice(0, 80)}`);

  const overlay = createOverlay(
    () => sceneName(app),
    () => app.debugLine(),
  );
  const consolePanel = createConsolePanel();
  const sprites = createSpriteViewer(app.atlas);
  const tuningPanel = createTuningPanel();

  const toolbar = document.createElement('div');
  toolbar.className = 'dev-ui dev-toolbar';
  toolbar.hidden = true;
  const panels = [consolePanel, sprites, tuningPanel];
  const show = (which: HTMLElement | null): void => {
    for (const p of panels) p.hidden = p !== which;
    which?.dispatchEvent(new Event('dev-open'));
  };
  for (const [label, panel] of [
    ['Console', consolePanel],
    ['Sprites', sprites],
    ['Tuning', tuningPanel],
  ] as const) {
    const b = document.createElement('button');
    b.textContent = label;
    b.addEventListener('click', () => {
      show(panel.hidden ? panel : null);
    });
    toolbar.append(b);
  }
  const action = (label: string, run: (b: HTMLButtonElement) => void): void => {
    const b = document.createElement('button');
    b.textContent = label;
    b.addEventListener('click', () => {
      run(b);
    });
    toolbar.append(b);
  };
  action('Hitboxes: off', (b) => {
    devFlags.hitboxes = !devFlags.hitboxes;
    b.textContent = `Hitboxes: ${devFlags.hitboxes ? 'on' : 'off'}`;
  });
  action('Arena', () => {
    app.goto('playing', 'combat-arena');
  });
  action('Course', () => {
    app.goto('playing', 'physics-course');
  });
  const close = document.createElement('button');
  close.textContent = 'Close';
  close.addEventListener('click', () => {
    show(null);
    toolbar.hidden = true;
  });
  toolbar.append(close);

  const toggle = (): void => {
    toolbar.hidden = !toolbar.hidden;
    if (toolbar.hidden) show(null);
  };
  overlay.addEventListener('click', toggle);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Backquote') toggle();
  });
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 3) toggle();
  });

  document.body.append(overlay, toolbar, consolePanel, sprites, tuningPanel);
}
