import { createHash } from "node:crypto";
import { asc, count, desc, eq } from "drizzle-orm";
import { registrationLeaderboardEntries } from "../drizzle/schema";
import { LOCAL_COMMITTEES, type LocalCommittee } from "../shared/registration";
import { getDb } from "./db";

const aliases: Record<string, LocalCommittee> = {
  "lc bellaregia": "SU Bullaregia",
  "lc bullaregia": "SU Bullaregia",
  "su bullaregia": "SU Bullaregia",
  "lc nabeul": "LC Nabel",
  "lc nabel": "LC Nabel",
};

export function normalizeLocalCommittee(value: string): LocalCommittee | null {
  const normalized = value.trim().replace(/\s+/g, " ").toLowerCase();
  const canonical = LOCAL_COMMITTEES.find((lc) => lc.toLowerCase() === normalized);
  return canonical ?? aliases[normalized] ?? null;
}

export function hashRegistrationEmail(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export async function recordLeaderboardRegistration(lc: LocalCommittee, email: string) {
  const db = await getDb();
  if (!db) return false;
  await db.insert(registrationLeaderboardEntries).values({
    lc,
    emailHash: hashRegistrationEmail(email),
  }).onDuplicateKeyUpdate({ set: { lc } });
  return true;
}

export async function getRegistrationLeaderboard() {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      lc: registrationLeaderboardEntries.lc,
      registrations: count(registrationLeaderboardEntries.id),
    })
    .from(registrationLeaderboardEntries)
    .groupBy(registrationLeaderboardEntries.lc)
    .orderBy(desc(count(registrationLeaderboardEntries.id)), asc(registrationLeaderboardEntries.lc))
    .limit(3);

  return rows.map((row) => ({ lc: row.lc, registrations: Number(row.registrations) }));
}
