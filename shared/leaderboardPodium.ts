export type LeaderboardPodiumEntry = { lc: string; registrations: number };

export type LeaderboardPodiumSlot = "center" | "left" | "right";

export function buildLeaderboardPodium<T extends LeaderboardPodiumEntry>(entries: readonly T[]) {
  const slots: LeaderboardPodiumSlot[] = ["center", "left", "right"];
  return entries.slice(0, 3).map((entry, index) => ({ entry, rank: index + 1, slot: slots[index] }));
}
