import type { NextApiRequest } from "next";
import { getAccessToken } from "@/lib/cookies";
import { verifyToken, type TokenPayload } from "@/lib/jwt";
import { ApiError } from "@/lib/errors";

export function getCurrentUser(req: NextApiRequest): TokenPayload {
  const token = getAccessToken(req);
  if (!token) {
    throw new ApiError(401, "Not authenticated");
  }

  try {
    return verifyToken(token, "access");
  } catch {
    throw new ApiError(401, "Invalid or expired session");
  }
}

export function getCurrentUserOrNull(req: NextApiRequest): TokenPayload | null {
  try {
    return getCurrentUser(req);
  } catch {
    return null;
  }
}
