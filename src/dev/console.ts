import { clearEntries, getEntries, onLog } from './log.ts';

/** On-screen console panel: every console.* call and uncaught error, newest at the bottom. */
export function createConsolePanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'dev-ui dev-panel';
  panel.hidden = true;

  const bar = document.createElement('div');
  bar.className = 'dev-panel-bar';
  const title = document.createElement('span');
  title.textContent = 'Console';
  const clear = document.createElement('button');
  clear.textContent = 'Clear';
  clear.addEventListener('click', clearEntries);
  bar.append(title, clear);

  const list = document.createElement('div');
  list.className = 'dev-panel-body';
  panel.append(bar, list);

  const render = (): void => {
    list.replaceChildren(
      ...getEntries().map((e) => {
        const row = document.createElement('div');
        row.className = `dev-log dev-log-${e.level}`;
        row.textContent = `${String(e.time)} ${e.level}: ${e.text}`;
        return row;
      }),
    );
    list.scrollTop = list.scrollHeight;
  };
  onLog(() => {
    if (!panel.hidden) render();
  });
  panel.addEventListener('dev-open', render);
  return panel;
}
