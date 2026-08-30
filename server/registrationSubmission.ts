import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { confirmSheetsDelivery } from "@shared/sheetsDelivery";

const publicUrl = z
  .string()
  .url()
  .refine(
    value => value.startsWith("https://"),
    "Document URLs must use HTTPS."
  );

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
      "Member",
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
    countryOfOrigin: z.string().trim().min(1),
    hostingLc: z.string().trim().min(1),
    allergies: z.string().trim().min(1),
    note: z.string().trim().min(1),
    price: z.number().int().nonnegative(),
    currency: z.literal("EUR"),
    photoUrl: publicUrl,
    photoName: z.string().trim().min(1),
    cvUrl: publicUrl,
    cvName: z.string().trim().min(1),
    identityUrl: publicUrl,
    identityName: z.string().trim().min(1),
    indemnitySignature: z.string().trim().min(1),
    indemnityAccepted: z
      .boolean()
      .refine(value => value, "Indemnity consent is required."),
  })
  .superRefine((input, ctx) => {
    const leadershipPosition = ["LCVP", "LCP", "MCVP", "MCP"].includes(
      input.position
    );
    const expectedPrice =
      (leadershipPosition ? 90 : 65) + (input.singleRoom ? 50 : 0);
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
      if (input.lcName === "None") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lcName"],
          message: "International AIESECer registrations require an LC name.",
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

export async function submitRegistrationToSheets(
  input: RegistrationSubmissionInput
) {
  const endpoint =
    process.env.VITE_SHEETS_WEB_APP_URL || process.env.SHEETS_WEB_APP_URL;
  if (!endpoint) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Registration setup is incomplete. Please contact the organising team before retrying.",
    });
  }

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
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(input),
      redirect: "manual",
      signal: AbortSignal.timeout(30_000),
    });

    const redirectStatuses = new Set([301, 302, 303, 307, 308]);
    const finalResponse = redirectStatuses.has(response.status)
      ? await (async () => {
          const location = response.headers.get("location");
          if (!location)
            throw new Error(
              "The registration service did not provide a response location."
            );
          return fetch(location, {
            headers: { Accept: "application/json" },
            redirect: "manual",
            signal: AbortSignal.timeout(30_000),
          });
        })()
      : response;

    const confirmation = confirmSheetsDelivery(
      finalResponse.ok,
      await finalResponse.text()
    );
    return confirmation;
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const message =
      error instanceof Error
        ? error.message
        : "The registration service could not confirm your record.";
    throw new TRPCError({ code: "BAD_GATEWAY", message });
  }
}
