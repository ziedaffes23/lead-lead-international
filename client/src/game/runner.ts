/**
 * Moonlit Relic Chase style contract: an original, fully visible procedural 3D courier.
 * The character is animated with live articulated transforms; no static character images are rendered.
 */
import * as THREE from "three";
import { CINEMATIC_ASSETS } from "./assets";
import type { CinematicBeat } from "./cinematic";

export interface ProceduralRunner {
  root: THREE.Group;
  rightHand: THREE.Group;
  update: (beat: CinematicBeat, elapsed: number) => void;
}

type Limb = { pivot: THREE.Group; mesh: THREE.Mesh };

function limb(material: THREE.Material, radius: number, length: number): Limb {
  const pivot = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, Math.max(0.12, length - radius * 2), 6, 10),
    material,
  );
  mesh.position.y = -length / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  pivot.add(mesh);
  return { pivot, mesh };
}

function loadMaterialTexture(url: string, repeat: number) {
  const texture = new THREE.TextureLoader().load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function damp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

export function createProceduralRunner(): ProceduralRunner {
  const root = new THREE.Group();
  root.name = "OriginalArticulatedCourier";

  const clothTexture = loadMaterialTexture(CINEMATIC_ASSETS.courierCloth, 1.8);
  const leatherTexture = loadMaterialTexture(CINEMATIC_ASSETS.courierLeather, 2.3);
  const cloakMaterial = new THREE.MeshStandardMaterial({
    color: 0x637a8e,
    map: clothTexture,
    bumpMap: clothTexture,
    bumpScale: 0.055,
    roughness: 0.77,
    metalness: 0.02,
  });
  const innerCloakMaterial = new THREE.MeshStandardMaterial({
    color: 0x344d61,
    map: clothTexture,
    bumpMap: clothTexture,
    bumpScale: 0.04,
    roughness: 0.72,
    metalness: 0.03,
  });
  const leatherMaterial = new THREE.MeshStandardMaterial({
    color: 0x573d28,
    map: leatherTexture,
    bumpMap: leatherTexture,
    bumpScale: 0.065,
    roughness: 0.62,
    metalness: 0.08,
  });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0x80604d, roughness: 0.83 });

  const lowerCloak = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.15, 10, 1, true), cloakMaterial);
  lowerCloak.position.y = 1.1;
  lowerCloak.scale.z = 0.76;
  root.add(lowerCloak);
  const splitCloak = new THREE.Mesh(
    new THREE.ConeGeometry(0.57, 0.88, 10, 1, true, Math.PI * 0.1, Math.PI * 0.8),
    innerCloakMaterial,
  );
  splitCloak.position.set(0, 1.02, 0.08);
  splitCloak.rotation.y = Math.PI;
  splitCloak.scale.z = 0.76;
  root.add(splitCloak);

  const torsoPivot = new THREE.Group();
  torsoPivot.position.y = 1.14;
  root.add(torsoPivot);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.78, 6, 12), innerCloakMaterial);
  torso.position.y = 0.39;
  torso.scale.z = 0.85;
  torsoPivot.add(torso);
  const shoulderMantle = new THREE.Mesh(new THREE.ConeGeometry(0.64, 0.48, 10, 1, true), cloakMaterial);
  shoulderMantle.position.y = 0.79;
  shoulderMantle.scale.z = 0.78;
  torsoPivot.add(shoulderMantle);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.075, 6, 16), leatherMaterial);
  collar.position.y = 0.84;
  collar.rotation.x = Math.PI / 2;
  collar.scale.z = 0.82;
  torsoPivot.add(collar);
  const diagonalStrap = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.06, 0.08), leatherMaterial);
  diagonalStrap.position.set(-0.16, 0.3, -0.3);
  diagonalStrap.rotation.set(0.1, 0, -0.46);
  torsoPivot.add(diagonalStrap);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.2, 8), skinMaterial);
  neck.position.y = 0.92;
  torsoPivot.add(neck);
  const headPivot = new THREE.Group();
  headPivot.position.y = 1.05;
  torsoPivot.add(headPivot);
  const hood = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 10), cloakMaterial);
  hood.position.set(0, 0.3, 0.01);
  hood.rotation.x = -0.1;
  headPivot.add(hood);
  const shadowedFace = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8), skinMaterial);
  shadowedFace.position.set(0, 0.19, -0.17);
  shadowedFace.scale.set(0.86, 1.12, 0.6);
  headPivot.add(shadowedFace);
  const faceWrap = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.16, 0.07), leatherMaterial);
  faceWrap.position.set(0, 0.12, -0.3);
  faceWrap.rotation.x = -0.08;
  headPivot.add(faceWrap);

  const leftArm = limb(cloakMaterial, 0.13, 0.9);
  leftArm.pivot.position.set(-0.43, 0.67, 0);
  torsoPivot.add(leftArm.pivot);
  const rightArm = limb(cloakMaterial, 0.13, 0.9);
  rightArm.pivot.position.set(0.43, 0.67, 0);
  torsoPivot.add(rightArm.pivot);
  const rightHand = new THREE.Group();
  rightHand.name = "RightHand";
  rightHand.position.set(0, -0.9, -0.03);
  rightArm.pivot.add(rightHand);
  const rightPalm = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), leatherMaterial);
  rightPalm.scale.set(0.85, 1.08, 0.75);
  rightHand.add(rightPalm);
  const rightCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.2, 8), innerCloakMaterial);
  rightCuff.position.y = 0.13;
  rightHand.add(rightCuff);
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), leatherMaterial);
  leftHand.position.set(0, -0.9, -0.03);
  leftArm.pivot.add(leftHand);

  const leftLeg = limb(innerCloakMaterial, 0.16, 1.03);
  leftLeg.pivot.position.set(-0.22, 0.78, 0.04);
  root.add(leftLeg.pivot);
  const rightLeg = limb(innerCloakMaterial, 0.16, 1.03);
  rightLeg.pivot.position.set(0.22, 0.78, 0.04);
  root.add(rightLeg.pivot);
  const bootGeometry = new THREE.BoxGeometry(0.34, 0.18, 0.52);
  for (const leg of [leftLeg, rightLeg]) {
    const boot = new THREE.Mesh(bootGeometry, leatherMaterial);
    boot.position.set(0, -1.03, -0.1);
    leg.pivot.add(boot);
  }

  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.045, 6, 18), leatherMaterial);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 1.05;
  root.add(belt);
  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.12, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x826633, roughness: 0.4, metalness: 0.65 }),
  );
  buckle.position.set(0, 1.05, -0.41);
  root.add(buckle);

  root.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return {
    root,
    rightHand,
    update(beat, elapsed) {
      const sprinting = beat.phase === "opening" || beat.phase === "sprint" || beat.phase === "objective";
      const vaulting = beat.phase === "sprint" && beat.runnerLift > 0.05;
      const grabbing = beat.phase === "grab";
      const throwing = beat.phase === "throw";
      const recovering = beat.phase === "impact";
      const stride = sprinting ? Math.sin(elapsed * 15.5) : 0;
      const lift = sprinting ? Math.abs(stride) * 0.075 : 0;
      const phaseProgress = beat.phaseProgress;

      root.position.set(beat.runnerX, 0.55 + beat.runnerLift + lift, beat.runnerZ);
      root.rotation.set(
        vaulting ? -0.46 : grabbing ? 0.34 : throwing ? -0.18 : recovering ? 0.13 : sprinting ? -0.15 : 0,
        Math.sin(elapsed * 0.68) * 0.04 + (throwing ? -0.2 : 0),
        sprinting ? stride * 0.035 : grabbing ? 0.08 : throwing ? -0.06 : 0,
      );

      leftLeg.pivot.rotation.set(0, 0, 0);
      rightLeg.pivot.rotation.set(0, 0, 0);
      leftArm.pivot.rotation.set(0, 0, 0);
      rightArm.pivot.rotation.set(0, 0, 0);
      torsoPivot.rotation.set(0, 0, 0);
      headPivot.rotation.set(0, 0, 0);
      lowerCloak.rotation.set(0, 0, 0);
      splitCloak.rotation.set(0, Math.PI, 0);
      rightHand.rotation.set(0, 0, 0);

      if (vaulting) {
        const arc = Math.sin(Math.min(1, beat.runnerLift / 1.25) * Math.PI);
        leftLeg.pivot.rotation.x = -1.1;
        rightLeg.pivot.rotation.x = 0.96;
        leftLeg.pivot.rotation.z = 0.2;
        rightLeg.pivot.rotation.z = -0.16;
        leftArm.pivot.rotation.x = -1.05;
        rightArm.pivot.rotation.x = 0.82;
        rightArm.pivot.rotation.z = -0.48;
        torsoPivot.rotation.x = -0.23 - arc * 0.16;
        torsoPivot.rotation.z = 0.12;
        headPivot.rotation.x = 0.14;
        lowerCloak.rotation.x = 0.22;
        lowerCloak.rotation.z = -0.18;
        splitCloak.rotation.y = Math.PI + 0.35;
      } else if (grabbing) {
        leftLeg.pivot.rotation.x = -0.76;
        rightLeg.pivot.rotation.x = 0.52;
        leftLeg.pivot.rotation.z = 0.16;
        rightLeg.pivot.rotation.z = -0.13;
        leftArm.pivot.rotation.x = 0.46;
        rightArm.pivot.rotation.x = -1.18;
        rightArm.pivot.rotation.z = -0.42;
        torsoPivot.rotation.x = 0.43;
        torsoPivot.rotation.y = -0.16;
        headPivot.rotation.x = -0.28;
        lowerCloak.rotation.x = -0.17;
        lowerCloak.rotation.z = 0.11;
        rightHand.rotation.x = -0.28;
      } else if (throwing) {
        leftLeg.pivot.rotation.x = damp(-0.42, 0.64, phaseProgress);
        rightLeg.pivot.rotation.x = damp(0.58, -0.3, phaseProgress);
        leftArm.pivot.rotation.x = damp(0.7, -0.46, phaseProgress);
        rightArm.pivot.rotation.x = damp(-1.25, 2.08, phaseProgress);
        rightArm.pivot.rotation.z = damp(-0.42, -0.86, phaseProgress);
        torsoPivot.rotation.x = damp(0.33, -0.18, phaseProgress);
        torsoPivot.rotation.y = damp(-0.46, 0.62, phaseProgress);
        torsoPivot.rotation.z = -0.11;
        headPivot.rotation.y = 0.24;
        lowerCloak.rotation.x = damp(-0.12, 0.27, phaseProgress);
        lowerCloak.rotation.z = -0.22;
        splitCloak.rotation.y = Math.PI - 0.44;
        rightHand.rotation.x = -0.44;
      } else if (recovering) {
        leftLeg.pivot.rotation.x = 0.34;
        rightLeg.pivot.rotation.x = -0.42;
        leftArm.pivot.rotation.x = -0.34;
        rightArm.pivot.rotation.x = 1.38;
        rightArm.pivot.rotation.z = -0.58;
        torsoPivot.rotation.x = 0.18;
        torsoPivot.rotation.y = 0.24;
        headPivot.rotation.x = 0.17;
        lowerCloak.rotation.x = 0.18;
      } else if (sprinting) {
        leftLeg.pivot.rotation.x = stride * 0.96;
        rightLeg.pivot.rotation.x = -stride * 0.96;
        leftArm.pivot.rotation.x = -stride * 0.83;
        rightArm.pivot.rotation.x = stride * 0.83;
        leftArm.pivot.rotation.z = -0.08;
        rightArm.pivot.rotation.z = 0.08;
        torsoPivot.rotation.x = -0.17 + Math.cos(elapsed * 15.5) * 0.055;
        torsoPivot.rotation.y = stride * 0.09;
        headPivot.rotation.x = 0.12;
        headPivot.rotation.y = -stride * 0.035;
        lowerCloak.rotation.x = 0.12 + Math.abs(stride) * 0.16;
        lowerCloak.rotation.z = -stride * 0.13;
        splitCloak.rotation.y = Math.PI + stride * 0.22;
      } else {
        torsoPivot.rotation.y = Math.sin(elapsed * 1.6) * 0.025;
        headPivot.rotation.y = Math.sin(elapsed * 0.9) * 0.06;
        lowerCloak.rotation.z = Math.sin(elapsed * 1.2) * 0.025;
      }
    },
  };
}
