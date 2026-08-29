# Working Memory

- User requested only the standalone opening cinematic—not navigation, registration, speaker pages, schedules, forms, or other conference-site surfaces.
- The source logo file is `/home/ubuntu/upload/16913.png`; use it exactly as supplied during the reveal.
- The first working version uses original procedural geometry for runner, rooftops, ruins, objective, particles, and camera rails to avoid claiming unavailable GLB assets exist.
- The code must stay Three.js/WebGL-based, use GLTFLoader and AnimationMixer hooks for future assets, and expose `window.onIntroComplete()` on ENTER.
- No video, GIF, copyrighted character, copied game asset, or recreated logo is permitted.

## First Working Version Completed

The first working version renders a live Three.js scene at the only route. It opens on an original hooded procedural runner moving through a moonlit limestone route, includes dust, temple and rail silhouettes, an altar relic, a deterministic sprint/vault/grab/throw timeline, camera rail choreography, impact flash, and a branded post-impact title card. `?demo` resolves immediately to the reveal state for deterministic visual checks.

The official supplied logo is served from `/manus-storage/lead-lead-official-logo_f7b00492.png` without any visual reconstruction or file modification. The optional GLB hooks are present in `client/src/game/assets.ts`; authored character actions use `AnimationMixer` where matching clip names are available, with `RightHand` exposed as the configurable attachment bone.

Validation completed on 15 August 2026: `pnpm check` passed, `pnpm build` passed, desktop cinematic opening and reveal captures were reviewed, and the mobile reveal capture showed the official logo, metadata, and ENTER control. The build emits only a bundle-size advisory for Three.js; it does not block runtime operation.

## Character and Relic-Grip Refinement

The procedural runner now has a clearer original humanoid build: a layered hood and face shadow, torso, mantle, belt, cuffs, palms, articulated limbs, and boots. During the acquisition beat, the runner stops beside the altar instead of moving through it. The relic is attached to the visible near-side `RightHand` anchor with a forward offset, larger scale, Relic Gold glow, and orbiting halo; it no longer reads as intersecting the torso. The `?grab` route freezes the revised beat for testing, while `?demo` continues to show the deterministic final logo reveal.

## Conference Website and Registration Dossier

After ENTER, the cinematic now routes to `/home`, an original Lead & Lead 2K26 conference experience with moonlit rooftops, a courier pursuit cue, Relic Gold trace, chapter-based information, and a registration call-to-action. The `/register` dossier uses 3 September 2026, LC Thyna, and an unannounced venue. It defaults the identity fields to Foulen Fouléni and `foulen.fouleni@aiesec.net`, validates an `@aiesec.net` email, calculates contributions for Tounsi MMB (150 TND), Tounsi EB (225 TND), and Other (150 EUR), and is ready for a Google Apps Script endpoint set via `VITE_SHEETS_WEB_APP_URL`.

## Navigation, Rooftop Trials, and Motion

The ENTER callback now uses a direct navigation to `/home`, ensuring the opening cinematic cannot remain stuck after a user presses ENTER. The user-supplied game project was inspected and its Rooftops of Thyna runner was adapted as a playable `/game` route with double jump, slide, strike, hazards, fragments, three lives, local best score, keyboard controls, touch controls, and a deterministic `?demo` mode for visual checks. The home, game, and registration pages now have transform/opacity-based motion, cold limestone/rooftop pressure cues, a Relic Gold objective pulse, and a full reduced-motion fallback. Desktop and mobile captures verified the public views; `pnpm check` and `pnpm build` pass.

## Direct Route Repair and Expanded Motion

All home, trials, and registration controls now use direct browser navigation rather than client-side route state, avoiding the issue where users remained on the home page after selection. The public pages include scroll-triggered section reveals, active navigation underlines, button glints, courier and relic ambient motion, dust/rail pressure effects, dossier entrance animation, and animation-safe mobile views. A `prefers-reduced-motion` fallback immediately reveals content without non-essential animation. Direct routes and game demo were reviewed at desktop and mobile breakpoints; the production build passes.

## Privacy and Exploration Refinement

The registration dossier now retains Foulen Fouléni as the internal default submission identity without exposing either name field in the visible form. The home page has a new scrollable “Choose your next route” chapter with direct actions for the Rooftop Trials and delegate registration. The intro logo is rendered in white through a non-destructive CSS filter. Desktop and mobile captures confirmed the exploration cards and the revised registration layout.

## Scroll Restoration

The global CSS previously set `body { overflow: hidden; }`, which blocked vertical page scrolling outside the full-viewport intro. The body now permits normal vertical scrolling and clips only horizontal overflow; `#root` uses a minimum height rather than a fixed viewport height. The home, Rooftop Trials, and registration pages were confirmed to render as full scrollable mobile documents while the intro remains viewport-bound.

## LC Thyna Presents Title Reveal

