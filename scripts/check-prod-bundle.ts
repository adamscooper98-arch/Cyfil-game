import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DEV_TOOLS_MARKER } from '../src/dev/devtools.ts';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function filesContaining(dir: string, needle: string): string[] {
  return walk(dir).filter((f) => readFileSync(f).includes(needle));
}

for (const dir of ['dist/prod', 'dist/dev']) {
  if (!existsSync(dir)) {
    console.error(`${dir} is missing. Run build:prod and build:dev first.`);
    process.exit(1);
  }
}

const leaked = filesContaining('dist/prod', DEV_TOOLS_MARKER);
if (leaked.length > 0) {
  console.error(`FAIL: dev-tools marker found in prod bundle:\n  ${leaked.join('\n  ')}`);
  process.exit(1);
}

// Sanity: the check is only meaningful if the dev build really contains the marker.
if (filesContaining('dist/dev', DEV_TOOLS_MARKER).length === 0) {
  console.error('FAIL: dev build does not contain the dev-tools marker, so this check proves nothing.');
  process.exit(1);
}

console.log('OK: dev tools are present in the dev build and absent from the prod build.');
