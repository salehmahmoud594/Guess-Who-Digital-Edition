import crypto from "node:crypto";
import type { Request, Response } from "express";
import { TRPCError } from "@trpc/server";
import { GAME_ACCESS_COOKIE, GAME_ACCESS_REQUIRED_ERR_MSG } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";

const ACCESS_SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function parseCookieHeader(header: string | undefined, name: string) {
  if (!header) return null;
  const prefix = `${name}=`;
  const match = header.split(";").map(part => part.trim()).find(part => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

function sign(value: string) {
  if (!ENV.cookieSecret) throw new Error("JWT_SECRET must be configured for game access sessions.");
  return crypto.createHmac("sha256", ENV.cookieSecret).update(value).digest("base64url");
}

function safeEqual(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  const sameLength = expectedBuffer.length === receivedBuffer.length;
  const comparable = sameLength ? receivedBuffer : Buffer.alloc(expectedBuffer.length);
  return sameLength && crypto.timingSafeEqual(expectedBuffer, comparable);
}

export function hasValidGameAccess(req: Request) {
  const token = parseCookieHeader(req.headers.cookie, GAME_ACCESS_COOKIE);
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator < 1) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expectedSignature = sign(payload);
  if (!safeEqual(expectedSignature, signature)) return false;

  const expiresAt = Number(payload.split(".")[0]);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function grantGameAccess(req: Request, res: Response) {
  const expiresAt = Date.now() + ACCESS_SESSION_TTL_MS;
  const payload = `${expiresAt}.${crypto.randomUUID()}`;
  const token = `${payload}.${sign(payload)}`;
  res.cookie(GAME_ACCESS_COOKIE, token, {
    ...getSessionCookieOptions(req),
    maxAge: ACCESS_SESSION_TTL_MS,
  });
  return { granted: true as const, expiresAt };
}

export function revokeGameAccess(req: Request, res: Response) {
  res.clearCookie(GAME_ACCESS_COOKIE, { ...getSessionCookieOptions(req), maxAge: -1 });
  return { granted: false as const };
}

export function verifyGameAccessPassword(password: string) {
  return Boolean(ENV.gameAccessPassword) && safeEqual(ENV.gameAccessPassword, password);
}

export function requireGameAccess(req: Request) {
  if (!hasValidGameAccess(req)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: GAME_ACCESS_REQUIRED_ERR_MSG });
  }
}