The final intro title card now presents a small white LC Thyna mark inside a ceremonial seal, followed by `LC THYNA`, `PROUDLY PRESENTS`, and a distinct `LEAD & LEAD 2K26` title. The date and conference descriptor sit beneath the lockup, and the ENTER action remains separate and clear. The composition was checked at desktop and mobile sizes; type validation passes.

## Hero-Level Game Invitation

The home hero now includes a distinct `PLAY THE DELEGATE GAME / ROOFTOP TRIALS` button alongside the registration action. The high-contrast blue-gold control routes directly to `/game` and remains visible in the mobile hero, while the later exploration chapter retains a second trials route for delegates who scroll through the conference content.

## Cinematic Rooftop Chase Redesign

The post-intro site now uses a high-motion, layered rooftop-chase system. The home hero contains moonlit architectural mass, moving pressure rails, dust, a pointer-responsive running courier, and an animated Relic Gold objective trace. Every non-hero section carries a recurring chase cue through cold limestone treatment, passing route lines, dust/glint motion, or rail geometry. The trials route now has a route-entry wipe, moving pressure lines, a moonlit temple mass within the canvas, a stronger hooded courier, Relic Gold fragments, and a foreground rail. Registration has been cooled to moonlit stone/blue-gray dossier material with Relic Gold used only as a focused route and contribution signal. Desktop and mobile visual checks confirmed legible layouts; the full production build and type checks pass.

## Persistent Atmospheric World Overhaul

All post-intro routes now mount `CinematicBackground`, a fixed, long-cycle environmental layer built only from CSS transforms and opacity. It supplies star dust, moon drift, aurora, distant and near moonlit architecture, fog, Relic Gold route traces, and a vignette. Home chapters became semi-translucent locations within the same world rather than separate flat bands, with off-axis headings, staggered chapter cards, limestone silhouettes, dust cues, and constrained hover depth. The home runner is identified in-frame as the original LC Thyna delegate courier. Rooftop Trials now renders a deeper moonlit limestone matte-painting: cold stone parapets, a layered temple, haze/dust, cold architectural HUD details, and a Relic Gold guidance line only when an objective exists. Registration retains a protected light moonstone dossier but now floats above the moving night archive, with a white LC Thyna mark for contrast. The visual review feedback has been applied and documented in `ideas.md`; production build, type checks, and desktop/mobile route checks pass.

## Home Hero Character Removal

The moving courier image has been removed from the home hero following user feedback. Its replacement is the original `Assembly Beacon`: a moonstone conference signal tower with orbiting cold pressure rings, moving architectural route lines, a single Relic Gold beacon signal, and compact Assembly metadata. This keeps the page kinetic and cinematic without using a human/action-character focal point. Desktop and mobile views were checked, and `pnpm run check` plus `pnpm run build` pass.

## Continuous Camera and Registration Identity Fields

The opening cinematic no longer switches to an opposing camera setup across the objective/grab/throw sequence. Its camera now follows one continuous pursuit track from the end of the sprint through the relic release, preserving the impact/reveal sequence while avoiding the reported lagging handoff. The registration dossier again presents visible First Name and Last Name inputs. They start blank and show `Foulen` and `Fouléni` as examples, while the submitted name values remain validated as required user input. Desktop and mobile checks, type validation, and the production build pass.

## IM Department Attribution and Two-Step Registration

The visible home attribution now reads `CREATED BY IM DEPARTMENT`; Foulen Fouléni remains only as a form example. Registration is now a two-step flow. Step 1 captures simple delegate identity and contact information: First Name, Last Name, CIN, Local Committee, Phone Number, and AIESEC Email. Step 2 shows the calculated contribution and captures nationality, position, department, optional allergy/note fields, and submission. Each step validates only the fields relevant to it; delegates can return from the participation step to amend simple information. The dossier was also refined after visual review with a moonlit skyline and foreground rail, a worn moonstone material treatment, and a Relic Gold path tied to progress and the primary action. Desktop/mobile visual checks, type validation, and the production build pass.

## Registration Review and Receipt

The delegate flow now has three stages: Information, Participation, and Review. The review stage shows all entered details grouped into editable Information and Participation records, with direct edit actions returning to the relevant stage. Only the review stage submits the form. After a successful endpoint response, the dossier resolves into a submitted-details receipt with the delegate name, committee, AIESEC email, phone, participation profile, contribution, department, event date, unique local reference, and recorded timestamp. It intentionally does not echo the CIN in the receipt. If the Sheets endpoint is missing or errors, the review stage presents the appropriate status instead of fabricating a success receipt. Desktop/mobile visual checks, type validation, and the production build pass.

## Attachments, Deferred Contribution, and Assembly Compass

