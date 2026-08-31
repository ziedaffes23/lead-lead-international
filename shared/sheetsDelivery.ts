export type DriveDocumentLink = { name: string; url: string };
export type SheetsDeliveryConfirmation = { ok: true; row?: number; documents?: Partial<Record<"photo" | "cv" | "identity", DriveDocumentLink>> };

export function confirmSheetsDelivery(
  httpOk: boolean,
  body: string,
  responseUrl?: string
): SheetsDeliveryConfirmation {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    if (
      httpOk &&
      responseUrl?.startsWith("https://script.googleusercontent.com/") &&
      body.trim() &&
      !body.toLowerCase().includes("sorry, unable to open the file")
    ) {
      return { ok: true };
    }
    throw new Error("The registration service returned an unreadable response. Please try again shortly.");
  }

  const response = parsed && typeof parsed === "object" ? parsed as { ok?: unknown; row?: unknown; error?: unknown; documents?: unknown } : {};
  if (!httpOk || response.ok !== true) {
    const message = typeof response.error === "string" && response.error.trim()
      ? response.error.trim()
      : "The registration service did not confirm your record.";
    throw new Error(message);
  }

  const documents = response.documents && typeof response.documents === "object" ? response.documents as Partial<Record<"photo" | "cv" | "identity", DriveDocumentLink>> : undefined;
  return { ok: true, row: typeof response.row === "number" ? response.row : undefined, documents };
}
