import type { NextApiRequest, NextApiResponse } from "next";
import { basePrisma } from "@/lib/db";
import { methodRouter } from "@/lib/api-handler";
import { getRefreshToken } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import { issueSession, assertSchoolActive } from "@/lib/session";
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

  const user = await basePrisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } });
  if (!user || user.status !== "ACTIVE") {
    throw new ApiError(401, "Account no longer active");
  }

  await assertSchoolActive(user.schoolId);
  issueSession(res, user, user.role.key);

  res.status(200).json({ success: true });
}

export default methodRouter({ POST: refresh });
