import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { confirmSheetsDelivery } from "@shared/sheetsDelivery";

const DEFAULT_SHEETS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbykExcZ-IACxWONFqSMz-BQ4hg1dYF6zu_q-SgmYTp2auDyeuKeIrxWlYmoymi90RXB/exec";
const LEGACY_SHEETS_WEB_APP_URLS = new Set([
  "https://script.google.com/macros/s/AKfycbxGWI8ZmEG80Hl8r0GciT4AnFGyCGc6QiQDzQ9kTyhkaDltfFtrddbtAMHGgV_m7lS4/exec",
  "https://script.google.com/macros/s/AKfycbxW5E8LFwz8FqDPSRovruq7mwi6LQ0BlLCIaSK4vADR-ZBTIeR8_F7n644FQGNqdn2b/exec",
  "https://script.google.com/macros/s/AKfycbyS16hLcvvCg4eqj7OpjI3qZV8WLRa_33qBtmBT6DJLCpUfeE8NNZBBNDySBCR9hKHa/exec",
]);

const documentUrl = z
  .string()
  .trim()
  .refine(value => !value || value.startsWith("https://"), "Document URLs must use HTTPS.");
const documentDataUrl = z.string().trim().max(8_000_000).optional();

export const registrationSubmissionInput = z
  .object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    passportNumber: z.string().trim().min(1),
    gender: z.enum(["Male", "Female"]),
    phoneCountry: z.string().trim().min(1),
    phone: z.string().trim().min(1),
    email: z.string().trim().email(),
    track: z.enum(["International AIESECer", "EP"]),
    position: z.enum([
      "None",
      "Manager",
      "Team Leader",
      "LCVP",
      "LCP",
      "MCVP",
      "MCP",
    ]),
    singleRoom: z.boolean(),
    department: z.string().trim().min(1),
    lcName: z.string().trim().min(1),
    entityName: z.string().trim().min(1),
    mcPosition: z.string().trim().min(1),
    countryOfOrigin: z.string().trim().min(1),
    hostingLc: z.string().trim().min(1),
    allergies: z.string().trim().min(1),
    note: z.string().trim().min(1),
    price: z.number().int().nonnegative(),
    currency: z.literal("EUR"),
    photoUrl: documentUrl,
    photoDataUrl: documentDataUrl,
    photoName: z.string().trim().min(1),
    cvUrl: documentUrl,
    cvDataUrl: documentDataUrl,
    cvName: z.string().trim().min(1),
    identityUrl: documentUrl,
    identityDataUrl: documentDataUrl,
    identityName: z.string().trim().min(1),
    indemnitySignature: z.string().trim().min(1),
    indemnityAccepted: z
      .boolean()
      .refine(value => value, "Indemnity consent is required."),
  })
  .superRefine((input, ctx) => {
    const leadershipPosition = [
      "LCVP",
      "LCP",
      "MCVP",
      "MCP",
    ].includes(input.position);
    const shortRoomStay =
      input.track === "EP" ||
      (input.track === "International AIESECer" &&
        ["Manager", "Team Leader"].includes(input.position));
    const roomNights = shortRoomStay ? 2 : 3;
    const expectedPrice =
      (leadershipPosition ? 90 : 65) +
      (input.singleRoom ? 20 * roomNights : 0);
    if (input.price !== expectedPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: `Price must be ${expectedPrice} EUR for the selected room type.`,
      });
    }

    if (input.track === "EP") {
      if (input.position !== "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["position"],
          message: "EP registrations must not include an AIESEC position.",
        });
      }
      if (input.department !== "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["department"],
          message: "EP registrations must not include an AIESEC department.",
        });
      }
      if (input.lcName !== "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lcName"],
          message: "EP registrations must not include an LC name.",
        });
      }
      if (input.entityName !== "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entityName"],
          message: "EP registrations must not include an entity name.",
        });
      }
      if (input.mcPosition !== "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mcPosition"],
          message: "EP registrations must not include an MC position.",
        });
      }
      if (input.hostingLc === "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hostingLc"],
          message: "Hosting LC is required for EP registrations.",
        });
      }
    } else {
      if (input.position === "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["position"],
          message: "International AIESECer registrations require a position.",
        });
      }
      if (input.department === "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["department"],
          message: "International AIESECer registrations require a department.",
        });
      }
      const mcPosition = ["MCVP", "MCP"].includes(input.position);
      if (!mcPosition && input.lcName === "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lcName"],
          message:
            "International AIESECer registrations require an LC name unless the position is MCVP or MCP.",
        });
      }
      if (mcPosition && input.lcName !== "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lcName"],
          message:
            "MCVP and MCP registrations must not include an LC name.",
        });
      }
      if (input.mcPosition !== "None" && input.position === "MCP") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mcPosition"],
          message: "MCP registrations must not include an MC position.",
        });
      }
      if (
        input.position === "MCVP" &&
        input.mcPosition === "None"
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mcPosition"],
          message: "MCVP registrations require an MC position.",
        });
      }
      if (
        !["MCVP", "MCP"].includes(input.position) &&
        input.mcPosition !== "None"
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mcPosition"],
          message:
            "Only MCVP registrations may include an MC position.",
        });
      }
      if (input.entityName === "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entityName"],
          message:
            "International AIESECer registrations require an entity name.",
        });
      }
      if (input.countryOfOrigin !== "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["countryOfOrigin"],
          message:
            "International AIESECer registrations do not require a country of origin.",
        });
      }
      if (input.hostingLc !== "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hostingLc"],
          message:
            "International AIESECer registrations do not require a hosting LC.",
        });
      }
    }
  });

