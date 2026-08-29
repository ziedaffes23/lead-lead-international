import { describe, expect, it } from "vitest";

describe("configured Google Sheets endpoint", () => {
  it("responds as the configured Apps Script registration endpoint", async () => {
    const endpoint = process.env.VITE_SHEETS_WEB_APP_URL;
    expect(endpoint).toMatch(/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/);

    const response = await fetch(endpoint!, { redirect: "manual", signal: AbortSignal.timeout(20_000) });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toMatch(/^https:\/\/script\.googleusercontent\.com\//);
  }, 25_000);

  it("returns only aggregate Local Committee totals for Live Vanguard", async () => {
    const endpoint = new URL(process.env.VITE_SHEETS_WEB_APP_URL!);
    endpoint.searchParams.set("view", "leaderboard");

    const response = await fetch(endpoint, { signal: AbortSignal.timeout(20_000) });
    expect(response.ok).toBe(true);
    const payload = await response.json() as { ok?: unknown; leaderboard?: unknown };
    expect(payload.ok).toBe(true);
    expect(Array.isArray(payload.leaderboard)).toBe(true);
    expect(payload.leaderboard).toEqual(expect.arrayContaining([]));
    (payload.leaderboard as unknown[]).forEach((entry) => {
      expect(entry).toMatchObject({ lc: expect.any(String), registrations: expect.any(Number) });
      expect(Object.keys(entry as object).sort()).toEqual(["lc", "registrations"]);
    });
  }, 25_000);
});
