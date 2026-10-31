import type { SpriteDef } from '../../render/spriteTypes.ts';
import { BACKGROUND_SPRITES } from './backgrounds.ts';
import { COMBAT_SPRITES } from './combat.ts';
import { CYFIL_SPRITES } from './cyfil.ts';
import { TILE_SPRITES } from './tiles.ts';

/** Every sprite in the game. New sprite files get added here and are baked into the atlas at boot. */
export const ALL_SPRITES: readonly SpriteDef[] = [...CYFIL_SPRITES, ...COMBAT_SPRITES, ...TILE_SPRITES, ...BACKGROUND_SPRITES];
