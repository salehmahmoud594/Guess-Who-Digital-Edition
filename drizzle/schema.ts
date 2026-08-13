import { boolean, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type RoomCategory = "animals" | "fictional_characters" | "cartoon_characters" | "egyptian_movies" | "cartoon_movies" | "emojis";
export type RoomHeartOption = 1 | 3 | 5 | "unlimited";
export type RoomSettings = {
  category: RoomCategory;
  heartOption: RoomHeartOption;
  turnMode: "classic";
};

export const rooms = mysqlTable(
  "rooms",
  {
    id: int("id").autoincrement().primaryKey(),
    roomCode: varchar("roomCode", { length: 6 }).notNull(),
    status: mysqlEnum("status", ["waiting", "setup", "secret_selection", "playing", "finished", "expired"]).notNull().default("waiting"),
    settings: json("settings").$type<RoomSettings>().notNull(),
    deckIds: json("deckIds").$type<number[]>().notNull(),
    deckSeed: varchar("deckSeed", { length: 64 }).notNull(),
    activeSeat: int("activeSeat"),
    winnerSeat: int("winnerSeat"),
    winReason: mysqlEnum("winReason", ["guess", "hearts"]),
    feedback: varchar("feedback", { length: 255 }),
    player1Score: int("player1Score").notNull().default(0),
    player2Score: int("player2Score").notNull().default(0),
    revision: int("revision").notNull().default(1),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
  },
  table => [
    uniqueIndex("rooms_room_code_unique").on(table.roomCode),
    index("rooms_status_activity_idx").on(table.status, table.lastActivityAt),
  ],
);

export const seats = mysqlTable(
  "seats",
  {
    id: int("id").autoincrement().primaryKey(),
    roomId: int("roomId").notNull(),
    seatNumber: int("seatNumber").notNull(),
    playerName: varchar("playerName", { length: 32 }).notNull(),
    secretCardId: int("secretCardId"),
    eliminatedIds: json("eliminatedIds").$type<number[]>().notNull(),
    hearts: int("hearts"),
    ready: boolean("ready").notNull().default(false),
    lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("seats_room_seat_unique").on(table.roomId, table.seatNumber),
    index("seats_room_idx").on(table.roomId),
  ],
);

export const seatTokens = mysqlTable(
  "seat_tokens",
  {
    id: int("id").autoincrement().primaryKey(),
    tokenHash: varchar("tokenHash", { length: 64 }).notNull(),
    roomId: int("roomId").notNull(),
    seatNumber: int("seatNumber").notNull(),
    tabId: varchar("tabId", { length: 128 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    lastUsedAt: timestamp("lastUsedAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
  },
  table => [
    uniqueIndex("seat_tokens_hash_unique").on(table.tokenHash),
    index("seat_tokens_room_seat_idx").on(table.roomId, table.seatNumber),
  ],
);

export type Room = typeof rooms.$inferSelect;
export type Seat = typeof seats.$inferSelect;
export type SeatToken = typeof seatTokens.$inferSelect;
