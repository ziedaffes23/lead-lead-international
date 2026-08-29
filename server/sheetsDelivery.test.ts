import { describe, expect, it } from "vitest";
import { confirmSheetsDelivery } from "@shared/sheetsDelivery";

describe("Sheets delivery confirmation", () => {
  it("accepts only an explicit successful Apps Script response", () => {
    expect(confirmSheetsDelivery(true, '{"ok":true,"row":4}')).toEqual({ ok: true, row: 4 });
  });

  it("rejects a JSON failure response even when Apps Script uses HTTP 200", () => {
    expect(() => confirmSheetsDelivery(true, '{"ok":false,"error":"Missing required field: department."}'))
      .toThrow("Missing required field: department.");
  });

  it("rejects unreadable response bodies instead of allowing a false receipt", () => {
    expect(() => confirmSheetsDelivery(true, "not-json")).toThrow("unreadable response");
  });
});
