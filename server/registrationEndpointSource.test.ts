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
    expect(endpoint).toContain('"LC Name"');
    expect(endpoint).toContain('"Entity Name"');
    expect(endpoint).toContain('payload.lcName');
    expect(endpoint).toContain('payload.entityName');
    expect(endpoint).toContain('"Track"');
    expect(endpoint).toContain('ALLOWED_TRACKS');
    expect(endpoint).toContain('ALLOWED_POSITIONS');
    expect(endpoint).toContain('BASE_PRICE_EUR = 90');
    expect(endpoint).toContain('SINGLE_ROOM_SURCHARGE_EUR = 60');
    expect(endpoint).toContain('International AIESECer');
    expect(endpoint).toContain('valid email address');
    expect(endpoint).not.toContain("Only Tunisian registrations are currently accepted.");
    expect(endpoint).not.toContain("must contain digits only");
    expect(endpoint).not.toContain("exactly 8 digits");
    expect(endpoint).toContain('"Identity Document URL"');
    expect(endpoint).toContain('"Identity Document Name"');
    expect(endpoint).not.toContain("must end with @aiesec.net");
  });

  it("keeps uploaded HTTPS document URLs in the sheet without DriveApp authorization", () => {
    expect(endpoint).toContain("Attachment links must use HTTPS.");
    expect(endpoint).toContain("const driveDocuments = {};");
    expect(endpoint).not.toContain("DriveApp.getFolderById");
    expect(endpoint).not.toContain("DRIVE_FOLDER_ID");
  });

  it("preserves legacy sheet compatibility while normalizing SU Bullaregia", () => {
    expect(endpoint).toContain('"AIESEC email"');
    expect(endpoint).toContain('"lc bullaregia": "SU Bullaregia"');
    expect(endpoint).toContain('"su bullaregia": "SU Bullaregia"');
  });
});
