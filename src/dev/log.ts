/** Dev-only: captures console output and uncaught errors so they can be read on a phone. */
export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  readonly level: LogLevel;
  readonly text: string;
  readonly time: number;
}

const MAX_ENTRIES = 200;
const entries: LogEntry[] = [];
const listeners = new Set<() => void>();

function format(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
  try {
    const json = JSON.stringify(arg);
    return json.length > 300 ? `${json.slice(0, 300)}…` : json;
  } catch {
    return String(arg);
  }
}

export function addEntry(level: LogLevel, text: string): void {
  entries.push({ level, text, time: Math.round(performance.now()) });
  if (entries.length > MAX_ENTRIES) entries.shift();
  for (const fn of listeners) fn();
}

export function getEntries(): readonly LogEntry[] {
  return entries;
}

export function recentErrors(n: number): LogEntry[] {
  return entries.filter((e) => e.level === 'error').slice(-n);
}

export function onLog(fn: () => void): void {
  listeners.add(fn);
}

export function clearEntries(): void {
  entries.length = 0;
  for (const fn of listeners) fn();
}

let installed = false;

export function installLogCapture(): void {
  if (installed) return;
  installed = true;
  const levels: LogLevel[] = ['log', 'info', 'warn', 'error', 'debug'];
  for (const level of levels) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]): void => {
      addEntry(level, args.map(format).join(' '));
      original(...args);
    };
  }
  window.addEventListener('error', (e) => {
    addEntry('error', `${e.message} (${e.filename.split('/').pop() ?? '?'}:${String(e.lineno)})`);
  });
  window.addEventListener('unhandledrejection', (e) => {
    addEntry('error', `Unhandled rejection: ${format(e.reason)}`);
  });
}
