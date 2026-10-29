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

## M2: input, touch controls, movement (dev app)

Open the **dev** home-screen app (wait about a minute after a deploy, or refresh the dev URL in Safari first). Tap to start. You now play the **Physics Course**: gaps to jump, a 2-tile wall, stairs, a step up to a one-way platform (jump up *through* it from below), a low ceiling tunnel (jump inside it to bump your head), and a goal at the far right that shows GOAL.

**Controls:** touch and slide anywhere in the **left zone** to move (it centers where you first touch; slide further to keep going, reverse by sliding back). **JUMP** (big yellow) on the right. HIT, SKILL and ULT are placeholders until M3 and do nothing yet. The small **II** button pauses.

**Feel (the part that matters most; automation can't judge it)**
- [ ] Running: is the top speed too slow, too fast, or about right? Does it start and stop crisply, or feel slippery/sluggish?
- [ ] Jumping: is a full jump high enough (about 2.5 tiles)? Is a quick tap a satisfying small hop? Floaty, heavy, or right?
- [ ] Ledges: does it feel fair when you jump just after running off an edge, and when you press jump just before landing?
- [ ] The slide pad: does it respond where you expect, is the dead zone right (too twitchy? too sluggish to start?), can you reverse direction quickly, does it ever stick or drift?
- [ ] Buttons: easy to hit with your thumb without looking? Too big or small? Can you slide AND jump at the same time reliably?
- [ ] Portrait versus landscape: which do you prefer for playing? In landscape, do the buttons cover too much of the game edges (your phone's notch pushes them inward)?
- [ ] Rotating while holding a button or the pad: nothing should stay stuck.
- [ ] Falling into a pit respawns you at the start. The camera follows smoothly.

**Tune it live:** tap the magenta box, then **Tuning**. Drag the sliders; changes apply instantly and are remembered on your phone. The list at the bottom shows what you changed versus the defaults. Tell me those numbers when it feels right and I'll make them the defaults. **Reset** restores the defaults.

**Report back**
- Which numbers you changed (or your best words if you didn't tune), whether you prefer portrait or landscape, and anything that felt wrong or got stuck.

