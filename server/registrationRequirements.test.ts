import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const registerSource = await readFile(new URL("../client/src/pages/Register.tsx", import.meta.url), "utf8");
const appSource = await readFile(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const headerSource = await readFile(new URL("../client/src/components/ConferenceHeader.tsx", import.meta.url), "utf8");
const dataSource = await readFile(new URL("../client/src/data/conferenceSections.ts", import.meta.url), "utf8");

describe("registration requirements and dark-only presentation", () => {
  it("uses a generic required email with the requested example", () => {
    expect(registerSource).toContain('label>Email');
    expect(registerSource).toContain('placeholder="foulen.fouleni@mail.com"');
    expect(registerSource).toContain("Use a valid email address.");
    expect(registerSource).not.toContain("@aiesec.net");
    expect(dataSource).not.toContain("@aiesec.net");
  });

  it("marks core registration inputs as required", () => {
    expect(registerSource).toContain('placeholder="Foulen" required');
    expect(registerSource).toContain('placeholder="Fouléni" required');
    expect(registerSource).toContain('placeholder="Enter your CIN number" required');
    expect(registerSource).toContain('inputMode="numeric" pattern="[0-9]*"');
    expect(registerSource).toContain('CIN number must contain digits only.');
    expect(registerSource).toContain('<select required value={form.lc}');
    expect(registerSource).toContain('Country code<select value={form.phoneCountry}');
    expect(registerSource).toContain('inputMode="tel" required');
    expect(registerSource).toContain('maxLength={8} pattern="[0-9]{8}"');
    expect(registerSource).toContain('Phone number must contain exactly 8 digits.');
    expect(registerSource).toContain('CIN / passport');
    expect(registerSource).toContain('accept="image/jpeg,image/png,application/pdf,.pdf" required');
    expect(registerSource).toContain('accept="image/jpeg,image/png,image/webp" required');
    expect(registerSource).toContain('accept="application/pdf,.pdf" required');
    expect(registerSource).toContain('placeholder="List allergies or dietary concerns, or enter None" required');
    expect(registerSource).toContain('placeholder="Add a note for the organising team, or enter None" required');
    expect(registerSource).not.toContain('EP / international');
    expect(registerSource).toContain('Select track');
    expect(registerSource).toContain('Manager');
    expect(registerSource).toContain('Team Leader');
    expect(registerSource).toContain('LCVP');
    expect(registerSource).toContain('LCP');
    expect(registerSource).toContain('+{form.track === "MMB" ? 100 : 150} TND');
    expect(registerSource).toContain('INDEMNITY SIGNATURE');
    expect(registerSource).toContain('indemnityAccepted');
    expect(registerSource).not.toContain('Accommodation is 80 TND / per night.');
    expect(dataSource).toContain('name: "SU Bullaregia"');
    expect(registerSource).toContain('autoComplete="email" required');
    expect(registerSource).not.toContain('label>Nationality<select');
    expect(registerSource).toContain('<select required value={form.track}');
    expect(registerSource).toContain('form.track === "EB" ? ["LCVP", "LCP"]');
    expect(registerSource).toContain('form.track === "MMB" ? ["Manager", "Team Leader"]');
    expect(registerSource).toContain('<select required value={form.position}');
    expect(registerSource).toContain('<select required value={form.department}');
    expect(registerSource).toContain('placeholder="Write your department"');
    expect(registerSource).toContain('Error: registration not submitted.');
  });

  it("locks the public site to dark mode and removes the navigation toggle", () => {
    expect(appSource).toContain('defaultTheme="dark" switchable={false}');
    expect(headerSource).not.toContain("ThemeToggle");
  });
});
