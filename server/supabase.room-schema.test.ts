import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Supabase Room client contract", () => {
  it("uses RPC commands and Realtime rather than a server credential", async () => {
    const source = await readFile(new URL("../client/src/lib/supabaseRoom.ts", import.meta.url), "utf8");
    expect(source).toContain("supabase.rpc");
    expect(source).toContain("postgres_changes");
    expect(source).not.toContain("service_role");
  });
});
