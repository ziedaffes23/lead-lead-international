export const LOCAL_COMMITTEES = [
  "LC Thyna",
  "LC University",
  "SU Bullaregia",
  "LC Tacapes",
  "LC Ruspina",
  "LC Carthage",
  "LC Bardo",
  "LC Medina",
  "LC Hadrumet",
  "LC Nabel",
  "LC Sfax",
  "LC Bizerte",
] as const;

export type LocalCommittee = (typeof LOCAL_COMMITTEES)[number];

export function localCommitteeFromSearch(search: string, fallback: LocalCommittee | "" = LOCAL_COMMITTEES[0]): LocalCommittee | "" {
  const candidate = new URLSearchParams(search).get("lc")?.trim();
  return candidate && (LOCAL_COMMITTEES as readonly string[]).includes(candidate) ? candidate as LocalCommittee : fallback;
}
