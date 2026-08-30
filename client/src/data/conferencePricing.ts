export type ConferenceTrack = "" | "International AIESECer" | "EP";

export const PARTICIPANT_BASE_PRICE_EUR = 90;
export const SINGLE_ROOM_SURCHARGE_EUR = 60;
export const CONFERENCE_DURATION_DAYS = 3;

export type Contribution = {
  price: number;
  currency: "EUR";
  note: string;
};

export function getContribution(
  track: ConferenceTrack,
  singleRoom = false,
): Contribution | null {
  if (!track) return null;

  const price = PARTICIPANT_BASE_PRICE_EUR + (singleRoom ? SINGLE_ROOM_SURCHARGE_EUR : 0);
  const roomNote = singleRoom
    ? ` Single room selected: +${SINGLE_ROOM_SURCHARGE_EUR} EUR.`
    : ` Shared room selected. Single room surcharge: +${SINGLE_ROOM_SURCHARGE_EUR} EUR.`;

  return {
    price,
    currency: "EUR",
    note: `${track} package: ${PARTICIPANT_BASE_PRICE_EUR} EUR for ${CONFERENCE_DURATION_DAYS} days.${roomNote}`,
  };
}
