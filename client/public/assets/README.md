# Replaceable Cinematic Assets

Place user-supplied replacements here only when they are small enough to be deployed safely, or use managed storage and update `client/src/game/assets.ts`.

| File | Expected role | Notes |
| --- | --- | --- |
| `character.glb` | Original animated hooded runner | Include `Idle`, `Sprint`, `Vault`, `Grab`, and `Throw` clips where possible. Update `handBoneName` in `assets.ts` to match the rig. |
| `environment.glb` | Original Mediterranean environment | Retain an unobstructed rooftop route toward the altar around `z = -31`. |
| `object.glb` | The target relic | Keep the pivot centered; it is attached to the configured right hand and released toward the camera. |

Until such assets are provided, the live Three.js scene uses an original procedural runner, rooftop, altar, and relic fallback rather than a copied game asset.
