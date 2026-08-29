import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [footer, intro, home, sections, game, register] = await Promise.all([
  readFile(new URL("../client/src/components/ConferenceFooter.tsx", import.meta.url), "utf8"),
  readFile(new URL("../client/src/components/CinematicIntro.tsx", import.meta.url), "utf8"),
  readFile(new URL("../client/src/pages/ConferenceHome.tsx", import.meta.url), "utf8"),
  readFile(new URL("../client/src/pages/ConferenceSection.tsx", import.meta.url), "utf8"),
  readFile(new URL("../client/src/pages/Game.tsx", import.meta.url), "utf8"),
  readFile(new URL("../client/src/pages/Register.tsx", import.meta.url), "utf8"),
]);

describe("conference footer credit", () => {
  it("uses the requested Lead & Lead and Imperium Department attribution", () => {
    expect(footer).toContain("LEAD &amp; LEAD 2K26");
    expect(footer).toContain("MADE BY THE IMPERIUM DEPARTMENT");
  });

  it("renders the shared footer on every active public page", () => {
    [intro, home, sections, game, register].forEach((source) => expect(source).toContain("<ConferenceFooter"));
    expect(home).toContain("<ConferenceFooter compact />");
    expect(register).toContain("!isEmbedded && <ConferenceFooter />");
  });
});
