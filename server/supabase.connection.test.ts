import { describe, expect, it } from "vitest";

describe("Supabase connection", () => {
  it("accepts the configured server credential without exposing it", async () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(url).toBeTruthy();
    expect(key).toBeTruthy();

    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        apikey: key!,
        Authorization: `Bearer ${key!}`,
      },
    });

    expect(response.status).toBe(200);
  });
});
