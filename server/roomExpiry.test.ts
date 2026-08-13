import { describe, expect, it } from "vitest";
import { isRoomInactive, ROOM_INACTIVITY_TTL_MS } from "./roomService";

const now = new Date("2026-08-13T12:00:00.000Z");

describe("Room inactivity policy", () => {
  it("expires a playing room exactly after one hour without Room activity", () => {
    expect(isRoomInactive({ status: "playing", lastActivityAt: new Date(now.getTime() - ROOM_INACTIVITY_TTL_MS) }, now)).toBe(true);
    expect(isRoomInactive({ status: "playing", lastActivityAt: new Date(now.getTime() - ROOM_INACTIVITY_TTL_MS + 1) }, now)).toBe(false);
  });

  it("does not silently expire completed or already expired rooms", () => {
    const oldActivity = new Date(now.getTime() - ROOM_INACTIVITY_TTL_MS - 1);
    expect(isRoomInactive({ status: "finished", lastActivityAt: oldActivity }, now)).toBe(false);
    expect(isRoomInactive({ status: "expired", lastActivityAt: oldActivity }, now)).toBe(false);
  });
});
