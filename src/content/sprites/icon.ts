/** 16x16 placeholder app icon: Cyfil's cassette body and lens eye. Palette-index grid (see render/sprite.ts). */
export const ICON_SIZE = 16;

export const ICON_GRID: readonly string[] = [
  '2222222222222222',
  '2111111111111112',
  '21dddddddddddd12',
  '21d1111111111d12',
  '21d1337777331d12',
  '21d137jjjj731d12',
  '21d137j11j731d12',
  '21d137jjjj731d12',
  '21d1337777331d12',
  '21d1111111111d12',
  '21dddddddddddd12',
  '21eeeeeeeeeeee12',
  '2111111111111112',
  '2222ggg22ggg2222',
  '2222111221112222',
  '2222222222222222',
];

/** Where the DEV badge band sits (dev builds only). */
export const DEV_BADGE: { y0: number; y1: number; textX: number; textY: number; bandIndex: number; textIndex: number } = {
  y0: 9,
  y1: 15,
  textX: 3,
  textY: 10,
  bandIndex: 16,
  textIndex: 7,
};
