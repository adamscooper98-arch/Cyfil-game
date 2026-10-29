import { DEFAULT_TUNING, TUNING_DEFS, resetTuning, tuning } from '../game/tuning.ts';

const STORAGE_KEY = 'cyfil-dev-tuning';

function save(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tuning));
  } catch {
    // storage can be unavailable (private mode); tuning then just lasts for this session
  }
}

/** Restore tweaks from the last session (dev builds only). Out-of-range or non-numeric values are ignored. */
export function loadSavedTuning(): void {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return;
    for (const def of TUNING_DEFS) {
      const v = (data as Record<string, unknown>)[def.key];
      if (typeof v === 'number' && Number.isFinite(v) && v >= def.min && v <= def.max) tuning[def.key] = v;
    }
  } catch {
    // ignore corrupt data
  }
}

/** Sliders for every movement number, live. Values that differ from the defaults are listed so they can be read back. */
export function createTuningPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'dev-ui dev-panel';
  panel.hidden = true;

  const bar = document.createElement('div');
  bar.className = 'dev-panel-bar';
  const title = document.createElement('span');
  title.textContent = 'Tuning';
  const reset = document.createElement('button');
  reset.textContent = 'Reset';
  bar.append(title, reset);

  const body = document.createElement('div');
  body.className = 'dev-panel-body';
  const summary = document.createElement('pre');
  summary.className = 'dev-tuning-summary';

  const refreshSummary = (): void => {
    const changed = TUNING_DEFS.filter((d) => tuning[d.key] !== DEFAULT_TUNING[d.key]).map(
      (d) => `${d.key}: ${String(tuning[d.key])}  (default ${String(DEFAULT_TUNING[d.key])})`,
    );
    summary.textContent = changed.length ? changed.join('\n') : 'all values at defaults';
  };

  const sync: (() => void)[] = [];
  for (const def of TUNING_DEFS) {
    const row = document.createElement('label');
    row.className = 'dev-tuning-row';
    const name = document.createElement('span');
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = String(def.min);
    slider.max = String(def.max);
    slider.step = String(def.step);
    const update = (): void => {
      slider.value = String(tuning[def.key]);
      name.textContent = `${def.label}: ${String(tuning[def.key])}`;
    };
    slider.addEventListener('input', () => {
      tuning[def.key] = Number(slider.value);
      update();
      refreshSummary();
      save();
    });
    sync.push(update);
    update();
    row.append(name, slider);
    body.append(row);
  }

  reset.addEventListener('click', () => {
    resetTuning();
    for (const fn of sync) fn();
    refreshSummary();
    save();
  });

  refreshSummary();
  body.append(summary);
  panel.append(bar, body);
  panel.addEventListener('dev-open', () => {
    for (const fn of sync) fn();
    refreshSummary();
  });
  return panel;
}
