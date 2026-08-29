import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const paletteSource = await readFile(new URL("../client/src/styles/light-mode-rebalance.css", import.meta.url), "utf8");
const pageSources = await Promise.all([
  "ConferenceHome.tsx",
  "ConferenceSection.tsx",
  "Game.tsx",
  "Register.tsx",
].map((file) => readFile(new URL(`../client/src/pages/${file}`, import.meta.url), "utf8")));

describe("dark-only public palette", () => {
  it("keeps the legacy light palette isolated from active route imports", () => {
    expect(paletteSource).toContain("html:not(.dark)");
    pageSources.forEach((source) => {
      expect(source).not.toContain('import "@/styles/light-mode.css";');
      expect(source).not.toContain('import "@/styles/light-mode-polish.css";');
      expect(source).not.toContain('import "@/styles/light-mode-contrast.css";');
      expect(source).not.toContain('import "@/styles/light-mode-rebalance.css";');
    });
  });
});
