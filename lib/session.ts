import type { NextApiResponse } from "next";
import { basePrisma } from "@/lib/db";
import { signAccessToken, signRefreshToken, type TokenPayload } from "@/lib/jwt";
import { setAuthCookies } from "@/lib/cookies";
import { ApiError } from "@/lib/errors";

// Issues the access/refresh cookie pair for a signed-in user. Shared by
// login, refresh, self-registration and school signup so the token payload
// (including the tenant `schoolId`) is built in exactly one place.
export function issueSession(
  res: NextApiResponse,
  user: { id: string; email: string; roleId: string; schoolId: string },
  roleKey: string,
): TokenPayload {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: roleKey,
    roleId: user.roleId,
    schoolId: user.schoolId,
  };
  setAuthCookies(res, signAccessToken(payload), signRefreshToken(payload));
  return payload;
}

// A suspended/cancelled school's users can't sign in or refresh a session.
// Checked at login and on every token refresh (≤15 min), not per request.
export async function assertSchoolActive(schoolId: string) {
  const school = await basePrisma.school.findUnique({ where: { id: schoolId }, select: { status: true } });
  if (!school) throw new ApiError(403, "This account's school no longer exists");
  if (school.status !== "ACTIVE") {
    throw new ApiError(403, "This school's subscription is not active. Contact Chalkora support.");
  }
}
