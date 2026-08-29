# Assets

**Art direction:** Original, premium game-cinematic moonlit Mediterranean architecture. Indigo-black atmosphere, pale worn limestone, atmospheric dust, hard moonlight, and scarce Relic Gold (#C7A262) accents. The environment is compact and procedural, designed for forward speed and cinematic depth rather than open-world exploration.

| Asset | Role | Intended size | Source | Runtime use |
| --- | --- | --- | --- | --- |
| Official Lead & Lead logo | Final lockup | 480 px maximum display width | Supplied by user; must remain unedited | DOM image during logo reveal and WebGL-unavailable fallback |
| Moonlit rooftop reference | Environment mood and distant background | 92m × 49m plane | `/manus-storage/lead-lead-moonlit-rooftop_f19ec9d4.jpg` | Distant in-world environment plate |
| Worn limestone material | Architecture reference | 2m repeat material target | `/manus-storage/lead-lead-stone-material_8e8d229b.jpg` | Optional repeat texture for procedural roofs and pillars |
| Impact spark sprite | Momentary impact flare | 56rem maximum overlay width | `/manus-storage/lead-lead-impact-spark_4cf543da.png` | DOM/WebGL-adjacent impact effect |
| Haze banner | Dark logo-reveal ambience | 1920 × 1080 fullscreen | `/manus-storage/lead-lead-haze-banner_29cf0119.jpg` | Subtle background behind final lockup |
| Original courier cloth | Layered hood and tunic material | 1.8× repeated on costume meshes | `/manus-storage/original-courier-cloth_4ef20523.jpg` | Original non-franchise material map for the live runner proxy |
| Original courier leather | Belt, glove, boot, and strap material | 2.3× repeated on costume meshes | `/manus-storage/original-courier-leather_c9a4f18d.jpg` | Original non-franchise material map for the live runner proxy |
| Original courier character plate | High-detail visual enhancement | 1.84m × 3.22m camera-facing layer | `/manus-storage/original-courier-character-cutout_44180e1b.png` | Original non-franchise visual layer over the live procedural transform rig |
| `/assets/character.glb` | Optional original animated character | 1.8m tall | Replaceable user-provided file | Loaded through GLTFLoader + AnimationMixer, with configured hand bone |
| `/assets/environment.glb` | Optional authored environment | 70m × 40m scene area | Replaceable user-provided file | Added behind procedural geometry |
| `/assets/object.glb` | Optional objective artifact | 0.45m diameter | Replaceable user-provided file | Added as the target object and later attached/released |
| Rooftop Trial command target | In-game visual QA target | 16:9 game-window reference | `/manus-storage/rooftop-trial-command-target_8bc3877d.png` | Guides the procedural game page’s command-deck hierarchy, keycap strip, and cobalt/copper tactical signals; not rendered as a runtime asset. |

The original user logo is never generated, redrawn, recolored, cropped, or otherwise altered. It is copied to managed project storage as a direct file asset before implementation.
