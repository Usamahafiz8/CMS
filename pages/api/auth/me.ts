import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";

async function me(req: NextApiRequest, res: NextApiResponse, currentUser: TokenPayload) {
  const user = await prisma.user.findUnique({ where: { id: currentUser.sub } });
  if (!user) throw new ApiError(401, "Not authenticated");

  const { password: _password, ...safeUser } = user;
  void _password;
  res.status(200).json(safeUser);
}

export default methodRouter({ GET: withAuth(me) });
