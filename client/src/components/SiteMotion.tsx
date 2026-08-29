/** Moonlit Relic Chase style contract: lightweight scroll reveal orchestration for public page sections. */
import { useEffect } from "react";

export function SiteMotion() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { (entry.target as HTMLElement).classList.add("is-visible"); observer.unobserve(entry.target); } });
    }, { threshold: 0.13, rootMargin: "0px 0px -7%" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return null;
}
