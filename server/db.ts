import type { InsertUser, Room, RoomSettings, Seat, SeatToken, User } from "../drizzle/schema";
import { ENV } from "./_core/env";

type JsonRecord = Record<string, unknown>;

type RoomCreate = Pick<Room, "roomCode" | "status" | "settings" | "deckIds" | "deckSeed" | "revision" | "lastActivityAt" | "expiresAt">;
type RoomPatch = Partial<Pick<Room, "status" | "settings" | "deckIds" | "deckSeed" | "activeSeat" | "winnerSeat" | "winReason" | "feedback" | "player1Score" | "player2Score" | "revision" | "lastActivityAt" | "expiresAt">>;
type SeatCreate = Pick<Seat, "roomId" | "seatNumber" | "playerName" | "eliminatedIds" | "hearts" | "ready" | "lastSeenAt">;
type SeatPatch = Partial<Pick<Seat, "secretCardId" | "eliminatedIds" | "hearts" | "ready" | "lastSeenAt">>;
type SeatTokenCreate = Pick<SeatToken, "tokenHash" | "roomId" | "seatNumber" | "tabId" | "lastUsedAt" | "expiresAt">;
type SeatTokenPatch = Partial<Pick<SeatToken, "lastUsedAt" | "expiresAt">>;

function missingConfiguration() {
  return !ENV.supabaseUrl || !ENV.supabaseServiceRoleKey;
}

function toIso(value: Date) {
  return value.toISOString();
}

function asDate(value: unknown) {
  return new Date(String(value));
}

function asNumber(value: unknown) {
  return Number(value);
}

