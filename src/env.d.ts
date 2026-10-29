/** Compile-time constants injected by vite.config.ts. */
declare const __DEV_TOOLS__: boolean;
declare const __APP_ENV__: 'prod' | 'dev' | 'test';
declare const __COMMIT__: string;

interface Window {
  /** Dev/test builds only: errors thrown before the dev tools finished loading. */
  __earlyErrors?: string[];
}
