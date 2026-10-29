import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';

const GOLDEN_DIR = 'tests/e2e/golden';

/** Open the test build in manual mode: nothing runs until the test advances the game. */
export async function openManual(page: Page): Promise<void> {
  await page.goto('/?manual');
  await page.waitForFunction(() => window.__cyfil !== undefined);
}

/**
 * Compare the 256x192 game canvas to a stored PNG, pixel for pixel.
 * Re-bless intentionally with: UPDATE_GOLDEN=1 npx playwright test golden --project=chromium
 * and review the changed PNGs in the diff.
 */
export async function expectGolden(page: Page, name: string): Promise<void> {
  const file = `${GOLDEN_DIR}/${name}.png`;
  if (process.env.UPDATE_GOLDEN === '1') {
    const url = await page.evaluate(() => document.querySelector<HTMLCanvasElement>('#game')?.toDataURL('image/png') ?? '');
    mkdirSync(GOLDEN_DIR, { recursive: true });
    writeFileSync(file, Buffer.from(url.split(',')[1] ?? '', 'base64'));
    return;
  }
  expect(existsSync(file), `missing golden ${file}; create it with UPDATE_GOLDEN=1`).toBe(true);
  const b64 = readFileSync(file).toString('base64');
  const mismatches = await page.evaluate(async (data) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 192;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    ctx.drawImage(img, 0, 0);
    const want = ctx.getImageData(0, 0, 256, 192).data;
    const got = window.__cyfil?.pixels() ?? [];
    let bad = 0;
    for (let i = 0; i < want.length; i += 4) {
      if (want[i] !== got[i] || want[i + 1] !== got[i + 1] || want[i + 2] !== got[i + 2] || want[i + 3] !== got[i + 3]) bad++;
    }
    return bad;
  }, b64);
  expect(mismatches, `${String(mismatches)} pixels differ from golden ${name}`).toBe(0);
}
