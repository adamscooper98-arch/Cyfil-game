# Playtest checklists

Automation can't judge feel, art, or real iOS behavior. These are the things only Cooper can check, per milestone. Report what you see, even "looks fine".

## M1: engine and rendering (dev app)

Open the **dev** home-screen app. If it looks stale, wait about a minute, or open the dev URL in Safari and refresh first.

**Look**
- [ ] Title screen: big cyan name, the little robot blinking and flashing gold, "TAP OR PRESS ENTER" pulsing.
- [ ] Pixels are crisp (no blur, no shimmering edges) in portrait and landscape.
- [ ] Rotating the phone back and forth re-centers the game cleanly, with no flash of a wrong size.
- [ ] Portrait: the game sits at the top of the screen with empty space below (controls come in M2).
- [ ] The game is not cut off by the notch, curved corners, or home bar in either orientation.
- [ ] **Palette:** open the sprite viewer (below) and look at the colors. Anything that looks wrong or ugly? Tell me the swatch numbers.

**Play (placeholder controls, replaced in M2)**
- [ ] Tap the screen on the title to start.
- [ ] Touch and hold on the screen: the robot floats toward where you touch (left/right/up/down from the screen center). The level scrolls, with the far skyline moving slower than the near piles.
- [ ] The robot flips to face the way it moves. The ground, one-way platform, crates and pit all look right.
- [ ] Put the app in the background and come back: it should be paused, and a tap resumes.

**Dev tools**
- [ ] The magenta box top-left shows `DEV dev <commit>`, fps (should read about 60, or 30 in Low Power Mode), frame times, and the scene name.
- [ ] Tap the magenta box: a toolbar appears top-right (Console, Sprites, Close). A 3-finger tap also toggles it.
- [ ] **Console** opens a panel; it should be empty or show only messages. **Sprites** shows the palette with numbers, the atlas image and the sprite list.
- [ ] Panels scroll with your finger and the buttons are easy to hit.

**Report back**
- fps number you see, phone model and iOS version, and anything that looked or felt off.
