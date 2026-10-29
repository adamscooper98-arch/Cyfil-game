import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import { pwaPlugin } from './scripts/pwaPlugin.ts';

type AppEnv = 'prod' | 'dev' | 'test';

function gitCommit(): string {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

/** Headers for `vite preview`, taken from the `/*` block of public/_headers so tests see the real CSP. */
function previewHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  let inAll = false;
  for (const line of readFileSync('public/_headers', 'utf8').split(/\r?\n/)) {
    if (line.trim() === '' || line.startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      inAll = line.trim() === '/*';
      continue;
    }
    if (!inAll) continue;
    const i = line.indexOf(':');
    const name = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    // http://localhost has no TLS, so these two would break local preview.
    if (name === 'Strict-Transport-Security') continue;
    headers[name] = value.replace(/;?\s*upgrade-insecure-requests/, '');
  }
  return headers;
}

export default defineConfig(({ mode }) => {
  const appEnv: AppEnv = mode === 'prod' ? 'prod' : mode === 'test' ? 'test' : 'dev';
  return {
    plugins: [pwaPlugin(appEnv)],
    define: {
      __DEV_TOOLS__: JSON.stringify(appEnv !== 'prod'),
      __APP_ENV__: JSON.stringify(appEnv),
      __COMMIT__: JSON.stringify(gitCommit()),
    },
    build: {
      outDir: `dist/${appEnv}`,
      target: 'es2022',
      assetsInlineLimit: 0,
      modulePreload: { polyfill: false },
    },
    preview: { headers: previewHeaders() },
    test: {
      include: ['tests/unit/**/*.test.ts'],
      environment: 'node',
    },
  };
});
