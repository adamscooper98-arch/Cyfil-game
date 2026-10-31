import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DEV_TOOLS_MARKER } from '../src/dev/overlay.ts';
import { HITBOX_VIEWER_MARKER } from '../src/dev/hitboxes.ts';
import { TEST_HOOK_MARKER } from '../src/testhook.ts';

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

const failures: string[] = [];
const fail = (msg: string): void => {
  failures.push(msg);
};

// Dev tools must exist only in non-prod builds; the test hook only in the test build.
const rules: { dir: string; marker: string; label: string; expected: boolean }[] = [
  { dir: 'dist/prod', marker: DEV_TOOLS_MARKER, label: 'dev tools', expected: false },
  { dir: 'dist/prod', marker: TEST_HOOK_MARKER, label: 'test hook', expected: false },
  { dir: 'dist/prod', marker: HITBOX_VIEWER_MARKER, label: 'hitbox viewer', expected: false },
  { dir: 'dist/dev', marker: DEV_TOOLS_MARKER, label: 'dev tools', expected: true },
  { dir: 'dist/dev', marker: HITBOX_VIEWER_MARKER, label: 'hitbox viewer', expected: true },
  { dir: 'dist/dev', marker: TEST_HOOK_MARKER, label: 'test hook', expected: false },
];
if (existsSync('dist/test')) {
  rules.push(
    { dir: 'dist/test', marker: DEV_TOOLS_MARKER, label: 'dev tools', expected: true },
    { dir: 'dist/test', marker: TEST_HOOK_MARKER, label: 'test hook', expected: true },
  );
}

for (const { dir, marker, label, expected } of rules) {
  const hits = filesContaining(dir, marker);
  if (expected && hits.length === 0) fail(`${label} missing from ${dir}, so this check proves nothing`);
  if (!expected && hits.length > 0) fail(`${label} found in ${dir}: ${hits.join(', ')}`);
}

if (failures.length > 0) {
  for (const f of failures) console.error(`FAIL: ${f}`);
  process.exit(1);
}
console.log('OK: dev tools only in dev/test builds, test hook only in the test build.');
