# Lead & Lead Cinematic Intro — Design Direction

## Three Candidate Directions

### Theme Name: Moonlit Relic Chase

**Very Brief Intro:** A fast nocturnal pursuit through sun-bleached stone architecture, presented as a polished trailer fragment rather than an ordinary landing page. The image language is restrained, dramatic, and rooted in tangible architectural mass.

**Probability:** 0.07

### Theme Name: Sun-Scorched Archive

**Very Brief Intro:** An aged editorial interpretation built from warm vellum, etched diagrams, and ceremonial timing. The experience would feel archaeological rather than kinetic.

**Probability:** 0.03

### Theme Name: Obsidian Procession

**Very Brief Intro:** A near-black stage of angular silhouettes, precise gold accents, and abstract ritual choreography. The resulting motion language would be ceremonial and graphic rather than environmental.

**Probability:** 0.09

## Selected Direction: Moonlit Relic Chase

### Design Movement

The experience uses **cinematic environmental storytelling** with original classical-Mediterranean forms. It borrows the visual grammar of premium action trailers—camera rails, volumetric atmosphere, compressed depth, and a final impact transition—without borrowing protected characters, insignia, or world assets.

### Core Principles

1. **Momentum before exposition:** the first frame must suggest forward velocity.
2. **Stone, shadow, and silhouette:** pale architecture is sculpted by cold directional light; the runner remains readable as a dark, original hooded silhouette.
3. **Deliberate spectacle:** every effect is attached to a story beat—sprint, vault, acquisition, throw, impact, reveal.
4. **The logo is earned:** the supplied Lead & Lead logo is untouched and appears only after the impact clears the cinematic space.

### Color Philosophy

Moonlit indigo and charcoal establish mystery and depth while worn limestone carries reflected light. A reserved **antique-gold** flare appears only at the objective, impact, and logo sweep, turning one warm hue into a signal of purpose rather than decoration.

### Layout Paradigm

This is a **single-frame moving proscenium** rather than a conventional page. A full-bleed WebGL canvas handles the world while sparse editorial overlays appear at the visual perimeter: the loader first, the reveal lockup afterward, and one entry control at the conclusion.

### Signature Elements

The experience repeats three motifs: converging rooftop rails that pull the eye forward, airborne dust that catches the moonlight, and the thin gold line that forms briefly before a major beat.

### Interaction Philosophy

The sequence is non-interruptible and automatic. Pointer movement contributes only a light parallax offset, preserving the authored camera choreography. The ENTER control is keyboard reachable and exits cleanly through `onIntroComplete()`.

### Animation

Camera motion follows a short, intentional arc: forward drift and rise, lateral tracking during the vault, a brief time-compressed pause at acquisition, a violent perspective rush during the throw, and a quiet scale-and-light reveal after impact. Motion respects reduced-motion preferences by holding a composed final reveal after a shortened transition.

### Typography System

**Cinzel** provides restrained, carved display lettering for the label and entry control. **IBM Plex Mono** provides technical, compact loader and cinematic metadata. Headlines remain tracked and sparse; no generic sans-serif or default wordmark treatment is used.

### Brand Essence

**Lead & Lead is a conference opening that turns leadership into a charged moment of arrival.** Personality: **disciplined, enigmatic, kinetic**.

### Brand Voice

The voice is concise, ceremonial, and certain. Headline and control text should feel like a title card rather than marketing copy.

> “A signal in the dark.”

> “Enter the assembly.”

### Wordmark & Logo

The official uploaded logo remains the one true mark. It is presented at its original proportions after the impact with a restrained halo and moving light sweep; no generated or replacement logo is permitted.

### Signature Brand Color

**Relic Gold — #C7A262**. It appears sparingly as the objective energy, impact line, and logo sweep.

## Style Decisions

Every captured state must carry a recognizable Moonlit Relic Chase signal: sculpted limestone depth, a hooded silhouette, airborne dust, converging rails, or the Relic Gold objective trace. The title-card state must retain the exact supplied logo, restrained gold sweep, Cinzel display control, IBM Plex Mono metadata, and a single ceremonial ENTER action. Darkness is permitted only when its form remains readable through indigo atmosphere, cold stone highlights, and deliberate depth cues.

The cinematic world should read as worn limestone under cold moonlight rather than as neutral primitive geometry. Each chase frame must retain a visible pressure cue—angled camera, receding rooftop edges, an athletic reach, dust flow, or a relic energy trace. Relic Gold remains narrative light rather than an ordinary prop color.

The acquisition beat prioritizes a single readable hierarchy: a cold-rim-lit original runner reaching from the textured limestone route toward the warm Relic Gold trace and altar. Lighting, dust, perspective rails, and the relic trail must reinforce that sequence rather than compete for attention.

Every action frame uses a pressure-line composition: asymmetric tracking camera, off-axis runner pose, receding stone ledges, a moving dust field, and a sparse Relic Gold trace. Architectural texture is reinforced with irregular worn edges and individual block seams so the route never reads as smooth generic gray geometry.

## Cinematic Rooftop Chase — Website Execution

