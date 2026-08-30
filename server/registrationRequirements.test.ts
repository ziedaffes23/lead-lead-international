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
    expect(registerSource).toContain('placeholder="Enter your passport number" required');
    expect(registerSource).not.toContain('inputMode="numeric"');
    expect(registerSource).not.toContain('CIN number must contain digits only.');
    expect(registerSource).not.toContain('Select your LC');
    expect(registerSource).toContain('Country code<select value={form.phoneCountry}');
    expect(registerSource).toContain('inputMode="tel" required');
    expect(registerSource).not.toContain('maxLength={8}');
    expect(registerSource).not.toContain('pattern="[0-9]{8}"');
    expect(registerSource).not.toContain('Phone number must contain exactly 8 digits.');
    expect(registerSource).toContain('Passport document');
    expect(registerSource).toContain('accept="image/jpeg,image/png,application/pdf,.pdf" required');
    expect(registerSource).toContain('accept="image/jpeg,image/png,image/webp" required');
    expect(registerSource).toContain('accept="application/pdf,.pdf" required');
    expect(registerSource).toContain('placeholder="List allergies or dietary concerns, or enter None" required');
    expect(registerSource).toContain('placeholder="Add a note for the organising team, or enter None" required');
    expect(registerSource).toContain('Participant type');
    expect(registerSource).toContain('International AIESECer');
    expect(registerSource).toContain('<option>EP</option>');
    expect(registerSource).toContain('Country of origin');
    expect(registerSource).toContain('form.track === "International AIESECer"');
    expect(registerSource).toContain('form.track === "EP"');
    expect(registerSource).toContain('+60 EUR');
    expect(registerSource).toContain('INDEMNITY SIGNATURE');
    expect(registerSource).toContain('indemnityAccepted');
    expect(registerSource).not.toContain('Accommodation is 80 TND / per night.');
    expect(dataSource).toContain('name: "SU Bullaregia"');
    expect(registerSource).toContain('autoComplete="email" required');
    expect(registerSource).not.toContain('label>Nationality<select');
    expect(registerSource).toContain('<select required value={form.track}');
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
