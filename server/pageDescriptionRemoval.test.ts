import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [home, sections, game, register] = await Promise.all([
  readFile(new URL("../client/src/pages/ConferenceHome.tsx", import.meta.url), "utf8"),
  readFile(new URL("../client/src/pages/ConferenceSection.tsx", import.meta.url), "utf8"),
  readFile(new URL("../client/src/pages/Game.tsx", import.meta.url), "utf8"),
  readFile(new URL("../client/src/pages/Register.tsx", import.meta.url), "utf8"),
]);

describe("streamlined public page introductions", () => {
  it("removes homepage and standalone-page description elements while preserving titles and actions", () => {
    expect(home).not.toContain("world-hero__lead");
    expect(home).not.toContain("mission-console__copy");
    expect(sections).not.toContain("section-intro-row__copy");
    expect(sections).not.toContain("Continue through the conference world");
    expect(sections).toContain("REGISTER FOR THE GATHERING");
    expect(sections).toContain("RETURN TO THE GATHERING");
  });

  it("keeps functional game and registration content while removing their page descriptions", () => {
    expect(game).not.toContain("trial-command-deck__copy");
    expect(game).not.toContain("Leap, slide, strike");
    expect(game).toContain(">REGISTER <b>→</b>");
    expect(register).not.toContain("A simple three-step registration");
    expect(register).toContain("STARTS");
    expect(register).toContain("10 September 2026");
  });
});
