/**
 * Moonlit Relic Chase style contract: texture-rich moonlit dust and a singular
 * Relic Gold impact accent; visual effects are sparse, story-timed, and performant.
 */
import * as THREE from "three";

export interface DustField {
  points: THREE.Points;
  update: (delta: number, speed: number, intensity: number) => void;
}

export function createDustField(isMobile: boolean): DustField {
  const count = isMobile ? 140 : 420;
  const positions = new Float32Array(count * 3);
  const seed = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (Math.random() - 0.5) * 22;
    positions[offset + 1] = Math.random() * 7 - 0.5;
    positions[offset + 2] = -Math.random() * 68 + 10;
    seed[offset] = positions[offset];
    seed[offset + 1] = positions[offset + 1];
    seed[offset + 2] = positions[offset + 2];
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xc8d5df,
    size: isMobile ? 0.035 : 0.052,
    transparent: true,
    opacity: 0.54,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);

  return {
    points,
    update(delta, speed, intensity) {
      const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let index = 0; index < count; index += 1) {
        const offset = index * 3;
        const nextZ = attribute.getZ(index) + delta * (speed * (0.75 + (index % 5) * 0.08));
        attribute.setZ(index, nextZ > 13 ? -62 : nextZ);
        attribute.setX(index, seed[offset] + Math.sin(performance.now() * 0.0006 + index) * 0.2);
        attribute.setY(index, seed[offset + 1] + Math.sin(performance.now() * 0.0008 + index * 1.7) * 0.08);
      }
      attribute.needsUpdate = true;
      material.opacity = 0.26 + intensity * 0.47;
    },
  };
}
