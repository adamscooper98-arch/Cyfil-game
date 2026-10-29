/**
 * The single place the game's name lives. Change GAME_NAME to rename the game.
 * SAVE_KEY_PREFIX / SAVE_FORMAT_ID are stable identifiers and must NOT change
 * when the display name changes, or existing saves are orphaned (DECISIONS D-010).
 */
export const GAME_NAME = 'Cyfil';
export const GAME_DESCRIPTION = 'A junkyard spark-bot platformer.';

export const SAVE_KEY_PREFIX = 'cyfil';
export const SAVE_FORMAT_ID = 'cyfil-save';

export const THEME_COLOR = '#1a1f3d';

/** Internal resolution (DESIGN §6.2). */
export const SCREEN_W = 256;
export const SCREEN_H = 192;
