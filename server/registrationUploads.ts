import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { storagePut } from "./storage";

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const MAX_CV_BYTES = 5 * 1024 * 1024;
const MAX_IDENTITY_BYTES = 5 * 1024 * 1024;

export const attachmentInput = z.object({
  name: z.string().min(1).max(140),
  mimeType: z.string().min(1).max(100),
  dataUrl: z.string().min(32).max(7_100_000),
});

export const registrationUploadsInput = z.object({
  photo: attachmentInput.optional(),
  cv: attachmentInput.optional(),
  identity: attachmentInput.optional(),
});

type AttachmentInput = z.infer<typeof attachmentInput>;
type AttachmentKind = "photo" | "cv" | "identity";
type RequestLike = { get(name: string): string | undefined };

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

export function toHttpsAbsoluteUrl(value: string, req: RequestLike) {
  const candidate = value.trim();
  if (!candidate) return "";
  const origin = configuredPublicOrigin() || `https://${req.get("x-forwarded-host") || req.get("host") || "localhost"}`;
  const url = new URL(candidate, `${origin}/`);
  url.protocol = "https:";
  return url.toString();
}

export type UploadedRegistrationDocuments = {
  photo?: { name: string; url: string };
  cv?: { name: string; url: string };
  identity?: { name: string; url: string };
};

function policyFor(kind: AttachmentKind) {
  if (kind === "photo") return { allowed: ["image/jpeg", "image/png", "image/webp"], maxBytes: MAX_PHOTO_BYTES, folder: "photo" };
  if (kind === "identity") return { allowed: ["image/jpeg", "image/png", "application/pdf"], maxBytes: MAX_IDENTITY_BYTES, folder: "identity" };
  return { allowed: ["application/pdf"], maxBytes: MAX_CV_BYTES, folder: "cv" };
}

function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "attachment";
}

export function prepareRegistrationAttachment(kind: AttachmentKind, attachment: AttachmentInput) {
  const policy = policyFor(kind);
  if (!policy.allowed.includes(attachment.mimeType)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Unsupported ${kind} file type.` });
  }

  const prefix = `data:${attachment.mimeType};base64,`;
  if (!attachment.dataUrl.startsWith(prefix)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid ${kind} file payload.` });
  }

  const encoded = attachment.dataUrl.slice(prefix.length);
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid ${kind} file encoding.` });
  }

  const bytes = Buffer.from(encoded, "base64");
  if (!bytes.length || bytes.length > policy.maxBytes) {
    throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: `${kind === "photo" ? "Photo" : kind === "identity" ? "CIN or passport" : "CV"} exceeds the allowed size.` });
  }

  return { bytes, safeName: safeFilename(attachment.name), mimeType: attachment.mimeType, folder: policy.folder };
}

export async function uploadRegistrationDocuments(input: z.infer<typeof registrationUploadsInput>, req: RequestLike): Promise<UploadedRegistrationDocuments> {
  const documents: UploadedRegistrationDocuments = {};

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
