/**
 * Moonlit Relic Chase style contract: compressed action beats, deliberate pauses,
 * and camera-ready timing that reserves the logo moment for post-impact darkness.
 */
export type CinematicPhase =
  | "opening"
  | "sprint"
  | "objective"
  | "grab"
  | "throw"
  | "impact"
  | "reveal";

export interface CinematicBeat {
  phase: CinematicPhase;
  time: number;
  phaseProgress: number;
  runnerZ: number;
  runnerX: number;
  runnerLift: number;
  armThrow: number;
  shouldAttachRelic: boolean;
  releaseRelic: boolean;
  impactStrength: number;
  revealProgress: number;
}

export const CINEMATIC_DURATION = 14;

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
export const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;
export const easeOut = (value: number) => 1 - (1 - clamp01(value)) ** 3;
export const easeInOut = (value: number) => {
  const v = clamp01(value);
  return v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2;
};

function phaseFor(time: number): CinematicPhase {
  if (time < 2) return "opening";
  if (time < 5) return "sprint";
  if (time < 7) return "objective";
  if (time < 8) return "grab";
  if (time < 9) return "throw";
  if (time < 10) return "impact";
  return "reveal";
}

export function getCinematicBeat(rawTime: number): CinematicBeat {
  const time = Math.min(Math.max(rawTime, 0), CINEMATIC_DURATION);
  const phase = phaseFor(time);

  if (phase === "opening") {
    const p = easeInOut(time / 2);
    return {
      phase, time, phaseProgress: p,
      runnerZ: lerp(6, -1.5, p), runnerX: lerp(0.5, 0.12, p), runnerLift: 0, armThrow: 0,
      shouldAttachRelic: false, releaseRelic: false, impactStrength: 0, revealProgress: 0,
    };
  }

  if (phase === "sprint") {
    const p = easeOut((time - 2) / 3);
    return {
      phase, time, phaseProgress: p,
      runnerZ: lerp(-1.5, -24, p), runnerX: Math.sin(p * Math.PI * 1.6) * 0.75,
      runnerLift: p > 0.52 && p < 0.72 ? Math.sin(((p - 0.52) / 0.2) * Math.PI) * 1.25 : 0,
      armThrow: 0, shouldAttachRelic: false, releaseRelic: false, impactStrength: 0, revealProgress: 0,
    };
  }

  if (phase === "objective") {
    const p = easeInOut((time - 5) / 2);
    return {
      phase, time, phaseProgress: p,
      runnerZ: lerp(-24, -29.7, p), runnerX: lerp(-0.45, 1.25, p), runnerLift: 0, armThrow: 0,
      shouldAttachRelic: false, releaseRelic: false, impactStrength: 0, revealProgress: 0,
    };
  }

  if (phase === "grab") {
    const p = easeInOut((time - 7) / 1);
    return {
      phase, time, phaseProgress: p,
      runnerZ: -29.7, runnerX: 1.25, runnerLift: 0, armThrow: lerp(-0.42, 0.52, p),
      shouldAttachRelic: p > 0.58, releaseRelic: false, impactStrength: 0, revealProgress: 0,
    };
  }

  if (phase === "throw") {
    const p = easeInOut((time - 8) / 1);
    return {
      phase, time, phaseProgress: p,
      runnerZ: -29.7, runnerX: 1.25, runnerLift: 0, armThrow: lerp(0.52, -2.4, p),
      shouldAttachRelic: true, releaseRelic: p > 0.62, impactStrength: 0, revealProgress: 0,
    };
  }

  if (phase === "impact") {
    const p = clamp01((time - 9) / 1);
    return {
      phase, time, phaseProgress: p,
      runnerZ: -29.7, runnerX: 1.25, runnerLift: 0, armThrow: -2.4,
      shouldAttachRelic: true, releaseRelic: true,
      impactStrength: p > 0.82 ? 1 - (p - 0.82) / 0.18 : 0, revealProgress: 0,
    };
  }

  return {
    phase, time, phaseProgress: clamp01((time - 10) / 4),
    runnerZ: -29.7, runnerX: 1.25, runnerLift: 0, armThrow: -2.4,
    shouldAttachRelic: true, releaseRelic: true, impactStrength: 0,
    revealProgress: easeOut((time - 10.2) / 1.8),
  };
}
