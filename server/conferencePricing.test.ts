import { describe, expect, it } from "vitest";
import {
  CONFERENCE_DURATION_DAYS,
  PARTICIPANT_BASE_PRICE_EUR,
  SINGLE_ROOM_SURCHARGE_EUR,
  getContribution,
} from "@/data/conferencePricing";

describe("conference pricing", () => {
  it("uses the confirmed three-day EUR package", () => {
    expect(PARTICIPANT_BASE_PRICE_EUR).toBe(90);
    expect(SINGLE_ROOM_SURCHARGE_EUR).toBe(50);
    expect(CONFERENCE_DURATION_DAYS).toBe(3);
  });

  it("calculates standard and leadership shared-room prices", () => {
    expect(
      getContribution("International AIESECer", false, "Member")
    ).toMatchObject({ price: 65, currency: "EUR" });
    expect(
      getContribution("International AIESECer", false, "Team Leader")
    ).toMatchObject({ price: 65, currency: "EUR" });
    expect(
      getContribution("International AIESECer", false, "LCVP")
    ).toMatchObject({ price: 90, currency: "EUR" });
    expect(
      getContribution("International AIESECer", false, "MCVP")
    ).toMatchObject({ price: 90, currency: "EUR" });
    expect(getContribution("EP")).toMatchObject({ price: 65, currency: "EUR" });
  });

  it("adds the 50 EUR single-room surcharge to every package", () => {
    expect(
      getContribution("International AIESECer", true, "Member")
    ).toMatchObject({ price: 115, currency: "EUR" });
    expect(
      getContribution("International AIESECer", true, "MCP")
    ).toMatchObject({ price: 140, currency: "EUR" });
    expect(getContribution("EP", true)).toMatchObject({
      price: 115,
      currency: "EUR",
    });
    expect(
      getContribution("International AIESECer", true, "MCP")?.note
    ).toContain("+50 EUR");
    expect(getContribution("EP", true)?.note).toContain("+50 EUR");
  });

  it("does not calculate a contribution for an incomplete selection", () => {
    expect(getContribution("")).toBeNull();
  });
});
