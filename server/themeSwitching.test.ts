import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const appSource = await readFile(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const headerSource = await readFile(new URL("../client/src/components/ConferenceHeader.tsx", import.meta.url), "utf8");
const registerSource = await readFile(new URL("../client/src/pages/Register.tsx", import.meta.url), "utf8");
const contextSource = await readFile(new URL("../client/src/contexts/ThemeContext.tsx", import.meta.url), "utf8");

describe("public dark-only theme", () => {
  it("locks the app to the dark default and disables switching", () => {
    expect(appSource).toContain('<ThemeProvider defaultTheme="dark" switchable={false}>');
    expect(headerSource).not.toContain("ThemeToggle");
    expect(registerSource).not.toContain("ThemeToggle");
  });

  it("retains safe context behavior for the dark-only provider", () => {
    expect(contextSource).toContain('defaultTheme = "light"');
    expect(contextSource).toContain('root.classList.add("dark")');
    expect(contextSource).toContain('root.classList.remove("dark")');
  });
});
