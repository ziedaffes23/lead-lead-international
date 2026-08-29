/**
 * Continuous Pursuit Camera contract: a live original Three.js chase through compact limestone architecture,
 * with one smooth camera track through pursuit, objective, grab, throw, and restrained impact light.
 */
import { gsap } from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CINEMATIC_ASSETS, CHARACTER_CONFIG } from "./assets";
import { clamp01, easeOut, getCinematicBeat, lerp, type CinematicPhase } from "./cinematic";
import { createDustField } from "./effects";
import { createProceduralRunner } from "./runner";

export interface CinematicCallbacks {
  demo?: boolean;
  startAt?: number;
  freezeAt?: number;
  onProgress?: (value: number) => void;
  onPhase?: (phase: CinematicPhase) => void;
  onReady?: () => void;
}

export interface CinematicHandle {
  dispose: () => void;
  stop: () => void;
  restart: () => void;
}

type OptionalActor = {
  root: THREE.Object3D;
  mixer?: THREE.AnimationMixer;
  actions: Map<string, THREE.AnimationAction>;
  hand?: THREE.Object3D;
};

const relicGold = new THREE.Color(0xc7a262);
const moonColor = new THREE.Color(0x9eb9dd);

function cubic(value: number) {
  const v = Math.max(0, Math.min(1, value));
  return v * v * (3 - 2 * v);
}

function makeStoneMaterial(texture?: THREE.Texture) {
  if (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.6, 1.6);
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  return new THREE.MeshStandardMaterial({
    color: 0xa8a998,
    map: texture,
    roughness: 0.72,
    metalness: 0.05,
  });
}

function createArchitecture(scene: THREE.Scene, texture?: THREE.Texture) {
  const stone = makeStoneMaterial(texture);
  const shadowStone = stone.clone();
  shadowStone.color.multiplyScalar(0.62);
  const roofGeometry = new THREE.BoxGeometry(14, 0.8, 9.5);
  const slabGeometry = new THREE.BoxGeometry(14.16, 0.16, 9.7);
  const courseGeometry = new THREE.BoxGeometry(13.7, 0.09, 0.14);
  const chipGeometry = new THREE.BoxGeometry(0.22, 0.1, 0.34);
  const ledgeGeometry = new THREE.BoxGeometry(0.55, 1.2, 9.5);
  const columnGeometry = new THREE.CylinderGeometry(0.38, 0.5, 4.7, 10);

  for (let index = 0; index < 8; index += 1) {
    const z = -index * 9.6;
    const x = Math.sin(index * 0.9) * 0.55;
    const roof = new THREE.Mesh(roofGeometry, stone);
    roof.position.set(x, 0, z);
    roof.receiveShadow = true;
    roof.castShadow = true;
    scene.add(roof);

    const slab = new THREE.Mesh(slabGeometry, stone);
    slab.position.set(x, 0.48, z);
    slab.castShadow = true;
    slab.receiveShadow = true;
    scene.add(slab);

    for (let course = -3; course <= 3; course += 1) {
      const joint = new THREE.Mesh(courseGeometry, shadowStone);
      joint.position.set(x, 0.575, z + course * 1.18);
      joint.receiveShadow = true;
      scene.add(joint);
    }

    for (let chip = 0; chip < 12; chip += 1) {
      const wornEdge = new THREE.Mesh(chipGeometry, chip % 3 === 0 ? stone : shadowStone);
      const side = chip % 2 === 0 ? -1 : 1;
      wornEdge.position.set(x + side * (5.1 + (chip % 4) * 0.22), 0.57, z - 3.7 + (chip % 6) * 1.45);
      wornEdge.rotation.set(0.06 * (chip % 2), 0.2 * chip, 0.08 * side);
      wornEdge.scale.set(0.7 + (chip % 3) * 0.16, 1, 0.7 + (chip % 4) * 0.08);
      wornEdge.castShadow = true;
      wornEdge.receiveShadow = true;
      scene.add(wornEdge);
    }

    const leftLedge = new THREE.Mesh(ledgeGeometry, shadowStone);
    leftLedge.position.set(x - 6.75, 0.65, z);
    leftLedge.castShadow = true;
    scene.add(leftLedge);

    const rightLedge = new THREE.Mesh(ledgeGeometry, shadowStone);
    rightLedge.position.set(x + 6.75, 0.65, z);
    rightLedge.castShadow = true;
    scene.add(rightLedge);

    if (index === 2 || index === 5 || index === 7) {
      for (const side of [-1, 1]) {
        const column = new THREE.Mesh(columnGeometry, stone);
        column.position.set(x + side * 4.9, 2.25, z - 1.7);
        column.castShadow = true;
        column.receiveShadow = true;
        scene.add(column);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.28, 1.15), stone);
        cap.position.copy(column.position).add(new THREE.Vector3(0, 2.45, 0));
        cap.castShadow = true;
        scene.add(cap);
      }
    }

    if (index === 3) {
      const gap = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.35, 1.45), shadowStone);
      gap.position.set(x, -0.38, z - 3.65);
      scene.add(gap);
    }
  }

  const temple = new THREE.Group();
  const templeBase = new THREE.Mesh(new THREE.BoxGeometry(11, 1.2, 8), stone);
  templeBase.position.y = 0.6;
  temple.add(templeBase);
  const templeRoof = new THREE.Mesh(new THREE.ConeGeometry(7.2, 3, 4), shadowStone);
  templeRoof.position.y = 6.2;
  templeRoof.rotation.y = Math.PI / 4;
  temple.add(templeRoof);
  for (const x of [-4.5, -1.5, 1.5, 4.5]) {
    const p = new THREE.Mesh(columnGeometry, stone);
    p.position.set(x, 3.1, 2.9);
    temple.add(p);
  }
  temple.position.set(0, 0, -57);
  scene.add(temple);
}

