import { expect, type Page, test } from '@playwright/test';
import { BTN, openManual } from './helpers.ts';

type PointerType = 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel';

async function fire(page: Page, selector: string, type: PointerType, id: number, x: number, y: number): Promise<void> {
  await page.evaluate(
    ([sel, t, pid, cx, cy]) => {
      document.querySelector(sel)?.dispatchEvent(
        new PointerEvent(t, { pointerId: pid, pointerType: 'touch', clientX: cx, clientY: cy, bubbles: true, cancelable: true, isPrimary: true }),
      );
    },
    [selector, type, id, x, y] as const,
  );
}

/** Buttons held after one more tick, ignoring CONFIRM (any tap is a one-tick CONFIRM by design: start from the title, resume from pause). */
async function held(page: Page): Promise<number> {
  const mask = await page.evaluate(() => {
    window.__cyfil?.advance(1);
    return window.__cyfil?.held() ?? -1;
  });
  return mask & ~BTN.CONFIRM;
}

async function center(page: Page, selector: string): Promise<{ x: number; y: number }> {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`${selector} not visible`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function openTouch(page: Page): Promise<void> {
  await openManual(page, '&scene=playing&touch');
  await expect(page.locator('#controls')).toBeVisible();
}

test.describe('touch controls produce the right inputs', () => {
  test('slide pad: left, right, dead zone, down, up', async ({ page }) => {
    await openTouch(page);
    const c = await center(page, '.pad-zone');
    await fire(page, '.pad-zone', 'pointerdown', 1, c.x, c.y);
    expect(await held(page)).toBe(0);
    await fire(page, '.pad-zone', 'pointermove', 1, c.x + 6, c.y); // inside the 10 px dead zone
    expect(await held(page)).toBe(0);
    await fire(page, '.pad-zone', 'pointermove', 1, c.x + 25, c.y);
    expect(await held(page)).toBe(BTN.RIGHT);
    await fire(page, '.pad-zone', 'pointermove', 1, c.x - 25, c.y);
    expect(await held(page)).toBe(BTN.LEFT);
    await fire(page, '.pad-zone', 'pointermove', 1, c.x, c.y + 32);
    expect(await held(page)).toBe(BTN.DOWN);
    await fire(page, '.pad-zone', 'pointermove', 1, c.x, c.y - 32);
    expect(await held(page)).toBe(BTN.UP);
    await fire(page, '.pad-zone', 'pointerup', 1, c.x, c.y);
    expect(await held(page)).toBe(0);
  });

  test('slide pad: the origin follows a long slide, so reversing is quick', async ({ page }) => {
    await openTouch(page);
    const c = await center(page, '.pad-zone');
    await fire(page, '.pad-zone', 'pointerdown', 1, c.x, c.y);
    await fire(page, '.pad-zone', 'pointermove', 1, c.x + 100, c.y);
    expect(await held(page)).toBe(BTN.RIGHT);
    await fire(page, '.pad-zone', 'pointermove', 1, c.x + 50, c.y); // only 50 px back, not 100
    expect(await held(page)).toBe(BTN.LEFT);
  });

  for (const [selector, bit, name] of [
    ['.tbtn-jump', BTN.JUMP, 'JUMP'],
    ['.tbtn-attack', BTN.ATTACK, 'ATTACK'],
    ['.tbtn-ability', BTN.ABILITY, 'ABILITY'],
    ['.tbtn-ultimate', BTN.ULTIMATE, 'ULTIMATE'],
    ['.tbtn-pause', BTN.PAUSE, 'PAUSE'],
  ] as const) {
    test(`button ${name} sets its bit while held`, async ({ page }) => {
      await openTouch(page);
      const c = await center(page, selector);
      await fire(page, selector, 'pointerdown', 7, c.x, c.y);
      expect(await held(page)).toBe(bit);
      await expect(page.locator(selector)).toHaveClass(/down/);
      await fire(page, selector, 'pointerup', 7, c.x, c.y);
      expect(await held(page)).toBe(0);
      await expect(page.locator(selector)).not.toHaveClass(/down/);
    });
  }

  test('multi-touch: pad and two buttons at once, released independently', async ({ page }) => {
    await openTouch(page);
    const pad = await center(page, '.pad-zone');
    const jump = await center(page, '.tbtn-jump');
    const attack = await center(page, '.tbtn-attack');
    await fire(page, '.pad-zone', 'pointerdown', 1, pad.x, pad.y);
    await fire(page, '.pad-zone', 'pointermove', 1, pad.x + 30, pad.y);
    await fire(page, '.tbtn-jump', 'pointerdown', 2, jump.x, jump.y);
    await fire(page, '.tbtn-attack', 'pointerdown', 3, attack.x, attack.y);
    expect(await held(page)).toBe(BTN.RIGHT | BTN.JUMP | BTN.ATTACK);
    await fire(page, '.tbtn-jump', 'pointerup', 2, jump.x, jump.y);
    expect(await held(page)).toBe(BTN.RIGHT | BTN.ATTACK);
    await fire(page, '.pad-zone', 'pointerup', 1, pad.x, pad.y);
    expect(await held(page)).toBe(BTN.ATTACK);
    await fire(page, '.tbtn-attack', 'pointercancel', 3, attack.x, attack.y);
    expect(await held(page)).toBe(0);
  });

  test('a tap shorter than one tick still registers (latched)', async ({ page }) => {
    await openTouch(page);
    const c = await center(page, '.tbtn-jump');
    await fire(page, '.tbtn-jump', 'pointerdown', 1, c.x, c.y);
    await fire(page, '.tbtn-jump', 'pointerup', 1, c.x, c.y); // released before any game tick ran
    expect(await held(page)).toBe(BTN.JUMP); // the latched press lands on the next tick
    expect(await held(page)).toBe(0); // and only that one
  });

  test('two fingers on the same button: stays held until both lift', async ({ page }) => {
    await openTouch(page);
    const c = await center(page, '.tbtn-jump');
    await fire(page, '.tbtn-jump', 'pointerdown', 1, c.x, c.y);
    await fire(page, '.tbtn-jump', 'pointerdown', 2, c.x, c.y);
    await fire(page, '.tbtn-jump', 'pointerup', 1, c.x, c.y);
    expect(await held(page)).toBe(BTN.JUMP);
    await fire(page, '.tbtn-jump', 'pointerup', 2, c.x, c.y);
    expect(await held(page)).toBe(0);
  });

  test('a second finger on the pad is ignored while one is already sliding', async ({ page }) => {
    await openTouch(page);
    const c = await center(page, '.pad-zone');
    await fire(page, '.pad-zone', 'pointerdown', 1, c.x, c.y);
    await fire(page, '.pad-zone', 'pointerdown', 2, c.x + 50, c.y);
    await fire(page, '.pad-zone', 'pointermove', 2, c.x + 80, c.y);
    expect(await held(page)).toBe(0);
  });

  test('rotation (viewport change) releases everything so nothing sticks', async ({ page }) => {
    await openTouch(page);
    const pad = await center(page, '.pad-zone');
    const jump = await center(page, '.tbtn-jump');
    await fire(page, '.pad-zone', 'pointerdown', 1, pad.x, pad.y);
    await fire(page, '.pad-zone', 'pointermove', 1, pad.x + 30, pad.y);
    await fire(page, '.tbtn-jump', 'pointerdown', 2, jump.x, jump.y);
    expect(await held(page)).toBe(BTN.RIGHT | BTN.JUMP);
    const size = page.viewportSize();
    await page.setViewportSize({ width: size?.height ?? 600, height: size?.width ?? 800 });
    await page.waitForTimeout(100);
    expect(await held(page)).toBe(0);
  });

  test('keyboard and touch combine', async ({ page }) => {
    await openTouch(page);
    const c = await center(page, '.tbtn-attack');
    await fire(page, '.tbtn-attack', 'pointerdown', 1, c.x, c.y);
    await page.evaluate(() => {
      window.__cyfil?.hold(['ArrowLeft', 'Space']);
    });
    expect(await held(page)).toBe(BTN.ATTACK | BTN.LEFT | BTN.JUMP);
  });
});

test('real multi-touch through the browser input pipeline (Chromium)', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'uses the Chrome DevTools protocol');
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await openManual(page, '&scene=playing');
  await expect(page.locator('#controls')).toBeVisible(); // coarse pointer: shown without ?touch
  const pad = await center(page, '.pad-zone');
  const jump = await center(page, '.tbtn-jump');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pad.x, y: pad.y, id: 1 }] });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: pad.x + 30, y: pad.y, id: 1 }],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: pad.x + 30, y: pad.y, id: 1 },
      { x: jump.x, y: jump.y, id: 2 },
    ],
  });
  expect(await held(page)).toBe(BTN.RIGHT | BTN.JUMP);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: jump.x, y: jump.y, id: 2 }] });
  expect(await held(page)).toBe(BTN.RIGHT);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(await held(page)).toBe(0);
  await context.close();
});

