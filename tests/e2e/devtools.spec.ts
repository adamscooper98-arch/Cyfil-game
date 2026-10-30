import { expect, test } from '@playwright/test';
import { waitForHook } from './helpers.ts';

test('overlay shows environment, commit, fps and scene', async ({ page }) => {
  await page.goto('/');
  const overlay = page.locator('.dev-overlay');
  await expect(overlay).toContainText('DEV test');
  await expect(overlay).toContainText(/\d+ fps/);
  await expect(overlay).toContainText('scene title');
});

test('on-screen console captures console output and uncaught errors', async ({ page }) => {
  await page.goto('/?scene=testcard');
  await expect(page.locator('.dev-overlay')).toBeVisible();
  await page.evaluate(() => {
    console.warn('hello-from-test');
    setTimeout(() => {
      throw new Error('late-error-from-test');
    });
  });
  await page.locator('.dev-overlay').click();
  await page.getByRole('button', { name: 'Console' }).click();
  const panel = page.locator('.dev-panel', { hasText: 'Console' });
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('hello-from-test');
  await expect(panel).toContainText('late-error-from-test');
  // errors also surface in the overlay
  await expect(page.locator('.dev-overlay')).toContainText('late-error-from-test');
});

test('sprite viewer lists sprites, palette and atlas', async ({ page }) => {
  await page.goto('/?scene=testcard');
  await page.locator('.dev-overlay').click();
  await page.getByRole('button', { name: 'Sprites' }).click();
  const panel = page.locator('.dev-panel', { hasText: 'Palette' });
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('cyfil.idle');
  await expect(panel).toContainText('24x24');
  await expect(panel).toContainText('gold');
  expect(await panel.locator('canvas').count()).toBe(2);
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(panel).toBeHidden();
});

test('backtick key toggles the dev menu', async ({ page }) => {
  await page.goto('/?scene=testcard');
  const toolbar = page.locator('.dev-toolbar');
  await expect(toolbar).toBeHidden();
  await page.keyboard.press('Backquote');
  await expect(toolbar).toBeVisible();
  await page.keyboard.press('Backquote');
  await expect(toolbar).toBeHidden();
});

test('console shows the boot line', async ({ page }) => {
  await page.goto('/?scene=testcard');
  await page.locator('.dev-overlay').click();
  await page.getByRole('button', { name: 'Console' }).click();
  await expect(page.locator('.dev-panel', { hasText: 'Console' })).toContainText('build');
});

test('overlay shows live player state while playing', async ({ page }) => {
  await page.goto('/?scene=playing');
  await expect(page.locator('.dev-overlay')).toContainText(/x \d+\.\d y \d+\.\d vx/);
});

test('tuning panel: sliders change the live values, persist across reloads, and reset', async ({ page }) => {
  await page.goto('/?scene=testcard');
  await page.locator('.dev-overlay').click();
  await page.getByRole('button', { name: 'Tuning' }).click();
  const panel = page.locator('.dev-panel', { hasText: 'Tuning' });
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('all values at defaults');

  await panel.locator('label', { hasText: 'Gravity' }).locator('input').fill('0.5');
  await expect(panel).toContainText('gravity: 0.5');
  await expect(panel).toContainText('(default 0.22)');

  await page.reload();
  await page.locator('.dev-overlay').click();
  await page.getByRole('button', { name: 'Tuning' }).click();
  await expect(page.locator('.dev-panel', { hasText: 'Tuning' })).toContainText('gravity: 0.5');

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.locator('.dev-panel', { hasText: 'Tuning' })).toContainText('all values at defaults');
});

test('tuning actually changes the physics', async ({ page }) => {
  await page.goto('/?scene=playing');
  await waitForHook(page);
  // vertical speed three ticks into a jump: heavier gravity pulls it down faster
  const speedAfterJump = async (): Promise<number> =>
    page.evaluate(() => {
      window.__cyfil?.goto('playing');
      window.__cyfil?.advance(5);
      window.__cyfil?.hold(['KeyZ']);
      window.__cyfil?.advance(3);
      window.__cyfil?.hold([]);
      return window.__cyfil?.player()?.vy ?? 0;
    });
  const normal = await speedAfterJump();
  await page.locator('.dev-overlay').click();
  await page.getByRole('button', { name: 'Tuning' }).click();
  await page.locator('.dev-panel', { hasText: 'Tuning' }).locator('label', { hasText: 'Gravity' }).locator('input').fill('0.7');
  const heavy = await speedAfterJump();
  expect(heavy).toBeGreaterThan(normal);
});
