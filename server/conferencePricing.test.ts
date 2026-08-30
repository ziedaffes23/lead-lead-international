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
    expect(SINGLE_ROOM_SURCHARGE_EUR).toBe(60);
    expect(CONFERENCE_DURATION_DAYS).toBe(3);
  });

  it("calculates the shared-room price for both participant types", () => {
    expect(getContribution("International AIESECer")).toMatchObject({ price: 90, currency: "EUR" });
    expect(getContribution("EP")).toMatchObject({ price: 90, currency: "EUR" });
  });

  it("adds the same single-room surcharge to both participant types", () => {
    expect(getContribution("International AIESECer", true)).toMatchObject({ price: 150, currency: "EUR" });
    expect(getContribution("EP", true)).toMatchObject({ price: 150, currency: "EUR" });
    expect(getContribution("International AIESECer", true)?.note).toContain("+60 EUR");
    expect(getContribution("EP", true)?.note).toContain("+60 EUR");
  });

  it("does not calculate a contribution for an incomplete selection", () => {
    expect(getContribution("")).toBeNull();
  });
});
