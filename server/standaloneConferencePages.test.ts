import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const appSource = await readFile(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const homeSource = await readFile(new URL("../client/src/pages/ConferenceHome.tsx", import.meta.url), "utf8");
const headerSource = await readFile(new URL("../client/src/components/ConferenceHeader.tsx", import.meta.url), "utf8");

describe("standalone conference pages", () => {
  it("registers only the remaining standalone conference routes", () => {
    ["/mission", "/principles"].forEach((route) => expect(appSource).toContain(`path="${route}"`));
    ["/hall-of-banners", "/mirage", "/live-vanguard"].forEach((route) => expect(appSource).not.toContain(`path="${route}"`));
    expect(appSource).toContain('<Route path="/delegate-prep"><Redirect to="/home" /></Route>');
    expect(homeSource).not.toContain("world-chapter-tabs");
    expect(homeSource).not.toContain("chapter-panel");
  });

  it("offers every page in the shared header and retains interactive conference paths", () => {
    ["/mission", "/principles", "/game", "/register"].forEach((route) => expect(headerSource).toContain(route));
    ["/hall-of-banners", "/mirage"].forEach((route) => expect(headerSource).not.toContain(route));
    expect(headerSource).not.toContain("/delegate-prep");
    expect(headerSource).not.toContain("/questions");
  });
});
