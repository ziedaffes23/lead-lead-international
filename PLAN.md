# Game Plan: Lead & Lead Cinematic Intro

## Risk Tasks

### 1. Timed cinematic camera and action handoffs

- **Why isolated:** Camera rails, a sprinting character proxy, the objective attachment beat, and the throw can feel discontinuous when their timing is authored independently.
- **Approach:** Use a single elapsed-time state machine as the source of truth. The runner follows deterministic path samples; camera target and offset interpolate from matching shot keys. The grab/throw beats expose named callbacks for future GLB animation integration.
- **Verify:** The sprint-to-vault, vault-to-grab, grab-to-throw, and throw-to-impact transitions occur in sequence without pose snapping, camera discontinuity, or a stalled story beat.

### 2. Imported GLB model and animation compatibility

- **Why isolated:** Future supplied character, environment, and object GLBs may differ in rigs, animation names, mesh topology, and hand-bone naming.
- **Approach:** Keep GLTF loading optional with graceful procedural fallbacks. Centralize asset paths and the configurable `handBoneName`. When available, drive action clips with `AnimationMixer` and crossfades; attach and detach the objective with world-transform preservation at grab/release.
- **Verify:** Missing GLBs preserve the full sequence using procedural meshes. With a compatible animated GLB, `Idle → Sprint → Vault → Grab → Throw` actions crossfade and the objective follows the configured hand before release.

### 3. Impact and fallback rendering

- **Why isolated:** Additive particles, flashes, camera shake, DOM distortion, and post-impact UI can cause bright artifacts or inaccessible dead ends on lower-power devices.
- **Approach:** Use an efficient point-sprite dust field, a CSS impact overlay, constrained camera-shake values, device-aware particle counts, and a WebGL availability fallback. High-cost post-processing is avoided in the first working version.
- **Verify:** The thrown objective crosses the camera plane, a flash and dust burst occur once, the canvas returns to darkness, the supplied logo becomes readable, and the ENTER control is visible and usable on desktop and mobile.

## Main Build

Build a standalone React-hosted Three.js full-viewport scene with an original hooded runner proxy, procedural rooftop architecture, generated material references, a visible rooftop objective, a 14-second action sequence, and a final untouched Lead & Lead logo reveal. The experience automatically begins after an honest loader state and offers only subtle pointer parallax.

- **Assets needed:** A direct copy of the supplied logo; generated rooftop, stone, haze, and spark reference assets; optional asset hooks for `character.glb`, `environment.glb`, and `object.glb` supplied later.
- **Verify:**
  - The browser renders the scene live in WebGL; no video or GIF is used.
  - The runner visibly sprints, clears a roof break, reaches the objective, grasps it, throws it, and triggers impact.
  - The official logo is used without modification or re-creation.
  - `window.onIntroComplete` is called by ENTER and the intro can be removed programmatically.
  - Pointer movement makes a small camera offset without controlling the character.
  - Desktop uses richer dust and shadows; mobile reduces device pixel ratio and particle count.
  - WebGL failure presents an accessible static fallback with the original logo and an ENTER option.
  - No console errors occur in a completed captured run.
  - The captured visual uses moonlit indigo, limestone, reserved Relic Gold, strong depth, and high forward motion.

## Rooftop Trial Command Polish

The public `/game` route will be refined into a tactical command deck around the existing procedural rooftop canvas. Its primary keyboard strike input will be `F`, while existing J and X strike aliases remain supported. The visible control language will use readable keycaps for Jump, Slide, and Strike, and the existing touch buttons will remain available.

- **Input risk:** register and remove the `KeyF` listener with the existing gameplay input lifecycle; trigger it only during an active run.
- **Presentation risk:** keep command-panel text outside the canvas and preserve the canvas’s readable size at mobile widths.
- **Verify:** keyboard `F` and touch Strike each set the existing strike telemetry; the command page remains readable at desktop and mobile breakpoints.
