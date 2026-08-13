import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Supabase browser connection", () => {
  it("uses the public Vite configuration and anonymous player identity", async () => {
    expect(process.env.VITE_SUPABASE_URL).toMatch(/^https:\/\/[^/]+\.supabase\.co$/);
    expect(process.env.VITE_SUPABASE_PUBLISHABLE_KEY).toBeTruthy();

    const source = await readFile(new URL("../client/src/lib/supabase.ts", import.meta.url), "utf8");
    expect(source).toContain("signInAnonymously");
    expect(source).not.toContain("SERVICE_ROLE");
  });
});