export type RegistrationSubmissionInput = z.infer<
  typeof registrationSubmissionInput
>;

type AppsScriptFetchResult = {
  ok: boolean;
  body: string;
  url: string;
  initialStatus: number;
};

type DriveLink = { name: string; url: string };

async function postToAppsScript(endpoint: URL, payload: unknown): Promise<AppsScriptFetchResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    redirect: "manual",
    signal: AbortSignal.timeout(55_000),
  });

  const finalResponse =
    response.status >= 300 && response.status < 400
      ? await (async () => {
          const location = response.headers.get("location");
          if (!location)
            throw new Error("The registration service did not provide a response location.");
          return fetch(location, {
            headers: { Accept: "application/json" },
            redirect: "follow",
            signal: AbortSignal.timeout(55_000),
          });
        })()
      : response;

  return {
    ok: finalResponse.ok,
    body: await finalResponse.text(),
    url: finalResponse.url,
    initialStatus: response.status,
  };
}

function parseAppsScriptJson(result: AppsScriptFetchResult): Record<string, any> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(result.body);
  } catch {
    throw new Error("The registration service returned an unreadable response. Please try again shortly.");
  }
  const response = parsed && typeof parsed === "object" ? parsed as Record<string, any> : {};
  if (!result.ok || response.ok !== true) {
    throw new Error(
      typeof response.error === "string" && response.error.trim()
        ? response.error.trim()
        : "The registration service did not confirm your record."
    );
  }
  return response;
}

export async function submitRegistrationToSheets(
  input: RegistrationSubmissionInput
) {
  const configuredEndpoint =
    process.env.VITE_SHEETS_WEB_APP_URL || process.env.SHEETS_WEB_APP_URL;
  const isProduction =
    process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  const endpoint =
    isProduction || !configuredEndpoint || LEGACY_SHEETS_WEB_APP_URLS.has(configuredEndpoint)
      ? DEFAULT_SHEETS_WEB_APP_URL
      : configuredEndpoint;

  let url: URL;
  try {
    url = new URL(endpoint);
    if (url.protocol !== "https:" || !url.pathname.endsWith("/exec"))
      throw new Error("Invalid registration endpoint.");
  } catch {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Registration setup is incomplete. Please contact the organising team before retrying.",
    });
  }

  try {
    // Keep URL-only submissions compatible with the existing bridge and tests.
    // The optimized path is used by the registration form, which supplies all
    // three inline file payloads.
    if (!input.photoDataUrl || !input.cvDataUrl || !input.identityDataUrl) {
      const legacyResponse = await postToAppsScript(url, input);
      return confirmSheetsDelivery(
        legacyResponse.ok,
        legacyResponse.body,
        legacyResponse.url,
        legacyResponse.initialStatus
      );
    }

    const uploadSpecs = [
      { type: "photo", data: input.photoDataUrl, name: input.photoName, key: "photo" },
      { type: "cv", data: input.cvDataUrl, name: input.cvName, key: "cv" },
      { type: "identity", data: input.identityDataUrl, name: input.identityName, key: "identity" },
    ] as const;

    const uploadedEntries = await Promise.all(
      uploadSpecs.map(async spec => {
        if (!spec.data) throw new Error(`Missing required ${spec.type} file.`);
        const response = parseAppsScriptJson(
          await postToAppsScript(url, {
            action: "uploadDocument",
            documentType: spec.type,
            [`${spec.type}DataUrl`]: spec.data,
            [`${spec.type}Name`]: spec.name,
          })
        );
        const document = response.document as DriveLink | undefined;
        if (!document?.url || !document.name)
          throw new Error(`The ${spec.type} upload did not return a Drive link.`);
        return [spec.key, document] as const;
      })
    );

    const documents = Object.fromEntries(uploadedEntries) as Record<"photo" | "cv" | "identity", DriveLink>;
    const sheetPayload = {
      ...input,
      photoUrl: documents.photo.url,
      photoName: documents.photo.name,
      photoDataUrl: undefined,
      cvUrl: documents.cv.url,
      cvName: documents.cv.name,
      cvDataUrl: undefined,
      identityUrl: documents.identity.url,
      identityName: documents.identity.name,
      identityDataUrl: undefined,
    };

    const confirmationResponse = await postToAppsScript(url, sheetPayload);
    const confirmation = confirmSheetsDelivery(
      confirmationResponse.ok,
      confirmationResponse.body,
      confirmationResponse.url,
      confirmationResponse.initialStatus
    );
    return { ...confirmation, documents };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const message =
      error instanceof Error
        ? error.message
        : "The registration service could not confirm your record.";
    throw new TRPCError({ code: "BAD_GATEWAY", message });
  }
}
