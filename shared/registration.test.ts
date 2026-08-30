import { describe, expect, it } from "vitest";
import { localCommitteeFromSearch } from "./registration";

describe("localCommitteeFromSearch", () => {
  it("uses the published LC when it is a published registration option", () => {
    expect(localCommitteeFromSearch("?lc=LC%20Bizerte")).toBe("LC Bizerte");
  });

  it("falls back to LC Thyna for missing or unrecognised URL values", () => {
    expect(localCommitteeFromSearch("")).toBe("LC Thyna");
    expect(localCommitteeFromSearch("?lc=LC%20Unknown")).toBe("LC Thyna");
  });
});
