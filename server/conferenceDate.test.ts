import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [metadata, intro, home, register, sections] = await Promise.all([
  readFile(new URL("../client/index.html", import.meta.url), "utf8"),
  readFile(new URL("../client/src/components/CinematicIntro.tsx", import.meta.url), "utf8"),
  readFile(new URL("../client/src/pages/ConferenceHome.tsx", import.meta.url), "utf8"),
  readFile(new URL("../client/src/pages/Register.tsx", import.meta.url), "utf8"),
  readFile(new URL("../client/src/pages/ConferenceSection.tsx", import.meta.url), "utf8"),
]);

describe("confirmed conference date", () => {
  it("uses 10 September 2026 in the core visitor-facing event surfaces and countdown target", () => {
    expect(metadata).toContain("10 September 2026");
    expect(intro).toContain("10 SEPTEMBER 2026");
    expect(home).toContain("2026-09-10T09:00:00+01:00");
    expect(home).toContain("10 SEP 2026");
    expect(register).toContain("10 September 2026");
    expect(sections).toContain("<ConferenceFooter");
  });

  it("removes the superseded 03 September date from visitor-facing source", () => {
    for (const source of [metadata, intro, home, register, sections]) {
      expect(source).not.toMatch(/03 SEP(?:TEMBER)? 2026|2026-09-03/);
    }
  });
});