The conference website now follows the same direction with an **interactive trailer grammar**. The home hero is a layered chase frame rather than an editorial poster: moonlit rooftop depth, a running courier, a moving Relic Gold objective, a foreground rail, and content positioned as the brief between action beats. The gathering, trials, and dossier use different motion rhythms, so the experience has escalation instead of repetitive animation.

Home motion uses a staged arrival: architectural depth fades up, pressure lines move, the courier enters from the right, and the Relic Gold signal traces the route. As visitors scroll, section titles rise from below and cards respond with shallow physical lift. The trials route favors camera-like drift, animated game framing, and velocity detail. The registration route slows down into a secure dossier sequence: rail light, a calmer courier silhouette, and field focus feedback. All routes retain a clear static equivalent when `prefers-reduced-motion` is enabled.

Every route’s first visible state now carries a clear Moonlit Relic Chase depth cue—moonlit limestone, a receding roof rail, a courier silhouette, airborne dust, or a purposeful Relic Gold route. The playable Rooftop Trials uses the same moonlit limestone matte-painting language as the wider site, with flat skyline shapes kept only as a distant atmospheric layer. Relic Gold `#C7A262` is reserved for routes, objective fragments, impact/reveal lines, key numerals, and primary entry actions; structural borders and ordinary ornaments remain cold and architectural.

### Registration Refinement

Registration always preserves two readable environmental depth layers behind the dossier: a distant moonlit roofline and a foreground rail or limestone ledge. The form slab is treated as a pale moonstone archive surface with worn grain, etched seams, and a cold rim, never a generic flat card. On this route, Relic Gold travels through the progression path and primary action, rather than appearing as general trim.

### Delegate Attachments and Home Landmark

Registration accepts an optional profile photo and CV only after a delegate reaches their participation details. Photos are constrained to JPEG, PNG, or WebP formats up to 3 MB; CVs accept PDF only up to 5 MB. Files are uploaded only after final review and a confirmed submission attempt, then appear in the review and receipt as file-status metadata rather than exposing the underlying document data.

The home hero uses a **Moonlit Assembly Lighthouse**: an original tapered limestone beacon at the rooftop edge, with a single warm Relic Gold lamp and a slow, transform-only light beam crossing the surrounding architecture. It serves as a clear conference landmark, keeps the hero kinetic, and avoids both the prior action-character and abstract-interface focal treatments.

## Persistent Atmospheric World — Site-wide Redesign

### Design Movement

The redesigned website becomes a **continuous cinematic environment** rather than a set of isolated sections. It uses an action-film matte-painting grammar: distant skyline layers, drifting night haze, orbital moonlight, moving star dust, and surgical Relic Gold light routes behind the content.

### Core Principles

1. **The world never stops breathing:** each route carries slow atmospheric motion even while the content remains legible and stable.
2. **Depth is architectural:** every page is composed from far skyline, middle fog, foreground rails, and a readable content plane.
3. **Gold must travel with purpose:** warm light appears as a moving route signal, never as generic decoration.
4. **Power through restraint:** animation stays low-frequency, transform/opacity-based, and immediately yields to reduced-motion settings.

### Color Philosophy

Near-black ink and mineral indigo form an infinite night field; cold desaturated blue creates distance and moonlit stone; Relic Gold becomes the moving human signal cutting across the scene. Registration gets a small increase in pale moonstone material so the dossier remains a confident point of entry rather than a dim overlay.

### Layout Paradigm

Pages float over one **fixed atmospheric world**. Local sections change the apparent temperature through translucent material planes and their own architecture cue, but they do not break the night into disconnected colored bands. Home sections flow like locations on one rooftop route; trials intensify the velocity; registration slows into a protected archive ledge.

### Signature Elements

The system repeats three high-recognition motifs: a subtle star-and-dust drift, translucent skyline silhouettes sliding at different speeds, and thin gold light routes that arc past content without obscuring it.

### Character-Free Home Focal Treatment

The home hero uses the **Moonlit Assembly Lighthouse**, an original tapered limestone landmark on the rooftop edge. Its warm lamp sends a slow, constrained Relic Gold beam over cold roof lines, preserving the invitation and forward movement of the hero without a human/action-character focal point or an abstract interface object.

## Cobalt and Copper Palette — Reference Post Translation

The supplied post shifts the visual language from pale moonstone gold toward a more dramatic **cobalt-and-copper night**. The implementation uses three dark layers—Obsidian `#02040A`, Midnight Navy `#061126`, and deep Cobalt `#082A68`—with Electric Cobalt `#1677FF` for geometry, rails, and atmospheric glow. Antique Copper `#C37A52` becomes the narrative signal, supported by lighter Ember Copper `#E4A77D` for essential focus and headings. Text stays warm ivory `#F4E3D5` over dark material to preserve accessibility.

Geometry and navigation inherit cobalt blue; only calls to action, key progress, the lighthouse lamp, and active narrative traces use copper. Registration retains its protected dossier feeling but becomes a cool navy stone surface with copper focus states instead of pale gray moonstone.

### Interaction and Animation

Navigation and cards gain physical depth through short transform-based lift, rails brighten on hover, and copy reveals linearly in the reading order. Persistent environmental layers move on long 12–38 second cycles, ensuring a powerful background without distracting from forms, controls, or the canvas game. Reduced motion freezes the environment in a composed still frame.
