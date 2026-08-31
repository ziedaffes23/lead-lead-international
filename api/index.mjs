// api/index.source.ts
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/registrationUploads.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";

// server/storage.ts
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }
  return { key, url: `/manus-storage/${key}` };
}
async function storageGetSignedUrl(relKey) {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = normalizeKey(relKey);
  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);
  const resp = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`);
  }
  const { url } = await resp.json();
  return url;
}

// server/registrationUploads.ts
var MAX_PHOTO_BYTES = 3 * 1024 * 1024;
var MAX_CV_BYTES = 5 * 1024 * 1024;
var MAX_IDENTITY_BYTES = 5 * 1024 * 1024;
var attachmentInput = z2.object({
  name: z2.string().min(1).max(140),
  mimeType: z2.string().min(1).max(100),
  dataUrl: z2.string().min(32).max(71e5)
});
var registrationUploadsInput = z2.object({
  photo: attachmentInput.optional(),
  cv: attachmentInput.optional(),
  identity: attachmentInput.optional()
});
function configuredPublicOrigin() {
  const configured = process.env.PUBLIC_APP_URL || process.env.APP_URL || process.env.VITE_APP_URL;
  if (!configured) return "";
  try {
    const url = new URL(configured);
    url.protocol = "https:";
    url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}
function toHttpsAbsoluteUrl(value, req) {
  const candidate = value.trim();
  if (!candidate) return "";
  const origin = configuredPublicOrigin() || `https://${req.get("x-forwarded-host") || req.get("host") || "localhost"}`;
  const url = new URL(candidate, `${origin}/`);
  url.protocol = "https:";
  return url.toString();
}
function policyFor(kind) {
  if (kind === "photo") return { allowed: ["image/jpeg", "image/png", "image/webp"], maxBytes: MAX_PHOTO_BYTES, folder: "photo" };
  if (kind === "identity") return { allowed: ["image/jpeg", "image/png", "application/pdf"], maxBytes: MAX_IDENTITY_BYTES, folder: "identity" };
  return { allowed: ["application/pdf"], maxBytes: MAX_CV_BYTES, folder: "cv" };
}
function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "attachment";
}
function prepareRegistrationAttachment(kind, attachment) {
  const policy = policyFor(kind);
  if (!policy.allowed.includes(attachment.mimeType)) {
    throw new TRPCError3({ code: "BAD_REQUEST", message: `Unsupported ${kind} file type.` });
  }
  const prefix = `data:${attachment.mimeType};base64,`;
  if (!attachment.dataUrl.startsWith(prefix)) {
    throw new TRPCError3({ code: "BAD_REQUEST", message: `Invalid ${kind} file payload.` });
  }
  const encoded = attachment.dataUrl.slice(prefix.length);
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new TRPCError3({ code: "BAD_REQUEST", message: `Invalid ${kind} file encoding.` });
  }
  const bytes = Buffer.from(encoded, "base64");
  if (!bytes.length || bytes.length > policy.maxBytes) {
    throw new TRPCError3({ code: "PAYLOAD_TOO_LARGE", message: `${kind === "photo" ? "Photo" : kind === "identity" ? "CIN or passport" : "CV"} exceeds the allowed size.` });
  }
  return { bytes, safeName: safeFilename(attachment.name), mimeType: attachment.mimeType, folder: policy.folder };
}
async function uploadRegistrationDocuments(input, req) {
  const documents = {};
  if (input.photo) {
    const photo = prepareRegistrationAttachment("photo", input.photo);
    const stored = await storagePut(`registrations/attachments/${photo.folder}/${Date.now()}-${photo.safeName}`, photo.bytes, photo.mimeType);
    documents.photo = { name: input.photo.name, url: toHttpsAbsoluteUrl(stored.url, req) };
  }
  if (input.cv) {
    const cv = prepareRegistrationAttachment("cv", input.cv);
    const stored = await storagePut(`registrations/attachments/${cv.folder}/${Date.now()}-${cv.safeName}`, cv.bytes, cv.mimeType);
    documents.cv = { name: input.cv.name, url: toHttpsAbsoluteUrl(stored.url, req) };
  }
  if (input.identity) {
    const identity = prepareRegistrationAttachment("identity", input.identity);
    const stored = await storagePut(`registrations/attachments/${identity.folder}/${Date.now()}-${identity.safeName}`, identity.bytes, identity.mimeType);
    documents.identity = { name: input.identity.name, url: toHttpsAbsoluteUrl(stored.url, req) };
  }
  return documents;
}

