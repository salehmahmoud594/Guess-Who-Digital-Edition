import type { Express, Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { expireInactiveRooms } from "./roomService";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

/** Registers the cron-only endpoint that silently closes inactive Room records. */
export function registerRoomCleanupRoute(app: Express) {
  app.post("/api/scheduled/room-cleanup", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: "cron-only" });
      }

      const result = await expireInactiveRooms();
      return res.json({ ok: true, ...result, timestamp: new Date().toISOString() });
    } catch (error) {
      return res.status(500).json({
        error: errorMessage(error),
        timestamp: new Date().toISOString(),
        context: { path: "/api/scheduled/room-cleanup" },
      });
    }
  });
}
