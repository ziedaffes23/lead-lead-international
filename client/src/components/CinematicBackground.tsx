/**
 * Persistent Atmospheric World style contract: long-cycle moonlit depth, moving dust, distant stone,
 * and purpose-driven Relic Gold routes stay behind content without competing with conference controls.
 */
import type { CSSProperties } from "react";
import "@/styles/cinematic-background.css";

type CinematicTone = "home" | "trials" | "dossier" | "intro";

const stars = [
  [8, 16, 0.6, 18, -8], [19, 33, 1.1, 23, -14], [31, 10, 0.45, 16, -3],
  [46, 25, 0.8, 28, -17], [57, 12, 0.5, 21, -10], [69, 38, 1.3, 24, -4],
  [81, 18, 0.7, 19, -13], [93, 43, 0.5, 31, -21], [12, 67, 1.2, 25, -6],
  [27, 81, 0.55, 20, -16], [44, 59, 0.85, 29, -12], [62, 76, 0.6, 17, -5],
  [74, 62, 1.05, 27, -18], [89, 84, 0.7, 22, -9], [52, 91, 0.48, 30, -20],
] as const;

function pointStyle([x, y, scale, duration, delay]: readonly number[]): CSSProperties {
  return {
    "--point-x": `${x}%`,
    "--point-y": `${y}%`,
    "--point-scale": String(scale),
    "--point-duration": `${duration}s`,
    "--point-delay": `${delay}s`,
  } as CSSProperties;
}

export function CinematicBackground({ tone = "home" }: { tone?: CinematicTone }) {
  return (
    <div className={`cinematic-background cinematic-background--${tone}`} aria-hidden="true">
      <div className="cinematic-bg-sky" />
      <div className="cinematic-bg-stars">
        {stars.map((point, index) => <i key={`${point[0]}-${point[1]}`} style={pointStyle(point)} className={`cinematic-bg-star star-${index % 3}`} />)}
      </div>
      <div className="cinematic-bg-moon" />
      <div className="cinematic-bg-aurora" />
      <div className="cinematic-bg-architecture cinematic-bg-architecture--far"><i /><i /><i /><i /></div>
      <div className="cinematic-bg-fog cinematic-bg-fog--one" />
      <div className="cinematic-bg-architecture cinematic-bg-architecture--near"><i /><i /><i /></div>
      <div className="cinematic-bg-fog cinematic-bg-fog--two" />
      <div className="cinematic-bg-gold-route"><i /><i /><i /></div>
      <div className="cinematic-bg-vignette" />
    </div>
  );
}