// server/registrationLeaderboard.ts
import { createHash } from "node:crypto";
import { asc, count, desc } from "drizzle-orm";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var registrationLeaderboardEntries = mysqlTable("registration_leaderboard_entries", {
  id: int("id").autoincrement().primaryKey(),
  lc: varchar("lc", { length: 64 }).notNull(),
  emailHash: varchar("email_hash", { length: 64 }).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull()
}, (table) => [uniqueIndex("registration_leaderboard_entries_email_hash_unique").on(table.emailHash)]);

// shared/registration.ts
var LOCAL_COMMITTEES = [
  "LC Thyna",
  "LC University",
  "SU Bullaregia",
  "LC Tacapes",
  "LC Ruspina",
  "LC Carthage",
  "LC Bardo",
  "LC Medina",
  "LC Hadrumet",
  "LC Nabel",
  "LC Sfax",
  "LC Bizerte"
];

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/registrationLeaderboard.ts
var aliases = {
  "lc bellaregia": "SU Bullaregia",
  "lc bullaregia": "SU Bullaregia",
  "su bullaregia": "SU Bullaregia",
  "lc nabeul": "LC Nabel",
  "lc nabel": "LC Nabel"
};
function normalizeLocalCommittee(value) {
  const normalized = value.trim().replace(/\s+/g, " ").toLowerCase();
  const canonical = LOCAL_COMMITTEES.find((lc) => lc.toLowerCase() === normalized);
  return canonical ?? aliases[normalized] ?? null;
}
function hashRegistrationEmail(email) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}
async function recordLeaderboardRegistration(lc, email) {
  const db = await getDb();
  if (!db) return false;
  await db.insert(registrationLeaderboardEntries).values({
    lc,
    emailHash: hashRegistrationEmail(email)
  }).onDuplicateKeyUpdate({ set: { lc } });
  return true;
}

// server/sheetsLeaderboard.ts
function parseSheetLeaderboard(payload) {
  if (!payload || typeof payload !== "object" || payload.ok !== true) {
    throw new Error("The registration sheet did not confirm leaderboard data.");
  }
  const entries = Array.isArray(payload.leaderboard) ? payload.leaderboard : [];
  return entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const candidate = entry;
    if (typeof candidate.lc !== "string" || !LOCAL_COMMITTEES.includes(candidate.lc)) return [];
    const registrations = Number(candidate.registrations);
    return Number.isInteger(registrations) && registrations > 0 ? [{ lc: candidate.lc, registrations }] : [];
  }).sort((left, right) => right.registrations - left.registrations || left.lc.localeCompare(right.lc)).slice(0, 3);
}
async function getSheetLeaderboard(endpoint = process.env.VITE_SHEETS_WEB_APP_URL) {
  if (!endpoint) throw new Error("The registration sheet endpoint is not configured.");
  const url = new URL(endpoint);
  url.searchParams.set("view", "leaderboard");
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15e3) });
  if (!response.ok) throw new Error("The registration sheet could not be reached.");
  return parseSheetLeaderboard(await response.json());
}

// server/registrationSubmission.ts
import { z as z3 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";

// shared/sheetsDelivery.ts
function confirmSheetsDelivery(httpOk, body, responseUrl, initialStatus) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    if (httpOk && responseUrl?.startsWith("https://script.googleusercontent.com/") && (body.trim() || initialStatus !== void 0 && initialStatus >= 300 && initialStatus < 400) && !body.toLowerCase().includes("sorry, unable to open the file")) {
      return { ok: true };
    }
    throw new Error("The registration service returned an unreadable response. Please try again shortly.");
  }
  const response = parsed && typeof parsed === "object" ? parsed : {};
  if (!httpOk || response.ok !== true) {
    const message = typeof response.error === "string" && response.error.trim() ? response.error.trim() : "The registration service did not confirm your record.";
    throw new Error(message);
  }
  const documents = response.documents && typeof response.documents === "object" ? response.documents : void 0;
  return { ok: true, row: typeof response.row === "number" ? response.row : void 0, documents };
}

