import { describe, expect, it } from "vitest";
import { parseSheetLeaderboard } from "./sheetsLeaderboard";

describe("sheet-backed leaderboard parser", () => {
  it("returns only valid published committees and positive aggregate totals", () => {
    expect(parseSheetLeaderboard({ ok: true, leaderboard: [
      { lc: "LC Thyna", registrations: 3 },
      { lc: "Unknown LC", registrations: 9 },
      { lc: "LC Bizerte", registrations: 2 },
      { lc: "LC Nabel", registrations: 0 },
    ] })).toEqual([{ lc: "LC Thyna", registrations: 3 }, { lc: "LC Bizerte", registrations: 2 }]);
  });

  it("rejects unconfirmed responses", () => {
    expect(() => parseSheetLeaderboard({ ok: false })).toThrow("did not confirm leaderboard data");
  });
});
