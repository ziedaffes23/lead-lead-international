import { describe, expect, it } from "vitest";

describe("application title configuration", () => {
  it("is accepted by the lightweight application endpoint", async () => {
    const title = process.env.VITE_APP_TITLE;
    expect(title).toBeTruthy();

    const response = await fetch("http://127.0.0.1:3000/", {
      headers: { "x-app-title": title ?? "" },
    });

    expect(response.status).toBeLessThan(500);
  });
});
