import { LOCAL_COMMITTEES, type LocalCommittee } from "../shared/registration";

export type SheetLeaderboardEntry = { lc: LocalCommittee; registrations: number };

export function parseSheetLeaderboard(payload: unknown): SheetLeaderboardEntry[] {
  if (!payload || typeof payload !== "object" || (payload as { ok?: unknown }).ok !== true) {
    throw new Error("The registration sheet did not confirm leaderboard data.");
  }

  const entries = Array.isArray((payload as { leaderboard?: unknown }).leaderboard) ? (payload as { leaderboard: unknown[] }).leaderboard : [];
  return entries
    .flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const candidate = entry as { lc?: unknown; registrations?: unknown };
      if (typeof candidate.lc !== "string" || !LOCAL_COMMITTEES.includes(candidate.lc as LocalCommittee)) return [];
      const registrations = Number(candidate.registrations);
      return Number.isInteger(registrations) && registrations > 0 ? [{ lc: candidate.lc as LocalCommittee, registrations }] : [];
    })
    .sort((left, right) => right.registrations - left.registrations || left.lc.localeCompare(right.lc))
    .slice(0, 3);
}

export async function getSheetLeaderboard(endpoint = process.env.VITE_SHEETS_WEB_APP_URL): Promise<SheetLeaderboardEntry[]> {
  if (!endpoint) throw new Error("The registration sheet endpoint is not configured.");
  const url = new URL(endpoint);
  url.searchParams.set("view", "leaderboard");
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error("The registration sheet could not be reached.");
  return parseSheetLeaderboard(await response.json());
}
