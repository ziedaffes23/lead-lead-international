import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const endpoint = await readFile(new URL("../LeadLeadRegistrationEndpoint.gs", import.meta.url), "utf8");

describe("registration Apps Script contract", () => {
  it("accepts generic email addresses and maps the complete registration payload", () => {
    expect(endpoint).toContain('"Email"');
    expect(endpoint).toContain('payload.email || payload.aiesecEmail');
    expect(endpoint).toContain('"Passport number"');
    expect(endpoint).toContain('"Phone country"');
    expect(endpoint).toContain('"Single room"');
    expect(endpoint).toContain('"Country of origin"');
    expect(endpoint).toContain('"Track"');
    expect(endpoint).toContain('ALLOWED_TRACKS');
    expect(endpoint).toContain('ALLOWED_POSITIONS');
    expect(endpoint).toContain('BASE_PRICE_EUR = 90');
    expect(endpoint).toContain('SINGLE_ROOM_SURCHARGE_EUR = 20');
    expect(endpoint).toContain('International AIESECer');
    expect(endpoint).toContain('valid email address');
    expect(endpoint).not.toContain("Only Tunisian registrations are currently accepted.");
    expect(endpoint).not.toContain("must contain digits only");
    expect(endpoint).not.toContain("exactly 8 digits");
    expect(endpoint).toContain('"Identity Document URL"');
    expect(endpoint).toContain('"Identity Document Name"');
    expect(endpoint).not.toContain("must end with @aiesec.net");
  });

  it("stores every uploaded document in the configured Drive folder and returns share links", () => {
    expect(endpoint).toContain('const DRIVE_FOLDER_ID = "1W9D3eZ6p2X6Y4qaOO-JzDr1MJtwceCUR";');
    expect(endpoint).toContain("DriveApp.getFolderById(DRIVE_FOLDER_ID)");
    expect(endpoint).toContain("DriveApp.Access.ANYONE_WITH_LINK");
    expect(endpoint).toContain("DriveApp.Permission.VIEW");
    expect(endpoint).toContain("documents: driveDocuments");
  });

  it("preserves legacy sheet compatibility while normalizing SU Bullaregia", () => {
    expect(endpoint).toContain('"AIESEC email"');
    expect(endpoint).toContain('"lc bullaregia": "SU Bullaregia"');
    expect(endpoint).toContain('"su bullaregia": "SU Bullaregia"');
  });
});
