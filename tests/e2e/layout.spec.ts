import { expect, test } from '@playwright/test';

// Real-device-sized viewports. Safe-area insets are 0 in emulation, so this checks scaling, fit and alignment only;
// notches, curved corners and the home bar need a real iPhone.
const DEVICES = [
  { name: 'iPhone SE portrait', w: 375, h: 667, dpr: 2 },
  { name: 'iPhone 14 portrait', w: 390, h: 844, dpr: 3 },
  { name: 'iPhone 14 Pro Max portrait', w: 430, h: 932, dpr: 3 },
  { name: 'iPhone 14 landscape', w: 844, h: 390, dpr: 3 },
  { name: 'iPhone SE landscape', w: 667, h: 375, dpr: 2 },
  { name: 'iPad portrait', w: 820, h: 1180, dpr: 2 },
  { name: 'desktop', w: 1280, h: 800, dpr: 1 },
];

for (const d of DEVICES) {
  test(`layout: ${d.name}`, async ({ browser }, testInfo) => {
    test.skip(!['chromium', 'webkit'].includes(testInfo.project.name), 'viewport is set per test');
    const context = await browser.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: d.dpr });
    const page = await context.newPage();
    await page.goto('/?scene=testcard');
    const canvas = page.locator('#game');
    await expect(canvas).toBeVisible();
    // layout re-checks 300 ms after load on purpose; wait it out
    await page.waitForTimeout(400);
    const box = await canvas.boundingBox();
    if (!box) throw new Error('no canvas box');

    // whole-number scale in device pixels: crisp, uniform pixels
    const scale = (box.width * d.dpr) / 256;
    expect(Math.abs(scale - Math.round(scale)), `scale ${String(scale)}`).toBeLessThan(0.02);
    expect((box.height * d.dpr) / 192).toBeCloseTo(Math.round(scale), 1);

    // fully inside the viewport
    expect(box.x).toBeGreaterThanOrEqual(-0.5);
    expect(box.y).toBeGreaterThanOrEqual(-0.5);
    expect(box.x + box.width).toBeLessThanOrEqual(d.w + 0.5);
    expect(box.y + box.height).toBeLessThanOrEqual(d.h + 0.5);

    // centered horizontally; portrait hugs the top (controls go below, M2), landscape is centered vertically
    expect(Math.abs(box.x - (d.w - box.width) / 2)).toBeLessThan(1);
    if (d.h > d.w) expect(box.y).toBeLessThan(1);
    else expect(Math.abs(box.y - (d.h - box.height) / 2)).toBeLessThan(1);

    // no scrollbars / page overflow
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await testInfo.attach(`layout-${d.name}`, { body: await page.screenshot(), contentType: 'image/png' });
    await context.close();
  });
}

test('rotation: portrait to landscape keeps game state and re-fits', async ({ browser }, testInfo) => {
  test.skip(!['chromium', 'webkit'].includes(testInfo.project.name), 'viewport is set per test');
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const page = await context.newPage();
  await page.goto('/?manual&scene=playing');
  await page.waitForFunction(() => window.__cyfil !== undefined);
  await page.evaluate(() => {
    window.__cyfil?.hold(['ArrowRight']);
    window.__cyfil?.advance(100);
  });
  const before = await page.evaluate(() => window.__cyfil?.pixels().join(',') ?? '');
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(500);
  const box = await page.locator('#game').boundingBox();
  expect(box?.width).toBeCloseTo((6 * 256) / 3, 0);
  // same game frame after rotation: only the layout changed
  expect(await page.evaluate(() => window.__cyfil?.pixels().join(',') ?? '')).toBe(before);
  await context.close();
});