function asNullableNumber(value: unknown) {
  return value === null || value === undefined ? null : Number(value);
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function mapRoom(row: JsonRecord): Room {
  return {
    id: asNumber(row.id),
    roomCode: String(row.room_code),
    status: String(row.status) as Room["status"],
    settings: (row.settings ?? {}) as RoomSettings,
    deckIds: asArray(row.deck_ids) as number[],
    deckSeed: String(row.deck_seed),
    activeSeat: asNullableNumber(row.active_seat),
    winnerSeat: asNullableNumber(row.winner_seat),
    winReason: (row.win_reason ?? null) as Room["winReason"],
    feedback: row.feedback === null || row.feedback === undefined ? null : String(row.feedback),
    player1Score: asNumber(row.player1_score),
    player2Score: asNumber(row.player2_score),
    revision: asNumber(row.revision),
    createdAt: asDate(row.created_at),
    lastActivityAt: asDate(row.last_activity_at),
    expiresAt: asDate(row.expires_at),
  };
}

function mapSeat(row: JsonRecord): Seat {
  return {
    id: asNumber(row.id),
    roomId: asNumber(row.room_id),
    seatNumber: asNumber(row.seat_number),
    playerName: String(row.player_name),
    secretCardId: asNullableNumber(row.secret_card_id),
    eliminatedIds: asArray(row.eliminated_ids) as number[],
    hearts: asNullableNumber(row.hearts),
    ready: Boolean(row.ready),
    lastSeenAt: asDate(row.last_seen_at),
    createdAt: asDate(row.created_at),
  };
}

function mapSeatToken(row: JsonRecord): SeatToken {
  return {
    id: asNumber(row.id),
    tokenHash: String(row.token_hash),
    roomId: asNumber(row.room_id),
    seatNumber: asNumber(row.seat_number),
    tabId: String(row.tab_id),
    createdAt: asDate(row.created_at),
    lastUsedAt: asDate(row.last_used_at),
    expiresAt: asDate(row.expires_at),
  };
}

function mapUser(row: JsonRecord): User {
  return {
    id: asNumber(row.id),
    openId: String(row.open_id),
    name: row.name === null || row.name === undefined ? null : String(row.name),
    email: row.email === null || row.email === undefined ? null : String(row.email),
    loginMethod: row.login_method === null || row.login_method === undefined ? null : String(row.login_method),
    role: String(row.role) as User["role"],
    createdAt: asDate(row.created_at),
    updatedAt: asDate(row.updated_at),
    lastSignedIn: asDate(row.last_signed_in),
  };
}

function queryString(query?: Record<string, string>) {
  if (!query) return "";
  const parameters = new URLSearchParams(query);
  return parameters.size > 0 ? `?${parameters.toString()}` : "";
}

async function request<T>(path: string, options: { method?: "GET" | "POST" | "PATCH"; query?: Record<string, string>; body?: JsonRecord; prefer?: string } = {}): Promise<T> {
  if (missingConfiguration()) throw new Error("Supabase REST is not configured on the server.");
  const response = await fetch(`${ENV.supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}${queryString(options.query)}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: ENV.supabaseServiceRoleKey,
      Authorization: `Bearer ${ENV.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase REST ${response.status}: ${detail}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function roomPayload(values: RoomCreate | RoomPatch): JsonRecord {
  const payload: JsonRecord = {};
  if ("roomCode" in values) payload.room_code = values.roomCode;
  if (values.status !== undefined) payload.status = values.status;
  if (values.settings !== undefined) payload.settings = values.settings;
  if (values.deckIds !== undefined) payload.deck_ids = values.deckIds;
  if (values.deckSeed !== undefined) payload.deck_seed = values.deckSeed;
  if ("activeSeat" in values && values.activeSeat !== undefined) payload.active_seat = values.activeSeat;
  if ("winnerSeat" in values && values.winnerSeat !== undefined) payload.winner_seat = values.winnerSeat;
  if ("winReason" in values && values.winReason !== undefined) payload.win_reason = values.winReason;
  if ("feedback" in values && values.feedback !== undefined) payload.feedback = values.feedback;
  if ("player1Score" in values && values.player1Score !== undefined) payload.player1_score = values.player1Score;
  if ("player2Score" in values && values.player2Score !== undefined) payload.player2_score = values.player2Score;
  if (values.revision !== undefined) payload.revision = values.revision;
  if (values.lastActivityAt !== undefined) payload.last_activity_at = toIso(values.lastActivityAt);
  if (values.expiresAt !== undefined) payload.expires_at = toIso(values.expiresAt);
  return payload;
}

function seatPayload(values: SeatCreate | SeatPatch): JsonRecord {
  const payload: JsonRecord = {};
  if ("roomId" in values) payload.room_id = values.roomId;
  if ("seatNumber" in values) payload.seat_number = values.seatNumber;
  if ("playerName" in values) payload.player_name = values.playerName;
  if ("secretCardId" in values && values.secretCardId !== undefined) payload.secret_card_id = values.secretCardId;
  if (values.eliminatedIds !== undefined) payload.eliminated_ids = values.eliminatedIds;
  if (values.hearts !== undefined) payload.hearts = values.hearts;
  if (values.ready !== undefined) payload.ready = values.ready;
  if (values.lastSeenAt !== undefined) payload.last_seen_at = toIso(values.lastSeenAt);
  return payload;
}

function seatTokenPayload(values: SeatTokenCreate | SeatTokenPatch): JsonRecord {
  const payload: JsonRecord = {};
  if ("tokenHash" in values) payload.token_hash = values.tokenHash;
  if ("roomId" in values) payload.room_id = values.roomId;
  if ("seatNumber" in values) payload.seat_number = values.seatNumber;
  if ("tabId" in values) payload.tab_id = values.tabId;
  if (values.lastUsedAt !== undefined) payload.last_used_at = toIso(values.lastUsedAt);
  if (values.expiresAt !== undefined) payload.expires_at = toIso(values.expiresAt);
  return payload;
}

export function isRoomStoreAvailable() {
  return !missingConfiguration();
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const payload: JsonRecord = {
    open_id: user.openId,
    last_signed_in: toIso(user.lastSignedIn ?? new Date()),
  };
  if (user.name !== undefined) payload.name = user.name;
  if (user.email !== undefined) payload.email = user.email;
  if (user.loginMethod !== undefined) payload.login_method = user.loginMethod;
  if (user.role !== undefined) payload.role = user.role;
  await request("users", { method: "POST", query: { on_conflict: "open_id" }, body: payload, prefer: "resolution=merge-duplicates,return=minimal" });
}

export async function getUserByOpenId(openId: string) {
  const rows = await request<JsonRecord[]>("users", { query: { select: "*", open_id: `eq.${openId}`, limit: "1" } });
  return rows[0] ? mapUser(rows[0]) : undefined;
}

export async function createRoom(values: RoomCreate) {
  const rows = await request<JsonRecord[]>("rooms", { method: "POST", body: roomPayload(values), prefer: "return=representation" });
  if (!rows[0]) throw new Error("Supabase did not return the created room.");
  return mapRoom(rows[0]);
}

export async function updateRoom(roomId: number, values: RoomPatch) {
  await request<JsonRecord[]>("rooms", { method: "PATCH", query: { id: `eq.${roomId}` }, body: roomPayload(values), prefer: "return=minimal" });
}

export async function createSeat(values: SeatCreate) {
  const rows = await request<JsonRecord[]>("seats", { method: "POST", body: seatPayload(values), prefer: "return=representation" });
  if (!rows[0]) throw new Error("Supabase did not return the created seat.");
  return mapSeat(rows[0]);
}

export async function updateSeat(seatId: number, values: SeatPatch) {
  await request<JsonRecord[]>("seats", { method: "PATCH", query: { id: `eq.${seatId}` }, body: seatPayload(values), prefer: "return=minimal" });
}

export async function createSeatToken(values: SeatTokenCreate) {
  const rows = await request<JsonRecord[]>("seat_tokens", { method: "POST", body: seatTokenPayload(values), prefer: "return=representation" });
  if (!rows[0]) throw new Error("Supabase did not return the created seat token.");
  return mapSeatToken(rows[0]);
}

export async function updateSeatToken(tokenId: number, values: SeatTokenPatch) {
  await request<JsonRecord[]>("seat_tokens", { method: "PATCH", query: { id: `eq.${tokenId}` }, body: seatTokenPayload(values), prefer: "return=minimal" });
}

export async function getRoomByCode(roomCode: string) {
  const rows = await request<JsonRecord[]>("rooms", { query: { select: "*", room_code: `eq.${roomCode}`, limit: "1" } });
  return rows[0] ? mapRoom(rows[0]) : undefined;
}

export async function getRoomSeats(roomId: number) {
  const rows = await request<JsonRecord[]>("seats", { query: { select: "*", room_id: `eq.${roomId}`, order: "seat_number.asc" } });
  return rows.map(mapSeat);
}

export async function getRoomSeat(roomId: number, seatNumber: number) {
  const rows = await request<JsonRecord[]>("seats", { query: { select: "*", room_id: `eq.${roomId}`, seat_number: `eq.${seatNumber}`, limit: "1" } });
  return rows[0] ? mapSeat(rows[0]) : undefined;
}

export async function getSeatToken(tokenHash: string) {
  const rows = await request<JsonRecord[]>("seat_tokens", { query: { select: "*", token_hash: `eq.${tokenHash}`, limit: "1" } });
  return rows[0] ? mapSeatToken(rows[0]) : undefined;
}
