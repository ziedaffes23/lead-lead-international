export type ConferenceNationality = "" | "Tunisian";
export type ConferenceTrack = "" | "MMB" | "EB";

export const TUNISIAN_MMB_TND = 160;
export const TUNISIAN_EB_TND = 240;
export const ACCOMMODATION_PER_NIGHT_TND = 80;
export const MMB_SINGLE_ROOM_SURCHARGE_TND = 100;
export const EB_SINGLE_ROOM_SURCHARGE_TND = 150;
export const MMB_DURATION_DAYS = 3;
export const EB_DURATION_DAYS = 4;

export type Contribution = {
  price: number;
  currency: "TND";
  note: string;
};

export function getContribution(
  nationality: ConferenceNationality,
  track: ConferenceTrack,
  singleRoom = false,
): Contribution | null {
  if (nationality !== "Tunisian" || !track) return null;

  const isMmb = track === "MMB";
  const basePrice = isMmb ? TUNISIAN_MMB_TND : TUNISIAN_EB_TND;
  const durationDays = isMmb ? MMB_DURATION_DAYS : EB_DURATION_DAYS;
  const singleRoomSurcharge = isMmb ? MMB_SINGLE_ROOM_SURCHARGE_TND : EB_SINGLE_ROOM_SURCHARGE_TND;
  const price = basePrice + (singleRoom ? singleRoomSurcharge : 0);
  const roomNote = singleRoom
    ? ` Single room selected: +${singleRoomSurcharge} TND.`
    : ` Shared room selected. Single room surcharge: +${singleRoomSurcharge} TND.`;

  return {
    price,
    currency: "TND",
    note: `Tunisian ${track} package: ${basePrice} TND for ${durationDays} days.${roomNote}`,
  };
}
