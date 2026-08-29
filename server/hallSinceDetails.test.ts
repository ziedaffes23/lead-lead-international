import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const factionsSource = await readFile(new URL("../client/src/data/conferenceSections.ts", import.meta.url), "utf8");
const sectionSource = await readFile(new URL("../client/src/pages/ConferenceSection.tsx", import.meta.url), "utf8");

describe("Hall of Banners Since details", () => {
  it("uses the supplied founding year for every LC", () => {
    ["Since 2005", "Since 1987", "Since 1962", "Since 2012", "Since 2014", "Since 1997", "Since 1989", "Since 1984", "Since 2009", "Since 2025"].forEach((year) => expect(factionsSource).toContain(year));
    expect((factionsSource.match(/established: "Since /g) ?? []).length).toBe(12);
  });

  it("uses hover, focus, and touch-compatible profiles without registration CTAs", () => {
    expect(sectionSource).toContain("onMouseEnter={onOpen}");
    expect(sectionSource).toContain("aria-expanded={active}");
    expect(sectionSource).toContain("faction-card__since");
    expect(sectionSource).not.toContain("LC PROFILE");
    expect(sectionSource).not.toContain("LOCAL COMMITTEE ORIGIN");
    expect(sectionSource).not.toContain("faction-card__register");
    expect(sectionSource).not.toContain("YOUR LC WILL BE PRESELECTED");
  });
});
