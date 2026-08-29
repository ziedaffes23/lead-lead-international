import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const homeSource = await readFile(new URL("../client/src/pages/ConferenceHome.tsx", import.meta.url), "utf8");
const stylesSource = await readFile(new URL("../client/src/styles/single-screen-home.css", import.meta.url), "utf8");

describe("single-screen homepage", () => {
  it("keeps only the hero, navigation, and registration entry on the homepage", () => {
    expect(homeSource).toContain('className="game-home game-home--single-screen"');
    expect(homeSource).toContain("<ConferenceHeader current=\"home\"");
    expect(homeSource).toContain("<section className=\"world-hero\"");
    expect(homeSource).toContain("START REGISTRATION");
    expect(homeSource).not.toContain("WORLD INDEX");
    expect(homeSource).not.toContain("Choose your route.");
    expect(homeSource).not.toContain("<footer className=\"game-footer\"");
  });

  it("uses viewport-height containment and direct full-page registration without removing hero interactions", () => {
    expect(stylesSource).toContain("height:100dvh");
    expect(stylesSource).toContain("overflow:hidden");
    expect(homeSource).not.toContain("RegistrationModal");
    expect(homeSource).not.toContain("registration-modal.css");
    expect(homeSource).toContain('navigate(`/register${lc ? `?lc=${encodeURIComponent(lc)}` : ""}`)');
    expect(homeSource).toContain('onRegister={() => openRegistration()}');
  });
});
