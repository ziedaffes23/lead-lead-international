import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { confirmSheetsDelivery } from "@shared/sheetsDelivery";

const publicUrl = z
  .string()
  .url()
  .refine(
    value => value.startsWith("https://"),
    "Document URLs must use HTTPS."
  );

export const registrationSubmissionInput = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  cin: z.string().trim().regex(/^\d+$/, "CIN number must contain digits only."),
  lc: z.string().trim().min(1),
  phoneCountry: z.string().trim().min(1),
  phone: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "Phone number must contain exactly 8 digits."),
  email: z.string().trim().email(),
  nationality: z.literal("Tunisian"),
  track: z.enum(["MMB", "EB"]),
  position: z.enum(["Manager", "Team Leader", "LCVP", "LCP"]),
  singleRoom: z.boolean(),
  department: z.string().trim().min(1),
  allergies: z.string().trim().min(1),
  note: z.string().trim().min(1),
  price: z.number().int().nonnegative(),
  currency: z.literal("TND"),
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

    // Apps Script returns the ContentService JSON through a one-time 302 redirect.
    // Fetching the redirect target explicitly avoids clients turning the POST into
    // an invalid follow-up request and receiving an HTML "Page Not Found" response.
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