const DEVICES = [
  { name: 'iPhone 17 Pro portrait', w: 402, h: 874, dpr: 3 },
  { name: 'iPhone 17 Pro landscape', w: 874, h: 402, dpr: 3 },
  { name: 'iPhone SE portrait', w: 375, h: 667, dpr: 2 },
  { name: 'iPhone 14 Pro Max portrait', w: 430, h: 932, dpr: 3 },
  { name: 'iPhone SE landscape', w: 667, h: 375, dpr: 2 },
  { name: 'iPad portrait', w: 820, h: 1180, dpr: 2 },
];

for (const d of DEVICES) {
  test(`control layout: ${d.name}`, async ({ browser }, testInfo) => {
    test.skip(!['chromium', 'webkit'].includes(testInfo.project.name), 'viewport is set per test');
    const context = await browser.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: d.dpr });
    const page = await context.newPage();
    await page.goto('/?scene=playing&touch');
    await expect(page.locator('#controls')).toBeVisible();
    await page.waitForTimeout(400); // layout re-checks 300 ms after load

    const canvas = await page.locator('#game').boundingBox();
    if (!canvas) throw new Error('no canvas');
    const boxes: Record<string, { x: number; y: number; width: number; height: number }> = {};
    for (const sel of ['.tbtn-jump', '.tbtn-attack', '.tbtn-ability', '.tbtn-ultimate', '.tbtn-pause', '.pad-zone']) {
      const b = await page.locator(sel).boundingBox();
      if (!b) throw new Error(`${sel} has no box`);
      boxes[sel] = b;
    }
    const portrait = d.h > d.w;

    // every button is fully on screen and big enough to hit comfortably
    for (const sel of ['.tbtn-jump', '.tbtn-attack', '.tbtn-ability', '.tbtn-ultimate', '.tbtn-pause']) {
      const b = boxes[sel];
      if (!b) continue;
      expect(b.x, sel).toBeGreaterThanOrEqual(0);
      expect(b.y, sel).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width, sel).toBeLessThanOrEqual(d.w);
      expect(b.y + b.height, sel).toBeLessThanOrEqual(d.h);
      expect(Math.min(b.width, b.height), sel).toBeGreaterThanOrEqual(40);
    }
    // the four action buttons never overlap each other
    const action = ['.tbtn-jump', '.tbtn-attack', '.tbtn-ability', '.tbtn-ultimate'];
    for (const a of action) {
      for (const b of action) {
        if (a >= b) continue;
        const p = boxes[a];
        const q = boxes[b];
        if (!p || !q) continue;
        const overlap = p.x < q.x + q.width && q.x < p.x + p.width && p.y < q.y + q.height && q.y < p.y + p.height;
        expect(overlap, `${a} overlaps ${b}`).toBe(false);
      }
    }
    // the move pad has a real touch area
    expect(boxes['.pad-zone']?.width ?? 0).toBeGreaterThan(100);
    expect(boxes['.pad-zone']?.height ?? 0).toBeGreaterThan(100);

    if (portrait) {
      // controls live below the game image
      expect(boxes['.pad-zone']?.y ?? 0).toBeGreaterThanOrEqual(canvas.y + canvas.height - 1);
      for (const sel of action) expect(boxes[sel]?.y ?? 0, sel).toBeGreaterThanOrEqual(canvas.y + canvas.height - 1);
    } else if (d.w >= 800) {
      // roomy landscape: move pad on the left of the game, buttons on the right
      expect((boxes['.pad-zone']?.x ?? 0) + (boxes['.pad-zone']?.width ?? 0)).toBeLessThanOrEqual(canvas.x + 1);
      for (const sel of action) expect(boxes[sel]?.x ?? 0, sel).toBeGreaterThanOrEqual(canvas.x + canvas.width - 1);
    }
    await testInfo.attach(`controls-${d.name}`, { body: await page.screenshot(), contentType: 'image/png' });
    await context.close();
  });
}
