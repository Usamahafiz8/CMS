import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter } from "@/lib/api-handler";
import { getRefreshToken, setAuthCookies } from "@/lib/cookies";
import { verifyToken, signAccessToken, signRefreshToken } from "@/lib/jwt";
import { ApiError } from "@/lib/errors";

async function refresh(req: NextApiRequest, res: NextApiResponse) {
  const token = getRefreshToken(req);
  if (!token) throw new ApiError(401, "Not authenticated");

  let payload;
  try {
    payload = verifyToken(token, "refresh");
  } catch {
    throw new ApiError(401, "Invalid or expired session");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } });
  if (!user || user.status !== "ACTIVE") {
    throw new ApiError(401, "Account no longer active");
  }

  const newPayload = { sub: user.id, email: user.email, role: user.role.key, roleId: user.roleId };
  const accessToken = signAccessToken(newPayload);
  const refreshToken = signRefreshToken(newPayload);
  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({ success: true });
}

export default methodRouter({ POST: refresh });
