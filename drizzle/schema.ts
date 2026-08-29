import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Minimal registration ledger used solely for public aggregate counts.
 * The email is hashed server-side, so the leaderboard can deduplicate entries
 * without copying the personal registration form into this table.
 */
export const registrationLeaderboardEntries = mysqlTable("registration_leaderboard_entries", {
  id: int("id").autoincrement().primaryKey(),
  lc: varchar("lc", { length: 64 }).notNull(),
  emailHash: varchar("email_hash", { length: 64 }).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("registration_leaderboard_entries_email_hash_unique").on(table.emailHash)]);

export type RegistrationLeaderboardEntry = typeof registrationLeaderboardEntries.$inferSelect;
export type InsertRegistrationLeaderboardEntry = typeof registrationLeaderboardEntries.$inferInsert;
