import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { gameAccessProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as roomService from "./roomService";
import { grantGameAccess, hasValidGameAccess, revokeGameAccess, verifyGameAccessPassword } from "./gameAccess";

const roomCodeSchema = z.string().trim().toUpperCase().regex(/^[A-HJ-NP-Z2-9]{6}$/, "Enter a valid six-character room code.");
const playerNameSchema = z.string().trim().min(1, "Enter a player name.").max(32);
const tabIdSchema = z.string().min(16).max(128);
const seatTokenSchema = z.string().min(24).max(128);
const sessionSchema = z.object({ roomCode: roomCodeSchema, seatToken: seatTokenSchema, tabId: tabIdSchema });
const commandSchema = sessionSchema.extend({ expectedRevision: z.number().int().positive().optional() });
const categorySchema = z.enum(["animals", "fictional_characters", "cartoon_characters", "egyptian_movies", "cartoon_movies", "emojis"]);
const heartOptionSchema = z.union([z.literal(1), z.literal(3), z.literal(5), z.literal("unlimited")]);

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  gameAccess: router({
    status: publicProcedure.query(({ ctx }) => ({ granted: hasValidGameAccess(ctx.req) })),
    unlock: publicProcedure.input(z.object({ password: z.string().min(1).max(256) })).mutation(({ ctx, input }) => {
      if (!verifyGameAccessPassword(input.password)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "The game password is incorrect." });
      }
      return grantGameAccess(ctx.req, ctx.res);
    }),
    logout: publicProcedure.mutation(({ ctx }) => revokeGameAccess(ctx.req, ctx.res)),
  }),

  room: router({
    createRoom: gameAccessProcedure
      .input(z.object({ playerName: playerNameSchema, category: categorySchema, heartOption: heartOptionSchema, tabId: tabIdSchema }))
      .mutation(({ input }) => roomService.createRoom(input)),
    joinRoom: gameAccessProcedure
      .input(z.object({ roomCode: roomCodeSchema, playerName: playerNameSchema, tabId: tabIdSchema }))
      .mutation(({ input }) => roomService.joinRoom(input)),
    getSnapshot: gameAccessProcedure.input(sessionSchema).query(({ input }) => roomService.getSnapshot(input)),
    reconnect: gameAccessProcedure.input(sessionSchema).mutation(({ input }) => roomService.reconnect(input)),
    setReady: gameAccessProcedure.input(commandSchema.extend({ ready: z.boolean() })).mutation(({ input }) => roomService.setReady(input)),
    selectSecret: gameAccessProcedure.input(commandSchema.extend({ cardId: z.number().int().positive() })).mutation(({ input }) => roomService.selectSecret(input)),
    toggleElimination: gameAccessProcedure.input(commandSchema.extend({ cardId: z.number().int().positive() })).mutation(({ input }) => roomService.toggleElimination(input)),
    endTurn: gameAccessProcedure.input(commandSchema).mutation(({ input }) => roomService.endTurn(input)),
    submitGuess: gameAccessProcedure.input(commandSchema.extend({ cardId: z.number().int().positive() })).mutation(({ input }) => roomService.submitGuess(input)),
    startRematch: gameAccessProcedure.input(commandSchema).mutation(({ input }) => roomService.startRematch(input)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
