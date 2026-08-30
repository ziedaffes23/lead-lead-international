export type ConferenceTrack = "" | "International AIESECer" | "EP";
export type ConferencePosition = "" | "None" | "Member" | "Manager" | "Team Leader" | "LCVP" | "LCP" | "MCVP" | "MCP";

export const PARTICIPANT_BASE_PRICE_EUR = 90;
export const STANDARD_BASE_PRICE_EUR = 65;
export const SINGLE_ROOM_SURCHARGE_EUR = 50;
export const CONFERENCE_DURATION_DAYS = 3;

export type Contribution = {
  price: number;
  currency: "EUR";
  note: string;
};

export function getContribution(
  track: ConferenceTrack,
  singleRoom = false,
  position: ConferencePosition = ""
): Contribution | null {
  if (!track) return null;

  const isLeadershipPackage =
    track === "International AIESECer" &&
    ["LCVP", "LCP", "MCVP", "MCP"].includes(position);
  const basePrice = isLeadershipPackage
    ? PARTICIPANT_BASE_PRICE_EUR
    : STANDARD_BASE_PRICE_EUR;
  const price = basePrice + (singleRoom ? SINGLE_ROOM_SURCHARGE_EUR : 0);
  const roomNote = singleRoom
    ? ` Single room selected: +${SINGLE_ROOM_SURCHARGE_EUR} EUR.`
    : ` Shared room selected. Single room surcharge: +${SINGLE_ROOM_SURCHARGE_EUR} EUR.`;

  return {
    price,
    currency: "EUR",
    note: `${track}${position ? ` / ${position}` : ""} package: ${basePrice} EUR for ${CONFERENCE_DURATION_DAYS} days.${roomNote}`,
  };
}
