# Paint Your Logo Wall V2.1 — Capability Donors

V2.1 keeps the product core original and integrates/reimplements selected donor capabilities by family.

## Integrated now

- `Juanmaes83/dripping-spray` — MIT. V2.1 adapts the donor concepts of central aerosol deposit, radial splatter, accumulation threshold and downward drips into `src/v21-style-engine.js`.
- `Juanmaes83/the-canvas-paint` — reference donor for brush/spray interpolation and tool semantics. V2.1 uses its capability model to separate tool behavior from content/reveal.
- `Juanmaes83/pyaint` + `Juanmaes83/autodraw` — research donors for image-to-stroke planning. V2.1 introduces technique-specific deterministic stroke planning; full semantic image tracing remains a later capability.
- `Juanmaes83/pixel2motion` — reference donor for raster/vector/path preparation. V2.1 reserves contour/path-driven Manga and future semantic logo tracing.

## V2.1 architecture

`Asset -> WallJob -> StyleProfile -> Tool Prop -> Technique Mask -> Narrative Beat -> Completion -> Living Artwork`

Each job stores its own method and transforms. The same source asset can therefore be executed as Brush, Roller, Spray, Charcoal, Manga/Ink, Digital, Expressionist or Hyperrealist without changing the asset pipeline.

## Explicitly not claimed as complete

- Full vector-semantic contour extraction from arbitrary raster images.
- True physically simulated wet paint.
- Full image-aware stroke ordering comparable to an offline painter optimizer.
- Production-grade character/tool inverse kinematics.

Those remain separate future capability increments rather than being faked in V2.1.
