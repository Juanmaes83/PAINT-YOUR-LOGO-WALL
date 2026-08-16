# V3 Original Effects — sequential integration log

Safety branch: `agent/logo-crew-v3-original-effects`
Stable V3 remains: `agent/logo-crew-v3`

## GRASS — ✅ OK

Canonical source:
- Repository: `Juanmaes83/escaparates-pro`
- Ref: `master`
- Path: `labs/source-experiences/grass-image-processing-pro/source-script.js`
- Blob SHA: `91b6441f8cb31f6ff79f14a8cc0d4ab375c929a1`
- Original source size: 19,112 bytes

Integration:
- Source-faithful extracted core: `src/v3/donors/grass/grass-original-core.js`
- Thin runtime adapter: `src/v3/adapters/grass-adapter.js`
- Runtime reports `engine: original-escaparates-pro` plus exact donor path/blob.
- Image and live-video pixel motion verified in Chromium.

Evidence gate passed:
1. Build and syntax checks green.
2. Canonical donor provenance asserted at runtime.
3. Preview non-empty and visually distinct.
4. Real video currentTime and Grass output pixel hash both advance.
5. Story keeps prior jobs alive.
6. Save/load regression green.
7. Screenshots + JSON report uploaded as Actions artifact.

## PARTICLES — ✅ OK

Canonical source:
- Repository: `Juanmaes83/escaparates-pro`
- Ref: `master`
- Path: `labs/source-experiences/particulate-image-pro/source-script.js`
- Blob SHA: `2ab38ec69d91c94bd5e63cecf19fa1a11d8b7654`
- Original source size: 16,499 bytes

Preserved donor behavior:
- Particle creation from sampled source pixels.
- 2,000 minimum / 8,000 maximum target particles.
- Four-edge spawn topology.
- Per-particle friction, spring strength, wander, opacity and rounded-pixel geometry.
- Blow / Magnet / Freeze modes.
- Original dark trail background behavior.
- Live-video adaptation updates each particle RGB from the current video frame while retaining donor physics.

Integration:
- Source-faithful extracted core: `src/v3/donors/particles/particulate-original-core.js`
- Thin runtime adapter: `src/v3/adapters/particles-adapter.js`
- Runtime reports `engine: original-escaparates-pro` plus exact donor path/blob.

Verified by workflow run `31932687546` (SUCCESS):
- Build: SUCCESS, 0 npm vulnerabilities.
- Particles preview hash: `3932531243` (distinct from all other engines).
- Live EDIT Particles: video `1.474255 → 3.164786`, output hash `1162732413 → 2360940038`.
- Story Particles video: output hash `3109754827 → 3417071853`, currentTime `0.888481 → 2.773569`.
- Three-video cumulative story and Save/Load regression passed.
- Evidence artifact: `paint-your-logo-wall-original-effects-10-1`, artifact ID `9259790238`, ZIP size `4,094,768` bytes, digest `sha256:3849ffc9034cb43bf531de82bd274f622e2bad356f81ed6a9fc26c9691c96e5c`.
- Visual evidence reviewed: `particles-original-escaparates-pro.png`, `particles-original-edit-live.png`, `particles-original-story.png`, `particles-original-live-video.png`.

## LIQUID — 🔵 NEXT / DONOR IDENTIFIED

Canonical repository identified: `Juanmaes83/liquiddistorteverything` (`main`).
The published donor is a real library, not a demo-only approximation. Its built ESM is `dist/liquid-distort.js` (blob `fdbde364975183230270b9d8507cb9ad033cd7c6`, 10,045 bytes), backed by TypeScript source modules for LiquidDistort, falloff, modes, physics and shapes.

Liquid must not be marked OK until its donor math/physics is integrated, runtime provenance is exact, image/video pixels are verified, screenshots are reviewed, and the same regression suite is green.
