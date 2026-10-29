import { expect, test } from '@playwright/test';

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
