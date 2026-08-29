import { useEffect, useRef, useState } from "react";
import { CINEMATIC_ASSETS } from "@/game/assets";
import "@/styles/background-music.css";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enabled] = useState(true);
  const [pausedByUser, setPausedByUser] = useState(() => window.sessionStorage.getItem("leadlead:music-paused") === "1");
  const [state, setState] = useState<"loading" | "playing" | "paused" | "blocked" | "error">(() => pausedByUser ? "paused" : "loading");

  useEffect(() => {
    if (!enabled) return undefined;
    const audio = audioRef.current;
    if (!audio) return undefined;
    let disposed = false;
    audio.volume = 0.28;

    const tryPlay = async () => {
      if (pausedByUser || !audio.paused) return;
      setState("loading");
      try {
        await audio.play();
        if (!disposed) setState("playing");
      } catch {
        if (!disposed) setState(audio.error ? "error" : "blocked");
      }
    };
    const retry = () => void tryPlay();
    const onPlay = () => setState("playing");
    const onPause = () => { if (!disposed && !audio.ended) setState("paused"); };
    const onError = () => { if (!disposed) setState("error"); };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    void tryPlay();
    window.addEventListener("pointerdown", retry, true);
    window.addEventListener("keydown", retry, true);
    window.addEventListener("touchstart", retry, true);
    return () => {
      disposed = true;
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      window.removeEventListener("pointerdown", retry, true);
      window.removeEventListener("keydown", retry, true);
      window.removeEventListener("touchstart", retry, true);
      audio.pause();
    };
  }, [enabled, pausedByUser]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      window.sessionStorage.removeItem("leadlead:music-paused");
      setPausedByUser(false);
      void audio.play().then(() => setState("playing")).catch(() => setState(audio.error ? "error" : "blocked"));
    } else {
      window.sessionStorage.setItem("leadlead:music-paused", "1");
      setPausedByUser(true);
      audio.pause();
      setState("paused");
    }
  };

  if (!enabled) return null;
  const label = state === "playing" ? "Pause music" : state === "error" ? "Music unavailable" : "Play music";
  return <div className="background-music" aria-label="Site music"><audio ref={audioRef} src={CINEMATIC_ASSETS.entryMusic} loop preload="auto" autoPlay={!pausedByUser} /><button type="button" onClick={toggle} disabled={state === "error"} aria-pressed={state === "playing"} aria-label={label}><span aria-hidden="true">{state === "playing" ? "Ⅱ" : "▶"}</span>{state === "error" ? "MUSIC OFFLINE" : state === "blocked" ? "PLAY MUSIC" : state === "playing" ? "MUSIC ON" : "MUSIC"}</button></div>;
}
