import { afterEach, describe, expect, it } from "vitest";
import {
  registrationSubmissionInput,
  submitRegistrationToSheets,
  type RegistrationSubmissionInput,
} from "./registrationSubmission";

const originalEndpoint = process.env.VITE_SHEETS_WEB_APP_URL;
const originalFetch = globalThis.fetch;

const input: RegistrationSubmissionInput = {
  firstName: "Foulen",
  lastName: "Fouleni",
  passportNumber: "A12-34B",
  gender: "Male",
  phoneCountry: "+216",
  phone: "+216 55 111 222 ext. 9",
  email: "foulen@example.com",
  track: "International AIESECer",
  position: "Manager",
  singleRoom: false,
  department: "MKT — Marketing",
  lcName: "LC Thyna",
  entityName: "AIESEC in Tunisia",
  mcPosition: "None",
  countryOfOrigin: "None",
  hostingLc: "None",
  allergies: "None",
  note: "None",
  price: 65,
  currency: "EUR",
  photoUrl: "https://storage.example.com/photo.jpg",
  photoName: "photo.jpg",
  cvUrl: "https://storage.example.com/cv.pdf",
  cvName: "cv.pdf",
  identityUrl: "https://storage.example.com/identity.pdf",
  identityName: "identity.pdf",
  indemnitySignature: "Foulen Fouleni",
  indemnityAccepted: true,
};

afterEach(() => {
  if (originalEndpoint === undefined)
    delete process.env.VITE_SHEETS_WEB_APP_URL;
  else process.env.VITE_SHEETS_WEB_APP_URL = originalEndpoint;
  globalThis.fetch = originalFetch;
});

describe("registration sheet submission bridge", () => {
  it("accepts alphanumeric passports and unrestricted phone text", () => {
    expect(registrationSubmissionInput.safeParse(input).success).toBe(true);
    expect(
      registrationSubmissionInput.safeParse({
        ...input,
        track: "EP",
        position: "None",
        department: "None",
        lcName: "None",
        entityName: "None",
        mcPosition: "None",
        countryOfOrigin: "Brazil",
        hostingLc: "LC Thyna",
        singleRoom: true,
        price: 125,
        passportNumber: "P-AB 123/XY",
        phone: "00 55 (11) 99999-0000",
      }).success
    ).toBe(true);
  });

  it("validates the requested MC position rules", () => {
    expect(
      registrationSubmissionInput.safeParse({
        ...input,
        position: "MCVP",
        lcName: "None",
        mcPosition: "MCVP Growth",
        price: 90,
      }).success
    ).toBe(true);
    expect(
      registrationSubmissionInput.safeParse({
        ...input,
        position: "MCP",
        lcName: "None",
        mcPosition: "None",
        price: 90,
      }).success
    ).toBe(true);
    expect(
      registrationSubmissionInput.safeParse({
        ...input,
        position: "MCVP",
        lcName: "None",
        mcPosition: "None",
        price: 90,
      }).success
    ).toBe(false);
    expect(
      registrationSubmissionInput.safeParse({
        ...input,
        position: "MCP",
        lcName: "None",
        mcPosition: "MC President",
        price: 90,
      }).success
    ).toBe(false);
  });

  it("rejects a mismatched price or conditional field contract", () => {
    expect(
      registrationSubmissionInput.safeParse({ ...input, price: 110 }).success
    ).toBe(false);
    expect(
      registrationSubmissionInput.safeParse({
        ...input,
        countryOfOrigin: "Tunisia",
      }).success
    ).toBe(false);
    expect(
      registrationSubmissionInput.safeParse({
        ...input,
        track: "EP",
        position: "None",
        department: "None",
        lcName: "None",
        entityName: "None",
        mcPosition: "None",
        countryOfOrigin: "",
        hostingLc: "LC Thyna",
      }).success
    ).toBe(false);
  });

  it("posts the validated payload server-side and returns the confirmation", async () => {
    process.env.VITE_SHEETS_WEB_APP_URL =
      "https://script.google.com/macros/s/test/exec";
    globalThis.fetch = async (url, init) => {
      expect(String(url)).toBe(process.env.VITE_SHEETS_WEB_APP_URL);
      expect(init?.method).toBe("POST");
      expect(init?.headers).toEqual({
        "Content-Type": "text/plain;charset=utf-8",
      });
      expect(JSON.parse(String(init?.body))).toMatchObject({
        track: "International AIESECer",
        position: "Manager",
        passportNumber: "A12-34B",
        lcName: "LC Thyna",
        entityName: "AIESEC in Tunisia",
        price: 65,
        currency: "EUR",
      });
      return new Response(JSON.stringify({ ok: true, row: 12 }), {
        status: 200,
      });
    };

    await expect(submitRegistrationToSheets(input)).resolves.toEqual({
      ok: true,
      row: 12,
    });
  });

  it("follows the Apps Script content-service redirect and confirms the JSON response", async () => {
    process.env.VITE_SHEETS_WEB_APP_URL =
      "https://script.google.com/macros/s/test/exec";
    let call = 0;
    globalThis.fetch = async (url, init) => {
      call += 1;
      if (call === 1) {
        expect(String(url)).toBe(process.env.VITE_SHEETS_WEB_APP_URL);
        expect(init?.redirect).toBe("manual");
        return new Response(null, {
          status: 302,
          headers: {
            location:
              "https://script.googleusercontent.com/macros/echo?token=test",
          },
        });
      }
      expect(String(url)).toContain(
        "https://script.googleusercontent.com/macros/echo"
      );
      expect(init?.method).toBeUndefined();
      expect(init?.headers).toEqual({ Accept: "application/json" });
      return new Response(JSON.stringify({ ok: true, row: 13 }), {
        status: 200,
      });
    };

    await expect(submitRegistrationToSheets(input)).resolves.toEqual({
      ok: true,
      row: 13,
    });
  });

  it("surfaces an explicit endpoint rejection instead of returning a false receipt", async () => {
    process.env.VITE_SHEETS_WEB_APP_URL =
      "https://script.google.com/macros/s/test/exec";
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ ok: false, error: "Missing required field: track." }),
        { status: 200 }
      );

    await expect(submitRegistrationToSheets(input)).rejects.toMatchObject({
      code: "BAD_GATEWAY",
      message: "Missing required field: track.",
    });
  });
});
