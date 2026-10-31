import { expect, type Page, test } from '@playwright/test';
import { expectGolden, openManual } from './helpers.ts';

// Deterministic combat scenes on the Combat Arena: Cyfil starts at the left, the first dummy stands 6 tiles away.

async function enterArena(page: Page): Promise<void> {
  await openManual(page);
  await page.evaluate(() => {
    window.__cyfil?.goto('playing', 'combat-arena');
    window.__cyfil?.advance(10);
  });
}

/** Run right until Cyfil is close enough to reach the first dummy, then let the slide stop. */
async function walkToFirstDummy(page: Page): Promise<void> {
  await page.evaluate(() => {
    const api = window.__cyfil;
    if (!api) throw new Error('no hook');
    api.hold(['ArrowRight']);
    for (let i = 0; i < 200 && (api.player()?.x ?? 0) < 114; i++) api.advance(1);
    api.hold([]);
    api.advance(20);
  });
}

/** Press Attack, then advance one tick at a time until the first dummy has taken `hp` or less (or give up). */
async function attackUntilHp(page: Page, hp: number): Promise<number> {
  return page.evaluate((target) => {
    const api = window.__cyfil;
    if (!api) throw new Error('no hook');
    let ticks = 0;
    for (let t = 0; t < 120; t++) {
      if (t % 16 === 0) api.press('KeyX');
      api.advance(1);
      ticks++;
      if ((api.dummies()[0]?.hp ?? 99) <= target) break;
    }
    return ticks;
  }, hp);
}

const hpOfFirst = (page: Page): Promise<number | undefined> => page.evaluate(() => window.__cyfil?.dummies()[0]?.hp);

test('a full combo takes 1, 1 and 2 hit points off the dummy', async ({ page }) => {
  await enterArena(page);
  await walkToFirstDummy(page);
  expect(await hpOfFirst(page)).toBe(12);
  await attackUntilHp(page, 11);
  expect(await hpOfFirst(page)).toBe(11);
  await attackUntilHp(page, 10);
  expect(await hpOfFirst(page)).toBe(10);
  await attackUntilHp(page, 8);
  expect(await hpOfFirst(page)).toBe(8);
});

test('a swing with nothing in reach hurts nobody', async ({ page }) => {
  await enterArena(page);
  await page.evaluate(() => {
    window.__cyfil?.press('KeyX');
    window.__cyfil?.advance(40);
  });
  const hps = await page.evaluate(() => window.__cyfil?.dummies().map((d) => d.hp));
  expect(hps).toEqual([12, 12, 12]);
});

test('arena: start', async ({ page }) => {
  await enterArena(page);
  await expectGolden(page, 'arena-start');
});

test('arena: first swing in the air (arc, no target)', async ({ page }) => {
  await enterArena(page);
  await page.evaluate(() => {
    window.__cyfil?.press('KeyX');
    window.__cyfil?.advance(5);
  });
  await expectGolden(page, 'arena-swing-whiff');
});

test('arena: hit 1 (flash, spark, health bar)', async ({ page }) => {
  await enterArena(page);
  await walkToFirstDummy(page);
  await attackUntilHp(page, 11);
  await expectGolden(page, 'arena-hit1');
});

test('arena: hit 2', async ({ page }) => {
  await enterArena(page);
  await walkToFirstDummy(page);
  await attackUntilHp(page, 11);
  await attackUntilHp(page, 10);
  await expectGolden(page, 'arena-hit2');
});

test('arena: hit 3 (spin ring and launch)', async ({ page }) => {
  await enterArena(page);
  await walkToFirstDummy(page);
  await attackUntilHp(page, 11);
  await attackUntilHp(page, 10);
  await attackUntilHp(page, 8);
  await expectGolden(page, 'arena-hit3');
});

test('dev menu: Arena button loads the arena and Hitboxes draws the boxes', async ({ page }) => {
  await openManual(page);
  await page.evaluate(() => {
    window.__cyfil?.goto('playing', 'physics-course');
    window.__cyfil?.advance(5);
  });
  await page.keyboard.press('Backquote');
  await page.getByRole('button', { name: 'Arena' }).click();
  await page.getByRole('button', { name: 'Hitboxes: off' }).click();
  await expect(page.getByRole('button', { name: 'Hitboxes: on' })).toBeVisible();
  await page.evaluate(() => {
    window.__cyfil?.advance(10);
  });
  expect(await page.evaluate(() => window.__cyfil?.dummies().length)).toBe(3);
  await expectGolden(page, 'arena-hitboxes');
});
