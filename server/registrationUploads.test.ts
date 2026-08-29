import { describe, expect, it } from "vitest";
import { prepareRegistrationAttachment, toHttpsAbsoluteUrl } from "./registrationUploads";

describe("registration document validation", () => {
  it("converts storage proxy paths into absolute HTTPS links for Sheets", () => {
    expect(toHttpsAbsoluteUrl("/manus-storage/registrations/attachments/photo/file.png", {
      get: (name) => name === "host" ? "conference.example.com" : undefined,
    })).toBe("https://conference.example.com/manus-storage/registrations/attachments/photo/file.png");
  });

  it("uses the forwarded host when the app is behind a proxy", () => {
    expect(toHttpsAbsoluteUrl("/manus-storage/file.pdf", {
      get: (name) => name === "x-forwarded-host" ? "public.example.com" : "internal-host",
    })).toBe("https://public.example.com/manus-storage/file.pdf");
  });
  it("accepts a supported photo and normalizes its filename", () => {
    const prepared = prepareRegistrationAttachment("photo", {
      name: "delegate headshot.png",
      mimeType: "image/png",
      dataUrl: "data:image/png;base64,aGVsbG8=",
    });

    expect(prepared.bytes.toString()).toBe("hello");
    expect(prepared.safeName).toBe("delegate-headshot.png");
  });

  it("accepts a CIN or passport PDF", () => {
    const prepared = prepareRegistrationAttachment("identity", {
      name: "passport scan.pdf",
      mimeType: "application/pdf",
      dataUrl: "data:application/pdf;base64,aGVsbG8=",
    });

    expect(prepared.bytes.toString()).toBe("hello");
    expect(prepared.folder).toBe("identity");
  });

  it("rejects an identity document with an unsupported mime type", () => {
    expect(() => prepareRegistrationAttachment("identity", {
      name: "passport.txt",
      mimeType: "text/plain",
      dataUrl: "data:text/plain;base64,aGVsbG8=",
    })).toThrow("Unsupported identity file type");
  });

  it("rejects a CV with a non-PDF mime type", () => {
    expect(() => prepareRegistrationAttachment("cv", {
      name: "resume.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      dataUrl: "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,aGVsbG8=",
    })).toThrow("Unsupported cv file type");
  });
});