// server/registrationSubmission.ts
var DEFAULT_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbykExcZ-IACxWONFqSMz-BQ4hg1dYF6zu_q-SgmYTp2auDyeuKeIrxWlYmoymi90RXB/exec";
var LEGACY_SHEETS_WEB_APP_URLS = /* @__PURE__ */ new Set([
  "https://script.google.com/macros/s/AKfycbxGWI8ZmEG80Hl8r0GciT4AnFGyCGc6QiQDzQ9kTyhkaDltfFtrddbtAMHGgV_m7lS4/exec",
  "https://script.google.com/macros/s/AKfycbxW5E8LFwz8FqDPSRovruq7mwi6LQ0BlLCIaSK4vADR-ZBTIeR8_F7n644FQGNqdn2b/exec",
  "https://script.google.com/macros/s/AKfycbyS16hLcvvCg4eqj7OpjI3qZV8WLRa_33qBtmBT6DJLCpUfeE8NNZBBNDySBCR9hKHa/exec"
]);
var documentUrl = z3.string().trim().refine((value) => !value || value.startsWith("https://"), "Document URLs must use HTTPS.");
var documentDataUrl = z3.string().trim().max(8e6).optional();
var registrationSubmissionInput = z3.object({
  firstName: z3.string().trim().min(1),
  lastName: z3.string().trim().min(1),
  passportNumber: z3.string().trim().min(1),
  gender: z3.enum(["Male", "Female"]),
  phoneCountry: z3.string().trim().min(1),
  phone: z3.string().trim().min(1),
  email: z3.string().trim().email(),
  track: z3.enum(["International AIESECer", "EP"]),
  position: z3.enum([
    "None",
    "MMB",
    "Manager",
    "Team Leader",
    "LCVP",
    "LCP",
    "MCVP",
    "MCP"
  ]),
  singleRoom: z3.boolean(),
  department: z3.string().trim().min(1),
  lcName: z3.string().trim().min(1),
  entityName: z3.string().trim().min(1),
  mcPosition: z3.string().trim().min(1),
  countryOfOrigin: z3.string().trim().min(1),
  hostingLc: z3.string().trim().min(1),
  allergies: z3.string().trim().min(1),
  note: z3.string().trim().min(1),
  price: z3.number().int().nonnegative(),
  currency: z3.literal("EUR"),
  photoUrl: documentUrl,
  photoDataUrl: documentDataUrl,
  photoName: z3.string().trim().min(1),
  cvUrl: documentUrl,
  cvDataUrl: documentDataUrl,
  cvName: z3.string().trim().min(1),
  identityUrl: documentUrl,
  identityDataUrl: documentDataUrl,
  identityName: z3.string().trim().min(1),
  indemnitySignature: z3.string().trim().min(1),
  indemnityAccepted: z3.boolean().refine((value) => value, "Indemnity consent is required.")
}).superRefine((input, ctx) => {
  const leadershipPosition = [
    "LCVP",
    "LCP",
    "MCVP",
    "MCP"
  ].includes(input.position);
  const stayNights = leadershipPosition ? 4 : 3;
  const expectedPrice = (leadershipPosition ? 90 : 65) + (input.singleRoom ? 20 * stayNights : 0);
  if (input.price !== expectedPrice) {
    ctx.addIssue({
      code: z3.ZodIssueCode.custom,
      path: ["price"],
      message: `Price must be ${expectedPrice} EUR for the selected room type.`
    });
  }
  if (input.track === "EP") {
    if (input.position !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["position"],
        message: "EP registrations must not include an AIESEC position."
      });
    }
    if (input.department !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["department"],
        message: "EP registrations must not include an AIESEC department."
      });
    }
    if (input.lcName !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["lcName"],
        message: "EP registrations must not include an LC name."
      });
    }
    if (input.entityName !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["entityName"],
        message: "EP registrations must not include an entity name."
      });
    }
    if (input.mcPosition !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["mcPosition"],
        message: "EP registrations must not include an MC position."
      });
    }
    if (input.hostingLc === "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["hostingLc"],
        message: "Hosting LC is required for EP registrations."
      });
    }
  } else {
    if (input.position === "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["position"],
        message: "International AIESECer registrations require a position."
      });
    }
    if (input.department === "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["department"],
        message: "International AIESECer registrations require a department."
      });
    }
    const mcPosition = ["MCVP", "MCP"].includes(input.position);
    if (!mcPosition && input.lcName === "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["lcName"],
        message: "International AIESECer registrations require an LC name unless the position is MCVP or MCP."
      });
    }
    if (mcPosition && input.lcName !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["lcName"],
        message: "MCVP and MCP registrations must not include an LC name."
      });
    }
    if (input.mcPosition !== "None" && input.position === "MCP") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["mcPosition"],
        message: "MCP registrations must not include an MC position."
      });
    }
    if (input.position === "MCVP" && input.mcPosition === "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["mcPosition"],
        message: "MCVP registrations require an MC position."
      });
    }
    if (!["MCVP", "MCP"].includes(input.position) && input.mcPosition !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["mcPosition"],
        message: "Only MCVP registrations may include an MC position."
      });
    }
    if (input.entityName === "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["entityName"],
        message: "International AIESECer registrations require an entity name."
      });
    }
    if (input.countryOfOrigin !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["countryOfOrigin"],
        message: "International AIESECer registrations do not require a country of origin."
      });
    }
    if (input.hostingLc !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["hostingLc"],
        message: "International AIESECer registrations do not require a hosting LC."
      });
    }
  }
});
async function submitRegistrationToSheets(input) {
  const configuredEndpoint = process.env.VITE_SHEETS_WEB_APP_URL || process.env.SHEETS_WEB_APP_URL;
  const endpoint = configuredEndpoint && !LEGACY_SHEETS_WEB_APP_URLS.has(configuredEndpoint) ? configuredEndpoint : DEFAULT_SHEETS_WEB_APP_URL;
  if (!endpoint) {
    throw new TRPCError4({
      code: "PRECONDITION_FAILED",
      message: "Registration setup is incomplete. Please contact the organising team before retrying."
    });
  }
  let url;
  try {
    url = new URL(endpoint);
    if (url.protocol !== "https:" || !url.pathname.endsWith("/exec"))
      throw new Error("Invalid registration endpoint.");
  } catch {
    throw new TRPCError4({
      code: "PRECONDITION_FAILED",
      message: "Registration setup is incomplete. Please contact the organising team before retrying."
    });
  }
  try {
    const requestBody = JSON.stringify(input);
    const requestHeaders = {
      "Content-Type": "text/plain;charset=utf-8",
      Accept: "application/json"
    };
    const response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: requestBody,
      // Apps Script executes doPost() at /exec and returns a temporary
      // content-service URL for the JSON response. Capture that redirect
      // explicitly, then fetch the temporary URL as GET.
      redirect: "manual",
      signal: AbortSignal.timeout(3e4)
    });
    const finalResponse = response.status >= 300 && response.status < 400 ? await (async () => {
      const location = response.headers.get("location");
      if (!location)
        throw new Error(
          "The registration service did not provide a response location."
        );
      return fetch(location, {
        headers: { Accept: "application/json" },
        redirect: "follow",
        signal: AbortSignal.timeout(3e4)
      });
    })() : response;
    const confirmation = confirmSheetsDelivery(
      finalResponse.ok,
      await finalResponse.text(),
      finalResponse.url,
      response.status
    );
    return confirmation;
  } catch (error) {
    if (error instanceof TRPCError4) throw error;
    const message = error instanceof Error ? error.message : "The registration service could not confirm your record.";
    throw new TRPCError4({ code: "BAD_GATEWAY", message });
  }
}