function createRelic() {
  const relic = new THREE.Group();
  relic.name = "ObjectiveRelic";
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.38, 1),
    new THREE.MeshStandardMaterial({
      color: 0xe5ba5f,
      emissive: 0x9b5c08,
      emissiveIntensity: 3.1,
      roughness: 0.22,
      metalness: 0.8,
    }),
  );
  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22),
    new THREE.MeshBasicMaterial({ color: 0xfff2bc, transparent: true, opacity: 0.9 }),
  );
  const cage = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.33, 0.025, 42, 8),
    new THREE.MeshStandardMaterial({
      color: 0xead499,
      metalness: 1,
      roughness: 0.26,
    }),
  );
  cage.scale.setScalar(0.9);
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.52, 0.016, 6, 32),
    new THREE.MeshBasicMaterial({ color: 0xffdc7d, transparent: true, opacity: 0.92 }),
  );
  halo.name = "RelicHalo";
  halo.rotation.x = Math.PI / 2.9;
  relic.add(shell, core, cage, halo);
  relic.castShadow = true;
  return relic;
}

async function existingFile(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

async function loadOptionalActor(scene: THREE.Scene): Promise<OptionalActor | undefined> {
  if (!(await existingFile(CINEMATIC_ASSETS.character))) return undefined;
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(CINEMATIC_ASSETS.character);
  const root = gltf.scene;
  root.name = "SuppliedCharacterGLB";
  root.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  scene.add(root);

  const mixer = new THREE.AnimationMixer(root);
  const actions = new Map<string, THREE.AnimationAction>();
  gltf.animations.forEach((clip) => actions.set(clip.name, mixer.clipAction(clip)));
  const hand = root.getObjectByName(CHARACTER_CONFIG.handBoneName) ?? undefined;
  return { root, mixer, actions, hand };
}

async function loadOptionalSceneAsset(scene: THREE.Scene, url: string): Promise<THREE.Group | undefined> {
  if (!(await existingFile(url))) return undefined;
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  const root = gltf.scene;
  root.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  scene.add(root);
  return root;
}

function playOptionalAction(actor: OptionalActor, preferredName: string, previous?: THREE.AnimationAction) {
  const action = actor.actions.get(preferredName);
  if (!action || action === previous) return action;
  action.reset().fadeIn(0.2).play();
  previous?.fadeOut(0.2);
  return action;
}

export async function createCinematic(
  container: HTMLDivElement,
  callbacks: CinematicCallbacks = {},
): Promise<CinematicHandle> {
  callbacks.onProgress?.(12);
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.8));
  renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.domElement.className = "cinematic-canvas";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05080d);
  scene.fog = new THREE.FogExp2(0x07101b, isMobile ? 0.036 : 0.026);

  const camera = new THREE.PerspectiveCamera(
    isMobile ? 59 : 50,
    (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
    0.1,
    145,
  );
  camera.position.set(1.6, 3.5, 13.5);

  const hemisphere = new THREE.HemisphereLight(0x9cb9df, 0x0a0706, 3.15);
  scene.add(hemisphere);
  const moon = new THREE.DirectionalLight(moonColor, 4.65);
  moon.position.set(-8, 16, 6);
  moon.castShadow = !isMobile;
  moon.shadow.mapSize.set(1024, 1024);
  moon.shadow.camera.left = -18;
  moon.shadow.camera.right = 18;
  moon.shadow.camera.top = 22;
  moon.shadow.camera.bottom = -14;
  scene.add(moon);
  const coldRim = new THREE.DirectionalLight(0x7eb1dd, 2.6);
  coldRim.position.set(8, 5, -22);
  scene.add(coldRim);
  const rooftopFill = new THREE.DirectionalLight(0xa7c9e8, 0.82);
  rooftopFill.position.set(-3, 4, -12);
  scene.add(rooftopFill);
  const moonDisc = new THREE.Mesh(
    new THREE.CircleGeometry(4.6, 32),
    new THREE.MeshBasicMaterial({ color: 0xcbd8ea, transparent: true, opacity: 0.38, depthWrite: false }),
  );
  moonDisc.position.set(-12, 18, -72);
  scene.add(moonDisc);
  const relicLight = new THREE.PointLight(relicGold, 3, 9, 2);
  relicLight.position.set(0, 2.7, -31.2);
  scene.add(relicLight);
  const runnerRim = new THREE.PointLight(0x9cc8f0, 2.1, 8, 2);
  scene.add(runnerRim);
  const runnerGoldGlint = new THREE.PointLight(relicGold, 0, 6, 2);
  scene.add(runnerGoldGlint);

  for (const z of [-8, -19, -41, -52]) {
    const torch = new THREE.PointLight(0xb78e53, 0.72, 11, 2);
    torch.position.set(z % 2 === 0 ? -4.85 : 4.85, 2.1, z);
    scene.add(torch);
  }

  const textureLoader = new THREE.TextureLoader();
  const stoneTexture = textureLoader.load(CINEMATIC_ASSETS.stoneTexture);
  createArchitecture(scene, stoneTexture);
  textureLoader.load(CINEMATIC_ASSETS.rooftopReference, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(92, 49),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.38, depthWrite: false }),
    );
    backdrop.position.set(0, 10, -76);
    scene.add(backdrop);
  });
  callbacks.onProgress?.(38);

  const runner = createProceduralRunner();
  scene.add(runner.root);
  const relic = createRelic();
  relic.position.set(0, 2.72, -31.2);
  scene.add(relic);
  let activeRelic: THREE.Object3D = relic;
  const relicTraceMaterial = new THREE.LineBasicMaterial({
    color: relicGold,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  const relicTrace = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 2.7, -31.2),
      new THREE.Vector3(0.7, 1.15, -28.6),
      new THREE.Vector3(1.25, 0.52, -24.4),
    ]),
    relicTraceMaterial,
  );
  relicTrace.name = "RelicGoldObjectiveTrace";
  scene.add(relicTrace);
  const pursuitTraceMaterial = new THREE.LineBasicMaterial({
    color: relicGold,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  const pursuitTrace = new THREE.Line(new THREE.BufferGeometry(), pursuitTraceMaterial);
  pursuitTrace.name = "RelicGoldPursuitTrace";
  scene.add(pursuitTrace);
  const altar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.95, 1.85, 8),
    new THREE.MeshStandardMaterial({
      color: 0xaaa992,
      map: stoneTexture,
      bumpMap: stoneTexture,
      bumpScale: 0.05,
      roughness: 0.72,
    }),
  );
  altar.position.set(0, 0.9, -31.2);
  altar.castShadow = true;
  altar.receiveShadow = true;
  scene.add(altar);

  const dust = createDustField(isMobile);
  scene.add(dust.points);
  callbacks.onProgress?.(58);

  const ambientHaze = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 30),
    new THREE.MeshBasicMaterial({ color: 0x0d1621, transparent: true, opacity: 0.18, depthWrite: false }),
  );
  ambientHaze.position.set(0, 7, -70);
  scene.add(ambientHaze);

  let externalActor: OptionalActor | undefined;
  let externalAction: THREE.AnimationAction | undefined;
  loadOptionalActor(scene)
    .then((actor) => {
      externalActor = actor;
      if (actor) {
        runner.root.visible = false;
        actor.root.scale.setScalar(1.05);
      }
    })
    .catch(() => {
      // The working procedural runner is intentionally retained if a replacement GLB is invalid.
    });

  loadOptionalSceneAsset(scene, CINEMATIC_ASSETS.environment)
    .then((environment) => {
      if (environment) environment.position.set(0, 0, 0);
    })
    .catch(() => {
      // Procedural architecture remains the reliable default when the authored scene is unavailable.
    });

  loadOptionalSceneAsset(scene, CINEMATIC_ASSETS.object)
    .then((object) => {
      if (object) {
        object.position.set(0, 2.72, -31.2);
        object.scale.setScalar(0.62);
        relic.visible = false;
        activeRelic = object;
      }
    })
    .catch(() => {
      // The original procedural relic remains the reliable default when an authored object is unavailable.
    });

  callbacks.onProgress?.(78);
  const clock = new THREE.Clock();
  const pointerOffset = { x: 0, y: 0 };
  const parallaxX = gsap.quickTo(pointerOffset, "x", { duration: 0.7, ease: "power2.out" });
  const parallaxY = gsap.quickTo(pointerOffset, "y", { duration: 0.7, ease: "power2.out" });
  const initialTime = callbacks.startAt ?? (callbacks.demo ? 11.15 : 0);
  const storyStart = performance.now() - initialTime * 1000;
  let running = true;
  let relicAttached = false;
  let relicReleased = false;
  let releaseStart = new THREE.Vector3();
  let lastPhase: CinematicPhase | undefined;
  let revealSent = false;
  let impactSent = false;
  let disposed = false;

  const updateOptionalActor = (phase: CinematicPhase, delta: number, beat: ReturnType<typeof getCinematicBeat>) => {
    if (!externalActor) return;
    externalActor.root.position.set(beat.runnerX, 0.04 + beat.runnerLift, beat.runnerZ);
    externalActor.root.rotation.y = Math.PI;
    externalActor.mixer?.update(delta);
    const actionName =
      phase === "grab"
        ? CHARACTER_CONFIG.animationMap.grab
        : phase === "throw" || phase === "impact"
          ? CHARACTER_CONFIG.animationMap.throw
          : phase === "sprint" || phase === "opening" || phase === "objective"
            ? CHARACTER_CONFIG.animationMap.sprint
            : CHARACTER_CONFIG.animationMap.idle;
    externalAction = playOptionalAction(externalActor, actionName, externalAction);
  };

  const attachRelic = () => {
    const hand = externalActor?.hand ?? runner.rightHand;
    if (relicAttached || relicReleased) return;
    hand.attach(activeRelic);
    activeRelic.position.set(0.24, 0.02, -0.56);
    activeRelic.rotation.set(-0.35, 0.2, -0.16);
    activeRelic.scale.setScalar(0.84);
    relicAttached = true;
  };

  const releaseRelic = () => {
    if (relicReleased) return;
    activeRelic.getWorldPosition(releaseStart);
    scene.attach(activeRelic);
    relicReleased = true;
    relicAttached = false;
  };

  const positionCamera = (time: number, beat: ReturnType<typeof getCinematicBeat>) => {
    const cameraPosition = new THREE.Vector3();
    const lookAt = new THREE.Vector3();
    if (time < 2) {
      const p = cubic(time / 2);
      cameraPosition.set(lerp(3.2, 1.0, p), lerp(4.5, 3.0, p), lerp(16, 9.5, p));
      lookAt.set(0, 1.5, lerp(-2, -10, p));
    } else if (time < 5) {
      const p = cubic((time - 2) / 3);
      cameraPosition.set(
        beat.runnerX + lerp(2.9, -2.35, p),
        lerp(2.55, 1.92, p) + beat.runnerLift * 0.44,
        beat.runnerZ + lerp(8.4, 6.15, p),
      );
      lookAt.set(beat.runnerX * 0.86, 1.44 + beat.runnerLift * 0.62, beat.runnerZ - 2.25);
    } else if (time < 9.25) {
      const pursuit = clamp01((time - 5) / 4.25);
      const focusZ = lerp(-26.25, -33.7, pursuit);
      cameraPosition.set(
        lerp(-3.063, 1.85, pursuit),
        lerp(1.92, 1.48, pursuit) + beat.runnerLift * 0.32,
        lerp(-17.85, -24.05, pursuit),
      );
      lookAt.set(lerp(-0.613, 0.46, pursuit), lerp(1.44, 1.38, pursuit), focusZ);
    } else if (time < 10.1) {
      const p = cubic((time - 9.25) / 0.85);
      cameraPosition.set(0.1, 1.25, -23.8);
      lookAt.set(0, 1.3, lerp(-34, -22.2, p));
    } else {
      const p = cubic((time - 10.1) / 1.7);
      cameraPosition.set(lerp(0.1, 0, p), lerp(1.25, 1.8, p), lerp(-23.8, -18, p));
      lookAt.set(0, 1.2, -34);
    }
    camera.position.copy(cameraPosition).add(new THREE.Vector3(pointerOffset.x, pointerOffset.y, 0));
    camera.lookAt(lookAt);
  };

  const onPointerMove = (event: PointerEvent) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    parallaxX(x * 0.46);
    parallaxY(-y * 0.28);
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  const onResize = () => {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener("resize", onResize);

  const animate = () => {
    if (disposed || !running) return;
    const delta = Math.min(clock.getDelta(), 0.033);
    const time = callbacks.freezeAt ?? Math.min((performance.now() - storyStart) / 1000, 14);
    const beat = getCinematicBeat(time);

    if (beat.phase !== lastPhase) {
      lastPhase = beat.phase;
      callbacks.onPhase?.(beat.phase);
    }
    if (beat.shouldAttachRelic) attachRelic();
    if (beat.releaseRelic) releaseRelic();

    runner.update(beat, time);
    updateOptionalActor(beat.phase, delta, beat);
    positionCamera(time, beat);

    const runnerPosition = runner.root.position;
    runnerRim.position.set(runnerPosition.x + 2.4, runnerPosition.y + 3.1, runnerPosition.z + 2.2);
    runnerGoldGlint.position.set(runnerPosition.x - 0.18, runnerPosition.y + 1.45, runnerPosition.z - 0.28);
    runnerGoldGlint.intensity = time >= 2 && time < 9.25 ? 1.3 + Math.sin(time * 13) * 0.34 : 0;
    pursuitTrace.geometry.setFromPoints([
      new THREE.Vector3(runnerPosition.x - 0.75, runnerPosition.y + 0.28, runnerPosition.z + 2.8),
      new THREE.Vector3(runnerPosition.x - 0.15, runnerPosition.y + 0.46, runnerPosition.z + 0.9),
      new THREE.Vector3(runnerPosition.x + 0.06, runnerPosition.y + 1.28, runnerPosition.z - 0.18),
    ]);

    if (relicReleased && time < 10) {
      const flight = Math.max(0, Math.min(1, (time - 8.52) / 1.35));
      const end = camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(0.4));
      activeRelic.position.lerpVectors(releaseStart, end, easeOut(flight));
      activeRelic.rotation.x += delta * 14;
      activeRelic.rotation.y += delta * 10;
      activeRelic.scale.setScalar(lerp(0.78, 4.8, flight));
    }
    const relicHalo = activeRelic.getObjectByName("RelicHalo");
    if (relicHalo) {
      relicHalo.rotation.y += delta * 2.1;
      relicHalo.rotation.z += delta * 0.65;
    }
    if (time >= 10) activeRelic.visible = false;

    relicLight.intensity = time < 9.2 ? (relicAttached ? 6.8 : 3.4) : 5.8 * (1 - Math.max(0, time - 9.2));
    relicLight.position.copy(activeRelic.getWorldPosition(new THREE.Vector3()));
    relicTraceMaterial.opacity = time >= 2 && time < 9.2 ? 0.34 + Math.sin(time * 11) * 0.14 : 0;
    pursuitTraceMaterial.opacity = time >= 2 && time < 9.25 ? 0.25 + Math.sin(time * 14) * 0.09 : 0;
    moon.intensity = time > 10 ? 0.65 : 4.65;
    ambientHaze.material.opacity = time > 10 ? 0.56 : 0.18;
    dust.update(delta, time < 9 ? 10.5 : 15, time < 10 ? 0.92 : 0.26);

    if (beat.impactStrength > 0) {
      const kick = beat.impactStrength * 0.38;
      camera.position.x += Math.sin(time * 90) * kick;
      camera.position.y += Math.cos(time * 110) * kick * 0.55;
      renderer.toneMappingExposure = 1.3 + beat.impactStrength * 3.7;
    } else {
      renderer.toneMappingExposure = 1.3;
    }

    if (time > 9.92 && !impactSent) {
      impactSent = true;
      callbacks.onPhase?.("impact");
    }
    if (time > 10.32 && !revealSent) {
      revealSent = true;
      callbacks.onPhase?.("reveal");
    }
    renderer.render(scene, camera);
  };

  callbacks.onProgress?.(100);
  callbacks.onReady?.();
  renderer.setAnimationLoop(animate);

  return {
    stop() {
      running = false;
      renderer.setAnimationLoop(null);
    },
    restart() {
      window.location.reload();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      running = false;
      renderer.setAnimationLoop(null);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf(pointerOffset);
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.geometry.dispose();
          const material = node.material;
          if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
