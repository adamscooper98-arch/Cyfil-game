import { test } from '@playwright/test';
import { expectGolden, loadReplayFixture, openManual } from './helpers.ts';

// Deterministic frames: fixed-step updates, scripted input, pixel-exact comparison at internal resolution.
// These run in every browser project, which also proves Chromium and WebKit draw identical pixels.
const fixture = loadReplayFixture();

test('title screen', async ({ page }) => {
  await openManual(page);
  await page.evaluate(() => {
    window.__cyfil?.goto('title');
    window.__cyfil?.advance(30);
  });
  await expectGolden(page, 'title-30');
});

test('physics course: start (Cyfil settles on the ground)', async ({ page }) => {
  await openManual(page);
  await page.evaluate(() => {
    window.__cyfil?.goto('playing');
    window.__cyfil?.advance(10);
  });
  await expectGolden(page, 'course-start');
});

test('physics course: replay, running', async ({ page }) => {
  await openManual(page);
  await page.evaluate((runs) => {
    window.__cyfil?.goto('playing');
    window.__cyfil?.play(runs);
    window.__cyfil?.advance(90);
  }, fixture.runs);
  await expectGolden(page, 'course-run-90');
});

test('physics course: replay, mid-jump over the first gap', async ({ page }) => {
  await openManual(page);
  await page.evaluate((runs) => {
    window.__cyfil?.goto('playing');
    window.__cyfil?.play(runs);
    window.__cyfil?.advance(130);
  }, fixture.runs);
  await expectGolden(page, 'course-midjump-130');
});

test('physics course: replay, at the goal', async ({ page }) => {
  await openManual(page);
  await page.evaluate(
    ([runs, ticks]) => {
      window.__cyfil?.goto('playing');
      window.__cyfil?.play(runs);
      window.__cyfil?.advance(ticks);
    },
    [fixture.runs, fixture.ticks] as const,
  );
  await expectGolden(page, 'course-goal');
});

test('physics course: turned around (sprite flipped, running left)', async ({ page }) => {
  await openManual(page);
  await page.evaluate(() => {
    window.__cyfil?.goto('playing');
    window.__cyfil?.hold(['ArrowRight']);
    window.__cyfil?.advance(60);
    window.__cyfil?.hold(['ArrowLeft']);
    window.__cyfil?.advance(15);
  });
  await expectGolden(page, 'course-turned-left');
});

test('paused overlay', async ({ page }) => {
  await openManual(page);
  await page.evaluate(() => {
    window.__cyfil?.goto('playing');
    window.__cyfil?.advance(10);
    window.__cyfil?.press('Escape');
    window.__cyfil?.advance(1);
  });
  await expectGolden(page, 'paused');
});

test('palette test card', async ({ page }) => {
  await openManual(page);
  await page.evaluate(() => {
    window.__cyfil?.goto('testcard');
  });
  await expectGolden(page, 'testcard');
});