// server/routers.ts
import { TRPCError as TRPCError5 } from "@trpc/server";
import { z as z4 } from "zod";
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  registration: router({
    uploadDocuments: publicProcedure.input(registrationUploadsInput).mutation(({ input, ctx }) => uploadRegistrationDocuments(input, ctx.req)),
    submit: publicProcedure.input(registrationSubmissionInput).mutation(({ input }) => submitRegistrationToSheets(input)),
    leaderboard: publicProcedure.query(() => getSheetLeaderboard()),
    record: publicProcedure.input(z4.object({ lc: z4.string().min(1), email: z4.string().email() })).mutation(async ({ input }) => {
      const lc = normalizeLocalCommittee(input.lc);
      if (!lc) throw new TRPCError5({ code: "BAD_REQUEST", message: "Select a valid local committee." });
      const recorded = await recordLeaderboardRegistration(lc, input.email);
      if (!recorded) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Registration leaderboard is unavailable." });
      return { lc };
    })
  })
  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// api/index.source.ts
function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}
async function handleStorage(req, res) {
  const requestUrl = new URL(req.url ?? "/", "https://vercel.local");
  const key = decodeURIComponent(
    requestUrl.pathname.replace(/^\/manus-storage\//, "")
  );
  if (!key) {
    sendJson(res, 400, { error: "Missing storage key" });
    return;
  }
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    sendJson(res, 500, { error: "Storage proxy not configured" });
    return;
  }
  try {
    const signedUrl = await storageGetSignedUrl(key);
    res.statusCode = 307;
    res.setHeader("Location", signedUrl);
    res.end();
  } catch (error) {
    console.error("[StorageProxy] failed:", error);
    sendJson(res, 502, { error: "Storage proxy error" });
  }
}
async function handler(req, res) {
  const requestUrl = new URL(req.url ?? "/", "https://vercel.local");
  if (requestUrl.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "lead-lead-api" });
    return;
  }
  if (requestUrl.pathname.startsWith("/manus-storage/")) {
    await handleStorage(req, res);
    return;
  }
  const path = requestUrl.pathname.replace(/^\/api\/trpc\/?/, "");
  await nodeHTTPRequestHandler({
    req,
    res,
    path,
    router: appRouter,
    createContext: (options) => createContext(options)
  });
}
export {
  handler as default
};
