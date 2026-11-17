# Cerberus video engine (Remotion + Three.js)

Builds the daily vertical video, cover and Pinterest pin for @cerberusvault.ai.

## Daily use
1. `npm ci` (first time per machine).
2. Edit `src/Daily.tsx`: the CONFIG block at the top (hook, rows, captions, debate line, payoff, end card, timings).
   For format B (maths breakdown) or C (product demo), replace the scene body between the Hook/BeatCaption and the CommentBubble,
   keeping the shared pieces: `Hook`, `BeatCaption`, `CommentBubble`, `EndCard`, `ExampleLabel`, and a 3D layer via `Canvas3D`.
3. Edit `src/Pin.tsx` (PIN block).
4. `./render-daily.sh YYYY-MM-DD [coverFrame]` → writes `../social/YYYY-MM-DD/video.mp4|cover.jpg|pin.jpg` and `out/contact.png` (check frames) — look at it.

Preview live: `npm run studio`.

## How the 3D works
- `components/Lanes3D.tsx`: `Canvas3D` is a transparent `ThreeCanvas` with an **orthographic camera at zoom 1**, so 1 three.js unit = 1 page pixel.
  Use `px(x, y)` logic (top-left page pixels) to put 3D objects exactly on top of HTML layout. Included: `Bars3D` (growing 3D bars), `Drifters`
  (background low-poly shapes), `PayoffRing` (spinning ring behind a big number).
- `components/DemoScene3D.tsx`: a perspective-camera scene (composition `Demo3D`) for hero-object shots.
- All motion must come from `useCurrentFrame()` — never `useFrame()` or clocks — so renders are deterministic.

## Rules baked in
Brand tokens in `src/brand.ts`. Key text in the top 70%, bottom 25% and right edge clear. "EXAMPLE FIGURES" label when numbers show.
Video is rendered `--muted` and re-encoded H.264 yuv420p +faststart with no audio track (the owner adds a trending sound).

## Environment
`remotion.config.ts` points at the preinstalled cloud Chromium (`/opt/pw-browsers/...`) with software WebGL (`swangle`).
On a normal computer delete the `setBrowserExecutable` line (Remotion downloads its own) and use `angle` for GPU speed.
