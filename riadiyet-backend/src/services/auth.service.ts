import bcrypt from "bcryptjs";
import { Role } from "../types";
import prisma from "../config/database";
import { env } from "../config/env";
import {
  signAccessToken,
  createRefreshToken,
  rotateRefreshToken,
  revokeAllTokens,
} from "./token.service";

// ─── Register ─────────────────────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new Error("EMAIL_TAKEN");

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      passwordHash,
      name: input.name.trim(),
      role: input.role,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role as Role,
    name: user.name,
  });
  const refreshToken = await createRefreshToken(user.id);

  return { user, accessToken, refreshToken };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase().trim() },
  });

  if (!user) throw new Error("INVALID_CREDENTIALS");
  if (!user.isActive) throw new Error("ACCOUNT_DISABLED");

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role as Role,
    name: user.name,
  });
  const refreshToken = await createRefreshToken(user.id);

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export async function refresh(rawRefreshToken: string) {
  const tokens = await rotateRefreshToken(rawRefreshToken);
  if (!tokens) throw new Error("INVALID_REFRESH_TOKEN");
  return tokens;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(userId: string) {
  await revokeAllTokens(userId);
}

// ─── Get current user ─────────────────────────────────────────────────────────

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      language: true,
      avatarUrl: true,
      bio: true,
      isVerified: true,
      createdAt: true,
      expertProfile: {
        select: {
          id: true,
          title: true,
          specialties: true,
          sessionRateDA: true,
          availableForBooking: true,
          rating: true,
          reviewCount: true,
          sessionCount: true,
        },
      },
      institutionProfile: {
        select: {
          id: true,
          institutionName: true,
          type: true,
          city: true,
          websiteUrl: true,
          isVerified: true,
        },
      },
    },
  });

  if (!user) throw new Error("USER_NOT_FOUND");
  return user;
}