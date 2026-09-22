import jwt from "jsonwebtoken";
import type { Role } from "@/generated/prisma/client";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
}

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign({ ...payload, type: "access" }, getSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign({ ...payload, type: "refresh" }, getSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string, expectedType: "access" | "refresh"): TokenPayload {
  const decoded = jwt.verify(token, getSecret()) as jwt.JwtPayload & {
    type?: string;
    sub?: string;
    email?: string;
    role?: Role;
  };

  if (decoded.type !== expectedType || !decoded.sub || !decoded.email || !decoded.role) {
    throw new Error("Invalid token");
  }

  return { sub: decoded.sub, email: decoded.email, role: decoded.role };
}
