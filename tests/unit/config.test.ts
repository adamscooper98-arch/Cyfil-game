import { describe, expect, it } from 'vitest';
import { GAME_NAME, SAVE_FORMAT_ID, SAVE_KEY_PREFIX, SCREEN_H, SCREEN_W } from '../../src/config.ts';

describe('config', () => {
  it('keeps the internal resolution locked', () => {
    expect([SCREEN_W, SCREEN_H]).toEqual([256, 192]);
  });

  it('has a non-empty name and stable save identifiers', () => {
    expect(GAME_NAME.length).toBeGreaterThan(0);
    expect(SAVE_KEY_PREFIX).toMatch(/^[a-z0-9-]+$/);
    expect(SAVE_FORMAT_ID).toMatch(/^[a-z0-9-]+$/);
  });
});
