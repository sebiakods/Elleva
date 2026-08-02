import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import prisma from "../config/database";
import { AccessTokenPayload, RefreshTokenPayload } from "../types";

// ─── Sign ─────────────────────────────────────────────────────────────────────

export function signAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(sub: string, tokenId: string): string {
  return jwt.sign({ sub, tokenId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

/** Create and persist a new refresh-token record, return the signed JWT */
export async function createRefreshToken(userId: string): Promise<string> {
  const tokenId = uuidv4();
  const expiresAt = new Date(Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: { id: tokenId, token: tokenId, userId, expiresAt },
  });

  return signRefreshToken(userId, tokenId);
}

/** Rotate: validate old token, delete it, issue a new one */
export async function rotateRefreshToken(
  oldRawJwt: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  let payload: RefreshTokenPayload;
  try {
    payload = verifyRefreshToken(oldRawJwt);
  } catch {
    return null;
  }

  const record = await prisma.refreshToken.findUnique({
    where: { id: payload.tokenId },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date()) {
    // possible replay — revoke all tokens for this user
    if (record) await prisma.refreshToken.deleteMany({ where: { userId: record.userId } });
    return null;
  }

  // Delete old token (rotation)
  await prisma.refreshToken.delete({ where: { id: record.id } });

  const { user } = record;
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role as AccessTokenPayload["role"],
    name: user.name,
  });
  const refreshToken = await createRefreshToken(user.id);

  return { accessToken, refreshToken };
}

/** Revoke all refresh tokens for a user (logout) */
export async function revokeAllTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function parseDurationMs(dur: string): number {
  const units: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = dur.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 86_400_000; // default 7d
  return parseInt(match[1]) * (units[match[2]] ?? 86_400_000);
}