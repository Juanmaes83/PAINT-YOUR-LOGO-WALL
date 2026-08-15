# V3 Original Effects — sequential integration log

Safety branch: `agent/logo-crew-v3-original-effects`
Stable V3 remains: `agent/logo-crew-v3`

## GRASS — QA IN PROGRESS

Canonical source:
- Repository: `Juanmaes83/escaparates-pro`
- Ref: `master`
- Path: `labs/source-experiences/grass-image-processing-pro/source-script.js`
- Blob SHA: `91b6441f8cb31f6ff79f14a8cc0d4ab375c929a1`
- Original source size: 19,112 bytes

Integration:
- Source-faithful extracted core: `src/v3/donors/grass/grass-original-core.js`
- Thin runtime adapter: `src/v3/adapters/grass-adapter.js`
- Runtime registry: `src/v3-effect-engine.js`
- Live-media capability signal: `src/v23-jobs.js`

Acceptance gate before marking GRASS OK:
1. Build and syntax checks green.
2. Runtime snapshot reports `engine: original-escaparates-pro` and exact donor blob/path.
3. Grass preview is non-empty and visually distinct.
4. Real video currentTime advances while Grass output pixels change.
5. Story mode still activates video and keeps prior jobs live.
6. Save/load regression remains green.
7. QA screenshots and report uploaded as GitHub Actions artifact.

Particles must not be promoted to original until Grass passes this gate.
