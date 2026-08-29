# Structure: Lead & Lead Cinematic Intro

```text
client/src/
  components/
    CinematicIntro.tsx     # React lifecycle frame, loader, reveal overlay, fallback and enter control
  game/
    cinematic.ts           # Timeline state and shot timing
    effects.ts             # Dust field, flash state, limited camera shake and device settings
    scene.ts               # Three.js renderer, world construction, asset loaders and render loop
    runner.ts               # Original procedural runner and optional GLB/AnimationMixer integration
    assets.ts               # Asset paths, logo URL and GLB configuration including hand bone
  pages/
    Home.tsx               # Standalone integration surface and onIntroComplete bridge
  styles/
    cinematic.css          # Cinematic overlays and accessible visual controls
```

The React layer creates and disposes the canvas exactly once. The Three.js layer owns only the renderer, scene, camera, meshes, asset loaders, and animation loop. The cinematic state machine emits small state snapshots so React can show the loader, final logo, and entry control without participating in frame-by-frame rendering.

Future models are expected at `/assets/character.glb`, `/assets/environment.glb`, and `/assets/object.glb`. If those paths are unavailable, the procedural runner, architecture, and relic remain active. The supplied `logo.png` is a direct, unedited file copy stored outside the project and referenced via managed storage.

For integration, render `CinematicIntro` as the first layer and pass an `onIntroComplete` callback. The component also dispatches `leadlead:intro-complete` on `window` before removing itself, allowing a host application to reveal its own previously mounted content without coupling the WebGL frame loop to React routing.

## Rooftop Trial Route

`client/src/pages/Game.tsx` composes the public route shell, its tactical briefing, the shared header, and the registration continuation. `client/src/components/RooftopRun.tsx` owns the lifecycle-safe 2D canvas, procedural scene, gameplay state, and keyboard/touch input listeners. The existing chase styles provide motion and the new command layer will provide keycap-oriented visual hierarchy without moving gameplay state into React.
