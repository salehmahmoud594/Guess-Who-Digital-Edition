import { describe, expect, it } from "vitest";

describe("Supabase Room schema", () => {
  it("allows the server credential to read the Rooms table through HTTPS REST", async () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(url).toBeTruthy();
    expect(key).toBeTruthy();

    const response = await fetch(`${url}/rest/v1/rooms?select=id&limit=1`, {
      headers: {
        apikey: key!,
        Authorization: `Bearer ${key!}`,
      },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.any(Array));
  });
});
