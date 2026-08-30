/**
 * Moonlit Relic Chase style contract: only original, asset-ready cinematic surfaces;
 * the supplied Lead & Lead logo is referenced unmodified and never recreated in code.
 */
export const CINEMATIC_ASSETS = {
  logo: "/assets/thyna-logo-white.png",
  rooftopReference: "/manus-storage/lead-lead-moonlit-rooftop_f19ec9d4.jpg",
  thynaRooftopBackground: "/assets/thyna-rooftop-background.png",
  stoneTexture: "/manus-storage/lead-lead-stone-material_8e8d229b.jpg",
  spark: "/manus-storage/lead-lead-impact-spark_4cf543da.png",
  haze: "/manus-storage/lead-lead-haze-banner_29cf0119.jpg",
  courierCloth: "/manus-storage/original-courier-cloth_4ef20523.jpg",
  courierLeather: "/manus-storage/original-courier-leather_c9a4f18d.jpg",
  courierCharacter:
    "/manus-storage/original-courier-character-cutout_44180e1b.png",
  courierSprint: "/manus-storage/original-courier-sprint_b7d73961.png",
  courierVault: "/manus-storage/original-courier-vault_6b4fc1a5.png",
  courierGrab: "/manus-storage/original-courier-grab_2dedd96d.png",
  courierThrow: "/manus-storage/original-courier-throw_f998fb71.png",
  character: "/assets/character.glb",
  environment: "/assets/environment.glb",
  object: "/assets/object.glb",
  entryMusic: "/audio/ezios-family.mp3",
} as const;

export const CHARACTER_CONFIG = {
  /** Set this to the right-hand bone name used by the replacement character GLB. */
  handBoneName: "RightHand",
  animationMap: {
    idle: "Idle",
    sprint: "Sprint",
    vault: "Vault",
    grab: "Grab",
    throw: "Throw",
  },
} as const;

export type CinematicAssetConfig = typeof CINEMATIC_ASSETS;
