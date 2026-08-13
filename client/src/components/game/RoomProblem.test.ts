import { describe, expect, it } from "vitest";
import { problemFromMessage } from "./RoomProblem";

describe("RoomProblem", () => {
  it("maps a duplicate-tab server rejection to the private-seat recovery view", () => {
    expect(problemFromMessage("This private seat is already active in another tab.")).toBe("duplicate");
  });

  it("maps an expiry error to the dedicated expired-Room view", () => {
    expect(problemFromMessage("Room expired after inactivity.")).toBe("expired");
  });
});
