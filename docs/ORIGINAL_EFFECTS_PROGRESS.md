# V3 Original Effects — sequential integration log

Safety branch: `agent/logo-crew-v3-original-effects`
Stable V3 remains: `agent/logo-crew-v3`

## GRASS — OK

Canonical source:
- Repository: `Juanmaes83/escaparates-pro`
- Ref: `master`
- Path: `labs/source-experiences/grass-image-processing-pro/source-script.js`
- Blob SHA: `91b6441f8cb31f6ff79f14a8cc0d4ab375c929a1`
- Original source size: 19,112 bytes

Integration:
- Source-faithful extracted core: `src/v3/donors/grass/grass-original-core.js` — 5,387 bytes in verified run.
- Thin runtime adapter: `src/v3/adapters/grass-adapter.js` — 2,740 bytes in verified run.
- Runtime registry: `src/v3-effect-engine.js`.
- Live-media capability signal: `src/v23-jobs.js`.
- Still rendering: original algorithm at 512×256 donor input → 1024×512 donor output.
- Live video: the same original donor algorithm on 96×48 sampled live frames → 192×96 donor output, fitted to the artwork, capped at 12 donor renders/s to preserve responsive video playback. This is a live adaptation of the original algorithm, not a claim of full-resolution pixel identity on every video frame.

Verified gate:
1. Build and syntax checks: PASS.
2. Runtime provenance: `engine: original-escaparates-pro`, exact donor blob/path: PASS.
3. Grass preview non-empty and visually distinct: PASS.
4. Video `currentTime` advances while Grass output pixel hash changes: PASS in edit preview and story.
5. Story mode activates the Grass video and prior completed videos remain live: PASS.
6. Save/load regression: PASS.
7. Screenshots + JSON QA report uploaded as Actions artifact: PASS.

Verified workflow:
- Run: `31913705448`
- Verified head: `83f08f9de93b52e46518ccec8fa0328848195adc`
- Artifact: `paint-your-logo-wall-original-effects-4-1`
- Artifact ID: `9254386975`
- Artifact size: 2,928,174 bytes
- Artifact digest: `sha256:9dfcc15dbd3cef8915e6ef57d67d19947928bfc8740462d78140bfbf3ee80966`
- Evidence: `grass-original-escaparates-pro.png`, `grass-original-edit-live.png`, `grass-original-live-video.png`, `v3-report.json`.

Observed Grass live proof from `v3-report.json`:
- Edit preview output hash: `1925221892 → 1775733402`; video time `3.145712 → 0.873128` (loop wrap).
- Story output hash: `2679148539 → 4139948917`; video time `1.904124 → 3.909768`.

## PARTICLES — NEXT

Canonical candidate already identified in Escaparates Pro:
- Path: `labs/source-experiences/particulate-image-pro/source-script.js`
- Blob SHA: `2ab38ec69d91c94bd5e63cecf19fa1a11d8b7654`
- Original source size: 16,499 bytes

Particles must pass the same source/provenance/build/live-video/visual-evidence gate before being marked OK.