The project is now full-stack so document storage can be handled securely by the server. In Registration Step 2, delegates may optionally select a profile photo (JPEG, PNG, or WebP, up to 3 MB) and a CV (PDF, up to 5 MB). The browser validates file selection; final submission sends approved documents to the public, size-limited `registration.uploadDocuments` tRPC mutation, which stores them through the built-in S3 helper. The resulting file URLs and names are forwarded to the configured Sheets endpoint and appear as received/not-supplied metadata in the review and success receipt. Uploads do not run when the Sheets endpoint is absent, so the UI never implies a completed registration incorrectly.

Nationality and Position now start unselected. The contribution card shows no price until both choices have been made; review/submission require those selections. The home hero’s tall Beacon has been replaced by the Assembly Compass: a low, stepped moonstone rooftop platform with limestone ledges, etched surfaces, converging route rails, and a focused Relic Gold arrival signal. The original cinematic intro shell was restored after the full-stack upgrade merge, and the site passes Vitest (three tests), type checking, production build, desktop, and mobile visual checks.

Browser-driven validation confirmed that contribution is absent before nationality/position selection, appears after selecting `Tounsi` and `MMB`, and that both optional fixture attachments appear in the review record. The true submission receipt remains intentionally blocked until `VITE_SHEETS_WEB_APP_URL` is configured, because the project does not manufacture a successful submission or receipt without a confirmed endpoint response.

## Home Lighthouse Landmark

Following updated user feedback, the abstract Assembly Compass has been replaced by a **Moonlit Assembly Lighthouse** in the home hero. It is an original tapered limestone lighthouse with a cool stone tower, lit lantern room, low rooftop ledge, and a slow Relic Gold beam sweeping across the architecture. The beam and lamp use transform/opacity-only motion with a reduced-motion still state. The revised hero was visually checked at desktop and mobile sizes; type checking and the production build pass.

## Cobalt and Copper Reference Palette

The full site now draws its color system from the supplied Lead & Lead post. The palette is anchored in Obsidian `#02040A`, Midnight Navy `#061126`, and deep Cobalt `#082A68`, with Electric Cobalt `#1677FF` for geometric depth and Antique Copper `#C37A52` / Ember Copper `#E4A77D` for narrative focus, calls to action, active progress, and the lighthouse lamp. The intro uses cobalt motion lines and copper impact/reveal signals; the persistent background now has cobalt moon, architecture, fog, and stars. Home, trials, and registration use navy material panels, cobalt borders/geometry, and copper primary controls. Desktop and mobile views across all routes were checked, and type checking plus the production build pass.

## Original Realism Upgrade

The copyrighted archive supplied by the user was not integrated. Instead, the original runner now uses generated, non-franchise cloth and leather material maps plus an original high-detail courier visual layer for a more realistic silhouette and costume. The procedural hierarchy remains active for live Three.js movement, camera choreography, shadow, and relic attachment; the visual layer is deliberately not represented as a rigged GLB. A legally usable rigged GLB remains the needed future step for true skeletal character animation.

Validation completed on 15 August 2026: `pnpm check` and `pnpm build` pass. Desktop captures confirmed the more detailed original courier, corrected right-hand relic beat, worn limestone texture treatment, and the Relic Gold acquisition trace.

## Active Courier Motion Pass

The courier now changes through dedicated original visual plates for sprint, vault, acquisition reach, and throw rather than retaining one static pose. The live Three.js transform rig reinforces the action with phase-specific body lean, stride bounce, vault lift, reach, throw follow-through, attachment motion, camera pressure, runner rim light, and a moving Relic Gold pursuit trace. Deterministic inspection routes are available at `?sprint`, `?vault`, `?grab`, `?throw`, and `?demo`; production type checks and builds pass.

## Live 3D Motion Correction

The static 2D character plates were removed following user feedback. The visible courier is now entirely original live Three.js geometry, with articulated torso, head, left and right arms, live right-hand relic anchor, legs, boots, and cloth layers. Sprint, vault, grab, throw, and impact recovery each drive different hierarchical transforms in real time; the sprint and vault cameras were also moved closer to make that motion legible. The current procedural model is honest live 3D animation but not a substitute for a licensed rigged GLB if photo-real skeletal animation is required.

## Rooftop Trial Command Polish

The standalone `/game` route uses a React canvas runner rather than the intro’s Three.js scene. Strike already clears a guard when the game’s `strikeFrames` state is active, with J and X legacy mappings and a touch Strike button. The current improvement adds F as the clearly communicated primary keyboard strike key, retains the existing aliases and touch control, and restyles the page as a compact tactical command deck. The generated reference in `ASSETS.md` guides the canvas framing, rooftop palette, and visible keycap controls.

Desktop and mobile WebDev captures show the new Run Protocol briefing, `F` primary-strike keycap, canvas framing, visible keyboard loadout, and three compact touch controls. The responsive mobile layout stacks the mission panel above the run without obscuring the Strike action.
