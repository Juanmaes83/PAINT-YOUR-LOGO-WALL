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

Integration sizes from CI:
- `src/v3/donors/liquid/liquid-distort-original-core.js`: 3,117 bytes.
- `src/v3/adapters/liquid-adapter.js`: 1,502 bytes.
- Full measured original-effects code set at this checkpoint: 48,120 bytes.

Verified by workflow run `31932993691` (SUCCESS):
- Build: SUCCESS, 0 npm vulnerabilities.
- Liquid preview hash `1208466844`, distinct from Grass/Particles/Pixel/Glitch.
- Live EDIT Liquid: video `2.581268 → 0.184780` (loop wrapped), output hash `3207012307 → 1018361173`.
- Story Liquid: video `2.696186 → 0` (loop wrapped), output hash `3487688999 → 2603861886`.
- Three-video cumulative story and Save/Load passed with no browser errors.
- Evidence artifact `paint-your-logo-wall-original-effects-16-1`, ID `9259869159`, ZIP `4,599,819` bytes, digest `sha256:5ee3a78467c315848f7fa250be75e56fdf4a13f781d4b9a1b16075bd0eafa3a1`.
- Visual evidence reviewed: `liquid-original-library.png`, `liquid-original-edit-live.png`, `liquid-original-live-video.png`; the distortion field is visible and the three finished video works coexist horizontally.

## PIXEL / VOXEL — 🟡 DONOR INSPECTED / INTEGRATION NEXT

Canonical repository: `Juanmaes83/PixelTransition` (`main`), repo tree `2651c9d5dc53d895cb7b3d721ddb9bdb1669f9ba`.
Important finding: this donor is an original **grid/pixel transition engine**, not a 3D voxelizer. Its core `Overlay` builds a rows×columns cell matrix and GSAP animates cell `scaleY`/opacity with configurable transform origin and stagger.

Canonical demo selected for the V3 Pixel effect:
- `js/demo1/index.js`, blob `deaf8c491a3cbbe325128a711a18f15af58bfb4a`, 4,538 bytes.
- configuration: `rows: 8`, `columns: 14`, duration `0.4`, `power3.inOut`, row-based stagger with random 0–5 offset.
- shared cell engine: `js/demo1/overlay.js`, blob `1f41e22d989e4bc1774a69a93b4f0fe94815e0ee`, 3,894 bytes.

The V3 adaptation will preserve this grid/cell/stagger/scaleY transition topology while filling each cell with the current source image/video pixels. It will be labelled PixelTransition, not falsely described as a true 3D voxel engine.
