import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const endpoint = await readFile(
  new URL("../LeadLeadRegistrationEndpoint.gs", import.meta.url),
  "utf8"
);

describe("registration Apps Script contract", () => {
  it("accepts generic email addresses and maps the complete registration payload", () => {
    expect(endpoint).toContain('"Email"');
    expect(endpoint).toContain("payload.email || payload.aiesecEmail");
    expect(endpoint).toContain('"Passport number"');
    expect(endpoint).toContain('"Phone country"');
    expect(endpoint).toContain('"Single room"');
    expect(endpoint).toContain('"Country of origin"');
    expect(endpoint).toContain('"Gender"');
    expect(endpoint).toContain('"Hosting LC"');
    expect(endpoint).toContain("payload.gender");
    expect(endpoint).toContain("payload.hostingLc");
    expect(endpoint).toContain('"LC Name"');
    expect(endpoint).toContain('"Entity Name"');
    expect(endpoint).toContain("payload.lcName");
    expect(endpoint).toContain("payload.entityName");
    expect(endpoint).toContain('"Track"');
    expect(endpoint).toContain("ALLOWED_TRACKS");
    expect(endpoint).toContain("ALLOWED_POSITIONS");
    expect(endpoint).toContain("LEADERSHIP_BASE_PRICE_EUR = 90");
    expect(endpoint).toContain("STANDARD_BASE_PRICE_EUR = 65");
    expect(endpoint).toContain("SINGLE_ROOM_PER_NIGHT_EUR = 20");
    expect(endpoint).toContain("STANDARD_DURATION_NIGHTS = 3");
    expect(endpoint).toContain("LEADERSHIP_DURATION_NIGHTS = 4");
    expect(endpoint).toContain("SHORT_SINGLE_ROOM_NIGHTS = 2");
    expect(endpoint).toContain("STANDARD_SINGLE_ROOM_NIGHTS = 3");
    expect(endpoint).not.toContain('  "MMB",');
    expect(endpoint).toContain('"MCVP"');
    expect(endpoint).toContain(
      "MCVP and MCP registrations must not include an LC name."
    );
    expect(endpoint).toContain('"MCP"');
    expect(endpoint).toContain("International AIESECer");
    expect(endpoint).toContain("valid email address");
    expect(endpoint).not.toContain(
      "Only Tunisian registrations are currently accepted."
    );
    expect(endpoint).not.toContain("must contain digits only");
    expect(endpoint).not.toContain("exactly 8 digits");
    expect(endpoint).toContain('"Identity Document URL"');
    expect(endpoint).toContain('"Identity Document Name"');
    expect(endpoint).not.toContain("must end with @aiesec.net");
  });

  it("stores inline document uploads in Google Drive before writing the sheet row", () => {
    expect(endpoint).toContain("const DRIVE_FOLDER_NAME =");
    expect(endpoint).toContain("DriveApp.getFoldersByName");
    expect(endpoint).toContain("saveRegistrationDocuments(payload)");
    expect(endpoint).toContain("Utilities.base64Decode");
    expect(endpoint).toContain("Attachment links must use HTTPS.");
  });

  it("preserves legacy sheet compatibility while normalizing SU Bullaregia", () => {
    expect(endpoint).toContain('"AIESEC email"');
    expect(endpoint).toContain('"lc bullaregia": "SU Bullaregia"');
    expect(endpoint).toContain('"su bullaregia": "SU Bullaregia"');
  });
});
