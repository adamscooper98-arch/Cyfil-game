import { test } from '@playwright/test';
import { expectGolden, openManual } from './helpers.ts';

// Deterministic frames: fixed-step updates, scripted input, pixel-exact comparison at internal resolution.
// These run in every browser project, which also proves Chromium and WebKit draw identical pixels.

test('title screen', async ({ page }) => {
  await openManual(page);
  await page.evaluate(() => {
    window.__cyfil?.goto('title');
    window.__cyfil?.advance(30);
  });
  await expectGolden(page, 'title-30');
});

test('playing: start of level', async ({ page }) => {
  await openManual(page);
  await page.evaluate(() => {
    window.__cyfil?.goto('playing');
    window.__cyfil?.advance(1);
  });
  await expectGolden(page, 'playing-start');
});

test('playing: after scrolling right (camera, parallax, pit, flipped sprite)', async ({ page }) => {
  await openManual(page);
  await page.evaluate(() => {
    window.__cyfil?.goto('playing');
    window.__cyfil?.hold(['ArrowRight']);
    window.__cyfil?.advance(260);
  });
  await expectGolden(page, 'playing-right-260');
});

test('playing: moved back left (sprite flipped the other way)', async ({ page }) => {
  await openManual(page);
  await page.evaluate(() => {
    window.__cyfil?.goto('playing');
    window.__cyfil?.hold(['ArrowRight']);
    window.__cyfil?.advance(120);
    window.__cyfil?.hold(['ArrowLeft']);
    window.__cyfil?.advance(40);
  });
  await expectGolden(page, 'playing-left-40');
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
