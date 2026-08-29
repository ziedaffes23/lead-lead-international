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
  cin: "12345678",
  lc: "LC Thyna",
  phoneCountry: "+216",
  phone: "55111222",
  email: "foulen@example.com",
  nationality: "Tunisian",
  track: "MMB",
  position: "Manager",
  singleRoom: false,
  department: "MKT — Marketing",
  allergies: "None",
  note: "None",
  price: 160,
  currency: "TND",
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
  it("requires a numeric CIN and exactly eight phone digits", () => {
    expect(
      registrationSubmissionInput.safeParse({ ...input, cin: "1234ABCD" })
        .success
    ).toBe(false);
    expect(
      registrationSubmissionInput.safeParse({ ...input, phone: "5511122" })
        .success
    ).toBe(false);
    expect(
      registrationSubmissionInput.safeParse({ ...input, phone: "551112233" })
        .success
    ).toBe(false);
    expect(registrationSubmissionInput.safeParse(input).success).toBe(true);
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
        track: "MMB",
        position: "Manager",
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
