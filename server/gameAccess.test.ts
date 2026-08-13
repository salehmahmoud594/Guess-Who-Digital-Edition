import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Supabase game-access gate", () => {
  it("keeps the password lookup in the Edge Function and grants only a time-limited access record", async () => {
    const source = await readFile(new URL("../supabase/functions/verify-game-access/index.ts", import.meta.url), "utf8");
    expect(source).toContain('Deno.env.get("GAME_ACCESS_PASSWORD")');
    expect(source).toContain("game_access_grants");
    expect(source).toContain("expires_at");
    expect(source).not.toContain("password: password");
  });
});
