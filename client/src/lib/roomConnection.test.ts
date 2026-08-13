import { describe, expect, it } from "vitest";
import { getRoomConnectionState } from "./roomConnection";

describe("getRoomConnectionState", () => {
  it("prioritizes an explicit offline browser state", () => {
    expect(getRoomConnectionState({ isOnline: false })).toBe("offline");
    expect(getRoomConnectionState({ isOnline: false, hasSyncIssue: true })).toBe("offline");
  });

  it("identifies a recoverable online synchronization problem", () => {
    expect(getRoomConnectionState({ isOnline: true, hasSyncIssue: true })).toBe("reconnecting");
    expect(getRoomConnectionState({ isOnline: true })).toBe("online");
  });
});
