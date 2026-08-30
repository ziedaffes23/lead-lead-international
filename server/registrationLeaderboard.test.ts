import { describe, expect, it } from "vitest";
import { hashRegistrationEmail, normalizeLocalCommittee } from "./registrationLeaderboard";
import { localCommitteeFromSearch } from "@shared/registration";
import { buildLeaderboardPodium } from "@shared/leaderboardPodium";

describe("registration leaderboard helpers", () => {
  it("normalizes legacy LC spelling to its published committee name", () => {
    expect(normalizeLocalCommittee("LC Bellaregia")).toBe("SU Bullaregia");
    expect(normalizeLocalCommittee("LC Nabeul")).toBe("LC Nabel");
  });

  it("uses a stable case-insensitive email hash for registration deduplication", () => {
    expect(hashRegistrationEmail(" Delegate@AIESEC.net ")).toBe(hashRegistrationEmail("delegate@aiesec.net"));
  });

  it("accepts only published LC selections", () => {
    expect(localCommitteeFromSearch("?lc=LC%20Bizerte")).toBe("LC Bizerte");
    expect(localCommitteeFromSearch("?lc=not-a-published-lc")).toBe("LC Thyna");
  });

  it("puts the genuine first-place LC into the centre podium slot", () => {
    expect(buildLeaderboardPodium([
      { lc: "LC Thyna", registrations: 12 },
      { lc: "LC Bizerte", registrations: 9 },
      { lc: "LC University", registrations: 7 },
    ])).toEqual([
      { entry: { lc: "LC Thyna", registrations: 12 }, rank: 1, slot: "center" },
      { entry: { lc: "LC Bizerte", registrations: 9 }, rank: 2, slot: "left" },
      { entry: { lc: "LC University", registrations: 7 }, rank: 3, slot: "right" },
    ]);
  });
});
