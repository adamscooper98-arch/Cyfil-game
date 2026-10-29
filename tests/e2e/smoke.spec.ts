import { expect, test } from '@playwright/test';
import { PALETTE, paletteRgb } from '../../src/render/palette.ts';
import { swatchRect } from '../../src/testcard.ts';

test('loads, draws the palette card, and produces no console errors or CSP violations', async ({ page }, testInfo) => {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => problems.push(`requestfailed: ${req.url()}`));
  await page.addInitScript(() => {
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI} ${e.sample}`);
    });
  });

  const response = await page.goto('/');
  expect(response?.headers()['content-security-policy']).toContain("default-src 'none'");

  const canvas = page.locator('#game');
  await expect(canvas).toBeVisible();
  expect(await canvas.evaluate((c: HTMLCanvasElement) => [c.width, c.height])).toEqual([256, 192]);

  // simulate a first tap/keypress (iOS audio unlock lands here in M8)
  await canvas.click();
  await page.keyboard.press('Space');

  // each palette swatch is drawn in its exact palette color
  const samples = await canvas.evaluate((c: HTMLCanvasElement, rects) => {
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    return rects.map((r) => Array.from(ctx.getImageData(r.x + 2, r.y + 2, 1, 1).data));
  }, PALETTE.map((_, i) => swatchRect(i)));
  PALETTE.forEach((_, i) => {
    const rgb = paletteRgb(i);
    if (rgb) expect(samples[i], `swatch ${String(i)}`).toEqual([...rgb, 255]);
  });

  // pixels are scaled by a whole number of device pixels
  const dpr = await page.evaluate(() => window.devicePixelRatio);
  const box = await canvas.boundingBox();
  const scale = ((box?.width ?? 0) * dpr) / 256;
  expect(Number.isInteger(Math.round(scale * 1000) / 1000)).toBe(true);

  // the service worker registers (built bundle)
  const swState = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.active?.state ?? 'none';
  });
  expect(swState).toBe('activated');

  // let a few frames of idle time pass, then check nothing went wrong
  await page.waitForTimeout(500);
  // Checked before page.screenshot(): WebKit's screenshot injects a style element of its own, which would be a false positive.
  expect(await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp)).toEqual([]);
  expect(problems).toEqual([]);
  await testInfo.attach('screenshot', { body: await page.screenshot(), contentType: 'image/png' });
});

test('test build includes the dev badge; manifest and icons are served', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('.dev-badge')).toContainText('DEV test');
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  const json = (await manifest.json()) as { name: string; display: string };
  expect(json.display).toBe('standalone');
  for (const icon of ['/icon-192.png', '/icon-512.png']) {
    const res = await request.get(icon);
    expect(res.ok()).toBe(true);
    expect(res.headers()['content-type']).toBe('image/png');
  }
});
