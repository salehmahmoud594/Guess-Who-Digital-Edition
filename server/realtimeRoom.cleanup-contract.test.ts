import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.resolve(
  currentDirectory,
  "../supabase/migrations/20260813_realtime_room_rebuild.sql",
);

async function readMigration() {
  return readFile(migrationPath, "utf8");
}

describe("Supabase Room inactivity cleanup contract", () => {
  it("expires only stale active lifecycle states after one hour", async () => {
    const sql = await readMigration();

    expect(sql).toContain(
      "room_expire_stale(p_cutoff timestamptz default now() - interval '1 hour')",
    );
    expect(sql).toContain("status in ('waiting', 'setup', 'secret_selection', 'playing')");
    expect(sql).toContain("and last_activity_at <= p_cutoff");
    expect(sql).toContain("set status = 'expired'");
    expect(sql).not.toContain("status in ('waiting', 'setup', 'secret_selection', 'playing', 'finished')");
  });

  it("is idempotent because already-expired records do not match a later run", async () => {
    const sql = await readMigration();

    expect(sql).toContain("set status = 'expired'");
    expect(sql).toContain("revision = revision + 1");
    expect(sql).toContain("status in ('waiting', 'setup', 'secret_selection', 'playing')");
    expect(sql).not.toContain("status in ('waiting', 'setup', 'secret_selection', 'playing', 'expired')");
  });

  it("registers the database-owned cleanup command every ten minutes", async () => {
    const sql = await readMigration();

    expect(sql).toContain("cron.schedule('room-inactivity-cleanup', '*/10 * * * *', 'select public.room_expire_stale();')");
    expect(sql).toContain("perform cron.unschedule(v_job_id)");
  });
});
