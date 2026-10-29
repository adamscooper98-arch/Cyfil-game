import type { App } from '../app.ts';
import { PausedScene } from '../scenes/paused.ts';
import { PlayingScene } from '../scenes/playing.ts';
import { TitleScene } from '../scenes/title.ts';
import { TestCardScene } from '../scenes/testcard.ts';
import { createConsolePanel } from './console.ts';
import { addEntry, installLogCapture } from './log.ts';
import { DEV_TOOLS_MARKER, createOverlay } from './overlay.ts';
import { createSpriteViewer } from './spriteViewer.ts';

export { DEV_TOOLS_MARKER };

function sceneName(app: App): string {
  const cur = app.scenes.current;
  if (cur instanceof TitleScene) return 'title';
  if (cur instanceof PlayingScene) return 'playing';
  if (cur instanceof PausedScene) return 'paused';
  if (cur instanceof TestCardScene) return 'testcard';
  return '?';
}

/** Dev menu: Console, Sprites. Opened by tapping the overlay, the backtick key, or a 3-finger tap. */
export function initDevTools(app: App): void {
  installLogCapture();
  for (const msg of window.__earlyErrors ?? []) addEntry('error', msg);

  const overlay = createOverlay(() => sceneName(app));
  const consolePanel = createConsolePanel();
  const sprites = createSpriteViewer(app.atlas);

  const toolbar = document.createElement('div');
  toolbar.className = 'dev-ui dev-toolbar';
  toolbar.hidden = true;
  const panels = [consolePanel, sprites];
  const show = (which: HTMLElement | null): void => {
    for (const p of panels) p.hidden = p !== which;
    if (which === consolePanel) which.dispatchEvent(new Event('dev-open'));
  };
  for (const [label, panel] of [
    ['Console', consolePanel],
    ['Sprites', sprites],
  ] as const) {
    const b = document.createElement('button');
    b.textContent = label;
    b.addEventListener('click', () => {
      show(panel.hidden ? panel : null);
    });
    toolbar.append(b);
  }
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

  document.body.append(overlay, toolbar, consolePanel, sprites);
}
