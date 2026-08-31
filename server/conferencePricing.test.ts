import { describe, expect, it } from "vitest";
import {
  CONFERENCE_DURATION_DAYS,
  LEADERSHIP_BASE_PRICE_EUR,
  LEADERSHIP_DURATION_DAYS,
  PARTICIPANT_BASE_PRICE_EUR,
  SINGLE_ROOM_SURCHARGE_EUR,
  STANDARD_BASE_PRICE_EUR,
  getContribution,
  getSingleRoomSurcharge,
  getStayDurationDays,
  shouldShowLcName,
} from "@/data/conferencePricing";

describe("conference pricing", () => {
  it("uses the requested EUR packages and stay durations", () => {
    expect(STANDARD_BASE_PRICE_EUR).toBe(65);
    expect(LEADERSHIP_BASE_PRICE_EUR).toBe(90);
    expect(PARTICIPANT_BASE_PRICE_EUR).toBe(90);
    expect(SINGLE_ROOM_SURCHARGE_EUR).toBe(20);
    expect(CONFERENCE_DURATION_DAYS).toBe(3);
    expect(LEADERSHIP_DURATION_DAYS).toBe(4);
  });

  it("calculates standard and leadership shared-room prices", () => {
    expect(
      getContribution("International AIESECer", false, "MMB")
    ).toMatchObject({ price: 65, currency: "EUR" });
    expect(
      getContribution("International AIESECer", false, "Manager")
    ).toMatchObject({ price: 65, currency: "EUR" });
    expect(
      getContribution("International AIESECer", false, "Team Leader")
    ).toMatchObject({ price: 65, currency: "EUR" });
    expect(
      getContribution("International AIESECer", false, "LCVP")
    ).toMatchObject({ price: 90, currency: "EUR" });
    expect(
      getContribution("International AIESECer", false, "LCP")
    ).toMatchObject({ price: 90, currency: "EUR" });
    expect(
      getContribution("International AIESECer", false, "MCVP")
    ).toMatchObject({ price: 90, currency: "EUR" });
    expect(
      getContribution("International AIESECer", false, "MCP")
    ).toMatchObject({ price: 90, currency: "EUR" });
    expect(getContribution("EP")).toMatchObject({ price: 65, currency: "EUR" });
  });

  it("adds 20 EUR per night for a single room", () => {
    expect(
      getContribution("International AIESECer", true, "MMB")
    ).toMatchObject({ price: 125, currency: "EUR" });
    expect(
      getContribution("International AIESECer", true, "MCP")
    ).toMatchObject({ price: 170, currency: "EUR" });
    expect(getContribution("EP", true)).toMatchObject({
      price: 125,
      currency: "EUR",
    });
    expect(getSingleRoomSurcharge("MMB", "International AIESECer")).toBe(60);
    expect(getSingleRoomSurcharge("MCP", "International AIESECer")).toBe(80);
    expect(getStayDurationDays("International AIESECer", "MMB")).toBe(3);
    expect(getStayDurationDays("International AIESECer", "MCP")).toBe(4);
    expect(
      getContribution("International AIESECer", true, "MCP")?.note
    ).toContain("+20 EUR/night for 4 nights");
  });

  it("hides LC name only for MC positions", () => {
    expect(shouldShowLcName("MCVP")).toBe(false);
    expect(shouldShowLcName("MCP")).toBe(false);
    expect(shouldShowLcName("MMB")).toBe(true);
    expect(shouldShowLcName("LCVP")).toBe(true);
  });

  it("does not calculate a contribution for an incomplete selection", () => {
    expect(getContribution("")).toBeNull();
  });
});
