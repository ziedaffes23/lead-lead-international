import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const read = (relativePath: string) =>
  readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("mobile responsive contract", () => {
  it("loads the shared mobile refinement after each active route style stack", () => {
    for (const page of [
      "client/src/pages/ConferenceHome.tsx",
      "client/src/pages/ConferenceSection.tsx",
      "client/src/pages/Game.tsx",
      "client/src/pages/Register.tsx",
    ]) {
      expect(read(page)).toContain('import "@/styles/mobile-layout.css";');
    }
    expect(read("client/src/pages/Home.tsx")).not.toContain("ConferenceHeader");
    expect(read("client/src/main.tsx")).toContain(
      'import "./styles/mobile-overhaul.css";'
    );
  });

  it("keeps the final mobile layer responsible for full-width route geometry", () => {
    const css = read("client/src/styles/mobile-overhaul.css");
    expect(css).toContain(".game-page {");
    expect(css).toContain("padding-left: 0 !important");
    expect(css).toContain(".registration-site .form-grid.two");
    expect(css).not.toContain(".conference-section-page--mirage");
  });

  it("keeps the mobile game focused on the playable trial", () => {
    const css = read("client/src/styles/mobile-overhaul.css");
    expect(css).toContain(".game-page .trial-command-deck__panel");
    expect(css).toContain("display: none !important");
    expect(css).toContain(".game-page .game-control-guide");
    expect(css).toContain(".game-page .game-controls");
  });

  it("keeps mobile route headers full-bleed while content remains inset", () => {
    const css = read("client/src/styles/mobile-layout.css");
    expect(css).toContain(".game-page .conference-nav");
    expect(css).toContain(".registration-site .conference-nav");
    expect(css).toContain("padding-right: 0");
    expect(css).toContain("padding-left: 0");
    expect(css).toContain("margin-right: .75rem");
    expect(css).toContain("margin-left: .75rem");
  });

  it("protects phone content from the floating registration dock", () => {
    const css = read("client/src/styles/mobile-layout.css");
    expect(css).toContain(".conference-section-page .mobile-register-dock");
    expect(css).toContain("display: none");
  });

  it("compresses short home screens without restoring document scrolling", () => {
    const css = read("client/src/styles/mobile-layout.css");
    expect(css).toContain("max-height: 700px");
    expect(css).toContain(".game-home--single-screen > .world-hero");
    expect(css).toContain(".game-home--single-screen .mission-console");
    expect(read("client/src/styles/single-screen-home.css")).toContain(
      "overflow:hidden"
    );
  });
});
