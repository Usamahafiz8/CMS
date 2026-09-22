import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { getUserPermissionKeys } from "@/lib/permissions";
import { ApiError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";

async function me(req: NextApiRequest, res: NextApiResponse, currentUser: TokenPayload) {
  const user = await prisma.user.findUnique({
    where: { id: currentUser.sub },
    include: { role: { select: { id: true, key: true, name: true } } },
  });
  if (!user) throw new ApiError(401, "Not authenticated");

  const permissions = await getUserPermissionKeys(user.roleId);

  const { password: _password, ...safeUser } = user;
  void _password;
  res.status(200).json({ ...safeUser, permissions: Array.from(permissions) });
}

export default methodRouter({ GET: withAuth(me) });
