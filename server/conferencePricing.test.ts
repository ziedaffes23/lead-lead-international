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

  it("adds the single-room charge by stay days", () => {
    expect(
      getContribution("International AIESECer", true, "Manager")
    ).toMatchObject({ price: 105, currency: "EUR" });
    expect(
      getContribution("International AIESECer", true, "MCP")
    ).toMatchObject({ price: 150, currency: "EUR" });
    expect(getContribution("EP", true)).toMatchObject({
      price: 105,
      currency: "EUR",
    });
    expect(getSingleRoomSurcharge("Manager", "International AIESECer")).toBe(40);
    expect(getSingleRoomSurcharge("Team Leader", "International AIESECer")).toBe(40);
    expect(getSingleRoomSurcharge("MCP", "International AIESECer")).toBe(60);
    expect(getSingleRoomSurcharge("", "EP")).toBe(40);
    expect(getStayDurationDays("International AIESECer", "Manager")).toBe(3);
    expect(getStayDurationDays("International AIESECer", "MCP")).toBe(4);
    expect(
      getContribution("International AIESECer", true, "MCP")?.note
    ).toContain("+20 EUR/day for 3 days");
  });

  it("hides LC name only for MC positions", () => {
    expect(shouldShowLcName("MCVP")).toBe(false);
    expect(shouldShowLcName("MCP")).toBe(false);
    expect(shouldShowLcName("Manager")).toBe(true);
    expect(shouldShowLcName("LCVP")).toBe(true);
  });

  it("does not calculate a contribution for an incomplete selection", () => {
    expect(getContribution("")).toBeNull();
  });
});
