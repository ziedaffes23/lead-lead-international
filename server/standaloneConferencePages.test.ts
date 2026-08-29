import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const appSource = await readFile(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const homeSource = await readFile(new URL("../client/src/pages/ConferenceHome.tsx", import.meta.url), "utf8");
const headerSource = await readFile(new URL("../client/src/components/ConferenceHeader.tsx", import.meta.url), "utf8");
const sectionSource = await readFile(new URL("../client/src/pages/ConferenceSection.tsx", import.meta.url), "utf8");

describe("standalone conference pages", () => {
  it("registers only the remaining standalone conference routes", () => {
    ["/mission", "/principles", "/hall-of-banners", "/mirage", "/live-vanguard"].forEach((route) => expect(appSource).toContain(`path="${route}"`));
    expect(appSource).toContain('<Route path="/delegate-prep"><Redirect to="/home" /></Route>');
    expect(homeSource).not.toContain("world-chapter-tabs");
    expect(homeSource).not.toContain("chapter-panel");
  });

  it("offers every page in the shared header and retains interactive conference paths", () => {
    ["/mission", "/principles", "/hall-of-banners", "/mirage", "/game", "/register"].forEach((route) => expect(headerSource).toContain(route));
    expect(headerSource).not.toContain("/delegate-prep");
    expect(headerSource).not.toContain("/questions");
    expect(sectionSource).not.toContain("faction-card__register");
    expect(sectionSource).toContain("faction-card__since");
    expect(sectionSource).not.toContain("LOCAL COMMITTEE ORIGIN");
    expect(sectionSource).toContain("registration.leaderboard.useQuery");
    expect(sectionSource).toContain("refetchInterval: 30_000");
  });
});
