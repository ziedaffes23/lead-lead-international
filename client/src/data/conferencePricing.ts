export type ConferenceTrack = "" | "International AIESECer" | "EP";
export type ConferencePosition =
  | ""
  | "None"
  | "Manager"
  | "Team Leader"
  | "LCVP"
  | "LCP"
  | "MCVP"
  | "MCP";

export const STANDARD_BASE_PRICE_EUR = 65;
export const LEADERSHIP_BASE_PRICE_EUR = 90;
export const SINGLE_ROOM_PER_NIGHT_EUR = 20;
export const SHORT_SINGLE_ROOM_NIGHTS = 2;
export const STANDARD_SINGLE_ROOM_NIGHTS = 3;
export const STANDARD_DURATION_DAYS = 3;
export const LEADERSHIP_DURATION_DAYS = 4;

export type Contribution = {
  price: number;
  currency: "EUR";
  note: string;
};

const leadershipPositions: ConferencePosition[] = [
  "LCVP",
  "LCP",
  "MCVP",
  "MCP",
];

const shortRoomPositions: ConferencePosition[] = ["Manager", "Team Leader"];

export function getSingleRoomNights(
  track: ConferenceTrack,
  position: ConferencePosition = ""
) {
  return track === "EP" ||
    (track === "International AIESECer" && shortRoomPositions.includes(position))
    ? SHORT_SINGLE_ROOM_NIGHTS
    : STANDARD_SINGLE_ROOM_NIGHTS;
}

export function getContribution(
  track: ConferenceTrack,
  singleRoom = false,
  position: ConferencePosition = ""
): Contribution | null {
  if (!track) return null;

  const isLeadershipPackage =
    track === "International AIESECer" &&
    leadershipPositions.includes(position);
  const durationDays = isLeadershipPackage
    ? LEADERSHIP_DURATION_DAYS
    : STANDARD_DURATION_DAYS;
  const basePrice = isLeadershipPackage
    ? LEADERSHIP_BASE_PRICE_EUR
    : STANDARD_BASE_PRICE_EUR;
  const roomNights = getSingleRoomNights(track, position);
  const roomSurcharge = singleRoom
    ? SINGLE_ROOM_PER_NIGHT_EUR * roomNights
    : 0;
  const price = basePrice + roomSurcharge;
  const roomNote = singleRoom
    ? ` Single room selected: +${SINGLE_ROOM_PER_NIGHT_EUR} EUR/day for ${roomNights} days (${roomSurcharge} EUR).`
    : ` Shared room selected. Single room: ${SINGLE_ROOM_PER_NIGHT_EUR * roomNights} EUR for ${roomNights} days.`;

  return {
    price,
    currency: "EUR",
    note: `${track}${position ? ` / ${position}` : ""} package: ${basePrice} EUR for ${durationDays} days.${roomNote}`,
  };
}

export function isLeadershipPosition(position: ConferencePosition) {
  return leadershipPositions.includes(position);
}

export function shouldShowLcName(position: ConferencePosition) {
  return !["MCVP", "MCP"].includes(position);
}

export function getStayDurationDays(
  track: ConferenceTrack,
  position: ConferencePosition = ""
) {
  return track === "International AIESECer" && isLeadershipPosition(position)
    ? LEADERSHIP_DURATION_DAYS
    : STANDARD_DURATION_DAYS;
}

export function getExpectedContributionPrice(
  track: ConferenceTrack,
  position: ConferencePosition,
  singleRoom: boolean
) {
  return getContribution(track, singleRoom, position)?.price ?? 0;
}

export const POSITION_OPTIONS: Exclude<ConferencePosition, "" | "None">[] = [
  "Manager",
  "Team Leader",
  "LCVP",
  "LCP",
  "MCVP",
  "MCP",
];

export const LEADERSHIP_POSITIONS = leadershipPositions;
export const CONFERENCE_DURATION_DAYS = STANDARD_DURATION_DAYS;
export const SINGLE_ROOM_SURCHARGE_EUR = SINGLE_ROOM_PER_NIGHT_EUR;
export const PARTICIPANT_BASE_PRICE_EUR = LEADERSHIP_BASE_PRICE_EUR;
export const STANDARD_BASE_PRICE_EUR_ALIAS = STANDARD_BASE_PRICE_EUR;
export const SINGLE_ROOM_SURCHARGE_EUR_ALIAS = SINGLE_ROOM_PER_NIGHT_EUR;

export function getSingleRoomSurcharge(
  position: ConferencePosition,
  track: ConferenceTrack
) {
  return SINGLE_ROOM_PER_NIGHT_EUR * getSingleRoomNights(track, position);
}
