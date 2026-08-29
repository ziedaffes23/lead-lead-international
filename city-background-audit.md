# City background visual audit

- Copied the user-provided 730x273 city artwork to `client/public/assets/lead-lead-city-background.jfif`.
- The home route (`/home`) now visibly uses the city skyline behind the hero composition with a dark blue/black readability overlay; the white/gold title, facts, CTA buttons, and mission console remain legible.
- The registration route remains excluded from the city background and is still a normal scrolling page.
- The intro (`/`) and game (`/game`) are excluded by scoping the new layer to `.game-home:not(.chase-route)`.
- The selected page background is implemented in the final `layout-system.css` cascade with responsive mobile positioning and stronger dark overlays.

## Final route check

The home route is now scoped back to its original cinematic background treatment. The Mission route visibly uses the newly provided 16:9 tower-and-city artwork with a dark overlay that keeps the heading, body copy, cards, and navigation readable. The navigation links remain present in the desktop route markup, and the mobile override now explicitly keeps every link visible in a horizontally scrollable row rather than applying the earlier hide rule.

## Mirage and responsive fixes audit

The Mirage route now renders its live-ranking area as a stable full-width panel instead of a clipped or floating popup. Rank-one styling is scoped to the first podium card and the mobile breakpoint stacks cards without the desktop transform. The current browser session returned the existing live-data unavailable state, so no loaded rank card was available for a visual rank-one check; the rank-one styling is present in the route CSS for when leaderboard data loads.

The final mobile navigation override forces all seven links into a compact seven-column row, and the registration override explicitly removes height and overflow constraints from the document, form, and dossier panel so the page can scroll both directions.

## Mirage redesign verification

The redesigned Mirage route rendered with a clean full-width live-ranking panel, stable spacing, and readable title/empty-state treatment. The browser session returned the existing “LIVE RANKING TEMPORARILY UNAVAILABLE” state, so podium cards were not returned for a visual rank-one check; the rank-one color and podium styling are scoped in the route CSS and will apply when live ranking data is available.
