import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const appSource = await readFile(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const headerSource = await readFile(new URL("../client/src/components/ConferenceHeader.tsx", import.meta.url), "utf8");

describe("removed public routes", () => {
  it("removes Questions from the shared navigation and redirects its legacy URL to the homepage", () => {
    expect(appSource).toContain('<Route path="/questions"><Redirect to="/home" /></Route>');
    expect(appSource).not.toContain('component={Questions}');
    expect(headerSource).not.toContain('"/questions"');
    expect(headerSource).not.toContain("QUESTIONS");
  });
});
