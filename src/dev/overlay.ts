import { perf } from '../core/perf.ts';
import { recentErrors } from './log.ts';

export const DEV_TOOLS_MARKER = 'CYFIL_DEV_TOOLS_MARKER';

/** Always-visible dev readout: environment, commit, FPS, frame cost, last errors. Tap it to open the dev menu. */
export function createOverlay(sceneName: () => string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'dev-ui dev-overlay';
  el.dataset.marker = DEV_TOOLS_MARKER;

  const refresh = (): void => {
    const lines = [
      `DEV ${__APP_ENV__} ${__COMMIT__}`,
      `${String(perf.fps)} fps  upd ${perf.updateMs.toFixed(1)}ms  rnd ${perf.renderMs.toFixed(1)}ms`,
      `scene ${sceneName()}`,
    ];
    for (const e of recentErrors(5)) lines.push(`! ${e.text.slice(0, 60)}`);
    el.textContent = lines.join('\n');
  };
  refresh();
  window.setInterval(refresh, 250);
  return el;
}
