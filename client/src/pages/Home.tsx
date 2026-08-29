import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CinematicIntro } from "@/components/CinematicIntro";

export default function Home() {
  const [, navigate] = useLocation();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) setSkipIntro(true);
  }, [reducedMotion]);

  useEffect(() => {
    if (!skipIntro) return;
    navigate("/home");
  }, [navigate, skipIntro]);

  if (skipIntro) return null;
  return <CinematicIntro reducedMotion={reducedMotion} onIntroComplete={() => navigate("/home")} />;
}
