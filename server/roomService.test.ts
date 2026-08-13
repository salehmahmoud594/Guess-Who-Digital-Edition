import { describe, expect, it } from "vitest";
import type { Room, Seat } from "../drizzle/schema";
import { projectSnapshot } from "./roomService";

const now = new Date("2026-08-13T10:00:00.000Z");

const room: Room = {
  id: 1,
  roomCode: "ABCD23",
  status: "playing",
  settings: { category: "animals", heartOption: 3, turnMode: "classic" },
  deckIds: [1, 2, 3, 4],
  deckSeed: "safe-seed",
  activeSeat: 1,
  winnerSeat: null,
  winReason: null,
  feedback: null,
  player1Score: 0,
  player2Score: 0,
  revision: 7,
  createdAt: now,
  lastActivityAt: now,
  expiresAt: new Date("2026-08-13T11:30:00.000Z"),
};

const playerOne: Seat = {
  id: 11,
  roomId: 1,
  seatNumber: 1,
  playerName: "Mina",
  secretCardId: 2,
  eliminatedIds: [1, 3],
  hearts: 2,
  ready: true,
  lastSeenAt: now,
  createdAt: now,
};

const playerTwo: Seat = {
  id: 12,
  roomId: 1,
  seatNumber: 2,
  playerName: "Omar",
  secretCardId: 4,
  eliminatedIds: [2],
  hearts: 1,
  ready: true,
  lastSeenAt: now,
  createdAt: now,
};

describe("Room privacy projection", () => {
  it("returns only the viewer's secret, board state, and hearts", () => {
    const snapshot = projectSnapshot(room, [playerOne, playerTwo], playerOne);

    expect(snapshot.you).toEqual({
      seatNumber: 1,
      playerName: "Mina",
      ready: true,
      secretCardId: 2,
      eliminatedIds: [1, 3],
      hearts: 2,
    });
    expect(snapshot.opponent).toEqual({
      seatNumber: 2,
      playerName: "Omar",
      ready: true,
      secretChosen: true,
      isConnected: false,
    });
    expect(JSON.stringify(snapshot)).not.toContain('"secretCardId":4');
    expect(JSON.stringify(snapshot)).not.toContain('"eliminatedIds":[2]');
    expect(JSON.stringify(snapshot)).not.toContain('"hearts":1');
  });
});
