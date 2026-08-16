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

Verified by workflow run `31932687546` (SUCCESS):
- Build: SUCCESS, 0 npm vulnerabilities.
- Live EDIT Particles: video `1.474255 → 3.164786`, output hash `1162732413 → 2360940038`.
- Story Particles: output hash `3109754827 → 3417071853`, currentTime `0.888481 → 2.773569`.
- Evidence artifact ID `9259790238`, ZIP `4,094,768` bytes.

## LIQUID — ✅ OK

Canonical source:
- Repository: `Juanmaes83/liquiddistorteverything`
- Ref: `main`
- Built donor: `dist/liquid-distort.js`
- Blob SHA: `fdbde364975183230270b9d8507cb9ad033cd7c6`
- Built donor size: 10,045 bytes
- TypeScript implementation also inspected (`LiquidDistort.ts`, `falloff.ts`, `modes.ts`, `physics.ts`, `shapes.ts`).

Preserved donor logic:
- Shapes: circle / ellipse / rect / roundedRect.
- Falloff: smoothstep / linear / exponential / cosine.
- Displacement: refract / attract / swirl / ripple / wave.
- Canonical defaults (radius 193, strength 72, attract, smoothstep, spring/follow parameters, tail settings).
- The original library renders through SVG `feDisplacementMap`; the V3 adapter preserves its displacement-field math and maps it to the mural canvas so the result becomes real CanvasTexture pixels. This is a rendering-adapter, not a claim of pixel-identical SVG rasterization.

Verified by workflow run `31932993691` (SUCCESS):
- Build: SUCCESS, 0 npm vulnerabilities.
- Live EDIT Liquid: video `2.581268 → 0.184780` (loop wrapped), output hash `3207012307 → 1018361173`.
- Story Liquid: video `2.696186 → 0` (loop wrapped), output hash `3487688999 → 2603861886`.
- Evidence artifact ID `9259869159`, ZIP `4,599,819` bytes.

## PIXEL / PIXELTRANSITION — ✅ OK

Canonical repository: `Juanmaes83/PixelTransition` (`main`), repo tree `2651c9d5dc53d895cb7b3d721ddb9bdb1669f9ba`.
Important finding: this donor is an original **grid/pixel transition engine**, not a 3D voxelizer. Runtime therefore records `true3DVoxel: false` rather than mislabelling it.

Canonical demo:
- controller `js/demo1/index.js`, blob `deaf8c491a3cbbe325128a711a18f15af58bfb4a`, 4,538 bytes.
- cell engine `js/demo1/overlay.js`, blob `1f41e22d989e4bc1774a69a93b4f0fe94815e0ee`, 3,894 bytes.
- topology: 8 rows × 14 columns, duration 0.4 s, vertical `scaleY`/opacity reveal, top/bottom transform origins and row-based stagger with random 0–5 offset.

Integration:
- `src/v3/donors/pixel/pixel-transition-original-core.js`: 2,832 bytes.
- `src/v3/adapters/pixel-adapter.js`: 1,451 bytes.
- Canvas adaptation fills the donor's animated cells with the corresponding current source image/video region while preserving its cell topology and stagger mechanics.

Verified by workflow run `31933349815` (SUCCESS), head `e49777b4e1e8e43f3713585f9495c5ee9db06c2c`:
- Build: SUCCESS, 0 npm vulnerabilities.
- Total measured effect/integration/QA code at this checkpoint: 52,804 bytes.
- Pixel preview hash `1848678556`, distinct from the other four engines.
- Live EDIT PixelTransition: video `0 → 1.629857`, output hash `1848678556 → 2897338559`.
- Story PixelTransition: video `2.707526 → 0` (loop wrapped), output hash `2014870289 → 2324673126`.
- Three-video cumulative story + Save/Load passed, browser errors `[]`.
- Evidence artifact `paint-your-logo-wall-original-effects-22-1`, ID `9259970015`, ZIP `3,432,627` bytes, digest `sha256:f1755b536d6af399513f47878d59157b61e2180537aa9acc20911ef381119050`.
- Visual evidence personally reviewed: `pixel-original-transition.png`, `pixel-original-edit-live.png`, `pixel-original-live-video.png`. The 8×14 cell structure is visible and the final live video coexists with Grass and Particles on the horizontal story wall.

## GLITCH — 🔵 NEXT / CANONICAL SOURCE IDENTIFIED

Canonical source:
- Repository: `Juanmaes83/escaparates-pro`
- Ref: `master`
- Directory: `labs/source-experiences/glitchify-image-pro`
- source script: `source-script.js`, blob `bfbfdd31060d04ff88c2b05dc9ae82162a12c192`, 85,474 bytes.

The donor is a real image-processing pipeline, not the temporary V3 slice approximation. Its effect manager chains Color Shift → Wave Deform → Displacement → Pixel Sort → Data Corruption. Default visible donor state enables Color Shift and Displacement. Glitch must not be marked OK until those exact default processing algorithms are extracted, connected to image/video, provenance asserted, pixel motion verified, screenshots inspected and the full regression suite passes.
