/** What each tile name looks like and how it behaves. Levels refer to tiles by name through their legend. */
export type TileKind = 'empty' | 'solid' | 'oneway' | 'hazard' | 'decor';

export interface TileDef {
  readonly sprite: string | null;
  readonly kind: TileKind;
}

export interface Tileset {
  readonly id: string;
  readonly tiles: Readonly<Record<string, TileDef>>;
  readonly parallaxFar: string;
  readonly parallaxNear: string;
}

export const SCRAPYARD: Tileset = {
  id: 'scrapyard',
  tiles: {
    empty: { sprite: null, kind: 'empty' },
    ground: { sprite: 'tile.ground', kind: 'solid' },
    ground_top: { sprite: 'tile.ground_top', kind: 'solid' },
    platform_oneway: { sprite: 'tile.platform', kind: 'oneway' },
    bg_crate: { sprite: 'tile.crate', kind: 'decor' },
  },
  parallaxFar: 'bg.far',
  parallaxNear: 'bg.near',
};

export const TILESETS: Readonly<Record<string, Tileset>> = { scrapyard: SCRAPYARD };
