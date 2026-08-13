import { createHash, randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { GAME_ITEMS } from "../client/src/data/gameItems";
import type { Room, RoomCategory, RoomHeartOption, RoomSettings, Seat } from "../drizzle/schema";
import { createRoom as createRoomRecord, createSeat, createSeatToken, getRoomByCode, getRoomSeat, getRoomSeats, getSeatToken, isRoomStoreAvailable, updateRoom, updateSeat, updateSeatToken } from "./db";

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const WAITING_TTL_MS = 30 * 60 * 1000;
const ACTIVE_TTL_MS = 90 * 60 * 1000;
const TOKEN_TTL_MS = 6 * 60 * 60 * 1000;
const ONLINE_WINDOW_MS = 12 * 1000;

export type RoomSnapshot = {
  roomCode: string;
  status: Room["status"];
  settings: RoomSettings;
  deckIds: number[];
  activeSeat: number | null;
  winnerSeat: number | null;
  winReason: Room["winReason"];
  feedback: string | null;
  scores: { 1: number; 2: number };
  revision: number;
  expiresAt: Date;
  you: {
    seatNumber: number;
    playerName: string;
    ready: boolean;
    secretCardId: number | null;
    eliminatedIds: number[];
    hearts: number | null;
  };
  opponent: {
    seatNumber: number | null;
    playerName: string | null;
    ready: boolean;
    secretChosen: boolean;
    isConnected: boolean;
  };
};

type SessionInput = { roomCode: string; seatToken: string; tabId: string };
type CommandResult = { applied: boolean; snapshot: RoomSnapshot };

function fail(code: TRPCError["code"], message: string): never {
  throw new TRPCError({ code, message });
}

function normalizedCode(code: string) {
  return code.trim().toUpperCase();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function makeRoomCode() {
  return Array.from({ length: 6 }, () => ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]).join("");
}

function makeToken() {
  return randomBytes(32).toString("base64url");
}

function deckFor(category: RoomCategory) {
  const pool = GAME_ITEMS.filter(item => item.category === category && item.artStatus === "generated");
  if (pool.length < 24) fail("BAD_REQUEST", "This card category is not ready for Room play yet.");
  const copy = [...pool];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy.slice(0, 24).map(item => item.id);
}

function startingHearts(option: RoomHeartOption) {
  return option === "unlimited" ? null : option;
}

function expiryFor(status: Room["status"], timestamp: Date) {
  return new Date(timestamp.getTime() + (status === "waiting" ? WAITING_TTL_MS : ACTIVE_TTL_MS));
}

function toIds(value: unknown) {
  return Array.isArray(value) ? value.filter((id): id is number => typeof id === "number") : [];
}

async function findRoomOrFail(roomCode: string) {
  const room = await getRoomByCode(normalizedCode(roomCode));
  if (!room) fail("NOT_FOUND", "Room not found. Check the six-character code and try again.");

  if (room.status !== "expired" && room.expiresAt.getTime() <= Date.now()) {
    const now = new Date();
    await updateRoom(room.id, { status: "expired", activeSeat: null, feedback: "This room has expired.", revision: room.revision + 1, lastActivityAt: now });
    return { ...room, status: "expired" as const, activeSeat: null, feedback: "This room has expired.", revision: room.revision + 1, lastActivityAt: now };
  }
  return room;
}

async function authorizeSession(input: SessionInput) {
  const room = await findRoomOrFail(input.roomCode);
  const token = await getSeatToken(hashToken(input.seatToken));
  if (!token || token.roomId !== room.id || token.expiresAt.getTime() <= Date.now()) {
    fail("UNAUTHORIZED", "Your room seat has expired. Join a new room to continue.");
  }
  if (token.tabId !== input.tabId) {
    fail("CONFLICT", "This seat is active in another tab. Return to the original tab to continue.");
  }
  const seat = await getRoomSeat(room.id, token.seatNumber);
  if (!seat) fail("UNAUTHORIZED", "This room seat is no longer available.");
  return { room, seat, token };
}

export function projectSnapshot(room: Room, allSeats: Seat[], viewerSeat: Seat): RoomSnapshot {
  const opponent = allSeats.find(seat => seat.seatNumber !== viewerSeat.seatNumber);
  return {
    roomCode: room.roomCode,
    status: room.status,
    settings: room.settings,
    deckIds: toIds(room.deckIds),
    activeSeat: room.activeSeat,
    winnerSeat: room.winnerSeat,
    winReason: room.winReason,
    feedback: room.feedback,
    scores: { 1: room.player1Score, 2: room.player2Score },
    revision: room.revision,
    expiresAt: room.expiresAt,
    you: {
      seatNumber: viewerSeat.seatNumber,
      playerName: viewerSeat.playerName,
      ready: viewerSeat.ready,
      secretCardId: viewerSeat.secretCardId,
      eliminatedIds: toIds(viewerSeat.eliminatedIds),
      hearts: viewerSeat.hearts,
    },
    opponent: {
      seatNumber: opponent?.seatNumber ?? null,
      playerName: opponent?.playerName ?? null,
      ready: opponent?.ready ?? false,
      secretChosen: opponent?.secretCardId != null,
      isConnected: opponent ? opponent.lastSeenAt.getTime() > Date.now() - ONLINE_WINDOW_MS : false,
    },
  };
}

async function currentSnapshot(roomCode: string, seatNumber: number) {
  const room = await findRoomOrFail(roomCode);
  const allSeats = await getRoomSeats(room.id);
  const viewerSeat = allSeats.find(seat => seat.seatNumber === seatNumber);
  if (!viewerSeat) fail("UNAUTHORIZED", "This room seat is no longer available.");
  return projectSnapshot(room, allSeats, viewerSeat);
}

async function touchSession(room: Room, seat: Seat, tokenId: number) {
  const now = new Date();
  await Promise.all([updateSeat(seat.id, { lastSeenAt: now }), updateSeatToken(tokenId, { lastUsedAt: now })]);
  if (room.status !== "waiting" && room.status !== "expired" && room.status !== "finished") {
    await updateRoom(room.id, { lastActivityAt: now, expiresAt: expiryFor(room.status, now) });
  }
}

async function issueSeatToken(roomId: number, seatNumber: number, tabId: string) {
  const rawToken = makeToken();
  const now = new Date();
  await createSeatToken({
    tokenHash: hashToken(rawToken),
    roomId,
    seatNumber,
    tabId,
    lastUsedAt: now,
    expiresAt: new Date(now.getTime() + TOKEN_TTL_MS),
  });
  return rawToken;
}

async function commandSnapshot(roomCode: string, seatNumber: number, applied: boolean): Promise<CommandResult> {
  return { applied, snapshot: await currentSnapshot(roomCode, seatNumber) };
}

export async function createRoom(input: { playerName: string; category: RoomCategory; heartOption: RoomHeartOption; tabId: string }) {
  if (!isRoomStoreAvailable()) fail("INTERNAL_SERVER_ERROR", "Room service is temporarily unavailable.");

  const now = new Date();
  const settings: RoomSettings = { category: input.category, heartOption: input.heartOption, turnMode: "classic" };
  const deckIds = deckFor(input.category);
  let room: Room | undefined;

  for (let attempt = 0; attempt < 8 && !room; attempt += 1) {
    const roomCode = makeRoomCode();
    try {
      room = await createRoomRecord({
        roomCode,
        status: "waiting",
        settings,
        deckIds,
        deckSeed: randomBytes(16).toString("hex"),
        revision: 1,
        lastActivityAt: now,
        expiresAt: expiryFor("waiting", now),
      });
      await createSeat({
        roomId: room.id,
        seatNumber: 1,
        playerName: input.playerName.trim(),
        eliminatedIds: [],
        hearts: startingHearts(input.heartOption),
        ready: false,
        lastSeenAt: now,
      });
    } catch (error) {
      room = undefined;
      if (attempt === 7) throw error;
    }
  }

  if (!room) fail("INTERNAL_SERVER_ERROR", "Could not create a room. Please try again.");
  const seatToken = await issueSeatToken(room.id, 1, input.tabId);
  return { roomCode: room.roomCode, seatNumber: 1 as const, seatToken, snapshot: await currentSnapshot(room.roomCode, 1) };
}

export async function joinRoom(input: { roomCode: string; playerName: string; tabId: string }) {
  const room = await findRoomOrFail(input.roomCode);
  if (room.status !== "waiting" && room.status !== "setup") fail("CONFLICT", "This game has already started.");
  const existingSeats = await getRoomSeats(room.id);
  if (existingSeats.some(seat => seat.seatNumber === 2)) fail("CONFLICT", "This room already has two players.");

  const now = new Date();
  await createSeat({
    roomId: room.id,
    seatNumber: 2,
    playerName: input.playerName.trim(),
    eliminatedIds: [],
    hearts: startingHearts(room.settings.heartOption),
    ready: false,
    lastSeenAt: now,
  });
  await updateRoom(room.id, { status: "setup", revision: room.revision + 1, lastActivityAt: now, expiresAt: expiryFor("setup", now) });

  const seatToken = await issueSeatToken(room.id, 2, input.tabId);
  return { roomCode: room.roomCode, seatNumber: 2 as const, seatToken, snapshot: await currentSnapshot(room.roomCode, 2) };
}

export async function getSnapshot(input: SessionInput) {
  const { room, seat, token } = await authorizeSession(input);
  await touchSession(room, seat, token.id);
  return currentSnapshot(room.roomCode, seat.seatNumber);
}

export async function reconnect(input: SessionInput) {
  return getSnapshot(input);
}

export async function setReady(input: SessionInput & { ready: boolean; expectedRevision?: number }) {
  const { room, seat } = await authorizeSession(input);
  if (room.status !== "waiting" && room.status !== "setup") fail("CONFLICT", "Ready state can no longer be changed.");

  const now = new Date();
  await updateSeat(seat.id, { ready: input.ready, lastSeenAt: now });
  const updatedSeats = await getRoomSeats(room.id);
  const nextStatus = updatedSeats.length === 2 && updatedSeats.every(player => player.ready) ? "secret_selection" : updatedSeats.length === 2 ? "setup" : "waiting";
  await updateRoom(room.id, { status: nextStatus, revision: room.revision + 1, lastActivityAt: now, expiresAt: expiryFor(nextStatus, now) });
  return commandSnapshot(room.roomCode, seat.seatNumber, true);
}

export async function selectSecret(input: SessionInput & { cardId: number; expectedRevision?: number }) {
  const { room, seat } = await authorizeSession(input);
  if (room.status !== "secret_selection") fail("CONFLICT", "Secret selection is not open yet.");
  if (!toIds(room.deckIds).includes(input.cardId)) fail("BAD_REQUEST", "Choose a card from this room's deck.");
  if (seat.secretCardId !== null && seat.secretCardId !== input.cardId) fail("CONFLICT", "Your secret is already locked in.");

  const now = new Date();
  await updateSeat(seat.id, { secretCardId: input.cardId, lastSeenAt: now });
  const updatedSeats = await getRoomSeats(room.id);
  const everySecretSelected = updatedSeats.length === 2 && updatedSeats.every(player => player.secretCardId !== null);
  await updateRoom(room.id, {
    status: everySecretSelected ? "playing" : "secret_selection",
    activeSeat: everySecretSelected ? 1 : null,
    revision: room.revision + 1,
    lastActivityAt: now,
    expiresAt: expiryFor(everySecretSelected ? "playing" : "secret_selection", now),
  });
  return commandSnapshot(room.roomCode, seat.seatNumber, true);
}

export async function toggleElimination(input: SessionInput & { cardId: number; expectedRevision?: number }) {
  const { room, seat } = await authorizeSession(input);
  if (room.status !== "playing" || room.activeSeat !== seat.seatNumber) fail("FORBIDDEN", "Wait for your turn before changing your board.");
  if (!toIds(room.deckIds).includes(input.cardId)) fail("BAD_REQUEST", "Choose a card from this room's deck.");

  const eliminatedIds = toIds(seat.eliminatedIds);
  const nextIds = eliminatedIds.includes(input.cardId) ? eliminatedIds.filter(id => id !== input.cardId) : [...eliminatedIds, input.cardId];
  const now = new Date();
  await updateSeat(seat.id, { eliminatedIds: nextIds, lastSeenAt: now });
  await updateRoom(room.id, { revision: room.revision + 1, lastActivityAt: now, expiresAt: expiryFor("playing", now) });
  return commandSnapshot(room.roomCode, seat.seatNumber, true);
}

export async function endTurn(input: SessionInput & { expectedRevision?: number }) {
  const { room, seat } = await authorizeSession(input);
  if (room.status !== "playing" || room.activeSeat !== seat.seatNumber) fail("FORBIDDEN", "Wait for your turn before ending it.");

  const now = new Date();
  const nextSeat = seat.seatNumber === 1 ? 2 : 1;
  await updateRoom(room.id, { activeSeat: nextSeat, feedback: `${seat.playerName} passed the turn.`, revision: room.revision + 1, lastActivityAt: now, expiresAt: expiryFor("playing", now) });
  return commandSnapshot(room.roomCode, seat.seatNumber, true);
}

export async function submitGuess(input: SessionInput & { cardId: number; expectedRevision?: number }) {
  const { room, seat } = await authorizeSession(input);
  if (room.status !== "playing" || room.activeSeat !== seat.seatNumber) fail("FORBIDDEN", "Wait for your turn before making a final guess.");
  if (!toIds(room.deckIds).includes(input.cardId)) fail("BAD_REQUEST", "Choose a card from this room's deck.");

  const allSeats = await getRoomSeats(room.id);
  const opponent = allSeats.find(player => player.seatNumber !== seat.seatNumber);
  if (!opponent || opponent.secretCardId === null) fail("CONFLICT", "The other player has not locked in a secret yet.");
  const now = new Date();

  if (input.cardId === opponent.secretCardId) {
    await updateRoom(room.id, {
      status: "finished",
      activeSeat: null,
      winnerSeat: seat.seatNumber,
      winReason: "guess",
      feedback: `${seat.playerName} guessed the secret!`,
      player1Score: room.player1Score + (seat.seatNumber === 1 ? 1 : 0),
      player2Score: room.player2Score + (seat.seatNumber === 2 ? 1 : 0),
      revision: room.revision + 1,
      lastActivityAt: now,
      expiresAt: expiryFor("finished", now),
    });
    return commandSnapshot(room.roomCode, seat.seatNumber, true);
  }

  const nextSeat = seat.seatNumber === 1 ? 2 : 1;
  if (room.settings.heartOption === "unlimited") {
    await updateRoom(room.id, { feedback: "Not quite. No heart lost — the turn passes on.", activeSeat: nextSeat, revision: room.revision + 1, lastActivityAt: now, expiresAt: expiryFor("playing", now) });
    return commandSnapshot(room.roomCode, seat.seatNumber, true);
  }

  const remainingHearts = Math.max(0, (seat.hearts ?? 0) - 1);
  await updateSeat(seat.id, { hearts: remainingHearts, lastSeenAt: now });
  const hasLost = remainingHearts === 0;
  await updateRoom(room.id, {
    status: hasLost ? "finished" : "playing",
    activeSeat: hasLost ? null : nextSeat,
    winnerSeat: hasLost ? nextSeat : null,
    winReason: hasLost ? "hearts" : null,
    feedback: hasLost ? `${seat.playerName} ran out of hearts.` : `${seat.playerName} lost one heart. The turn passes on.`,
    player1Score: room.player1Score + (hasLost && nextSeat === 1 ? 1 : 0),
    player2Score: room.player2Score + (hasLost && nextSeat === 2 ? 1 : 0),
    revision: room.revision + 1,
    lastActivityAt: now,
    expiresAt: expiryFor(hasLost ? "finished" : "playing", now),
  });
  return commandSnapshot(room.roomCode, seat.seatNumber, true);
}

export async function startRematch(input: SessionInput & { expectedRevision?: number }) {
  const { room, seat } = await authorizeSession(input);
  if (seat.seatNumber !== 1) fail("FORBIDDEN", "Only the room host can start a rematch.");
  if (room.status !== "finished") fail("CONFLICT", "A rematch is available after the round ends.");
  const allSeats = await getRoomSeats(room.id);
  if (allSeats.length !== 2) fail("CONFLICT", "A rematch needs both players to remain in the room.");

  const now = new Date();
  const hearts = startingHearts(room.settings.heartOption);
  await Promise.all(allSeats.map(player => updateSeat(player.id, { secretCardId: null, eliminatedIds: [], hearts, ready: true, lastSeenAt: now })));
  await updateRoom(room.id, {
    status: "secret_selection",
    deckIds: deckFor(room.settings.category),
    deckSeed: randomBytes(16).toString("hex"),
    activeSeat: null,
    winnerSeat: null,
    winReason: null,
    feedback: null,
    revision: room.revision + 1,
    lastActivityAt: now,
    expiresAt: expiryFor("secret_selection", now),
  });
  return commandSnapshot(room.roomCode, seat.seatNumber, true);
}
