import jwt from "jsonwebtoken";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
}

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

// `role` is the Role.key (e.g. "ADMIN", or a custom role's key) rather than
// a fixed enum, so custom roles created at runtime work everywhere a role
// check is done. `roleId` is carried alongside it so permission checks can
// look up the role's current permissions without a second lookup by key.
// `schoolId` is the user's tenant; it scopes every query in the request.
export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  roleId: string;
  schoolId: string;
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
    role?: string;
    roleId?: string;
    schoolId?: string;
  };

  if (decoded.type !== expectedType || !decoded.sub || !decoded.email || !decoded.role || !decoded.roleId || !decoded.schoolId) {
    throw new Error("Invalid token");
  }

  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role,
    roleId: decoded.roleId,
    schoolId: decoded.schoolId,
  };
}
