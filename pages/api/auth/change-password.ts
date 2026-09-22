import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { changePasswordSchema } from "@/lib/validators";
import { comparePassword, hashPassword } from "@/lib/password";
import { ApiError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";

async function changePassword(req: NextApiRequest, res: NextApiResponse, currentUser: TokenPayload) {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: currentUser.sub } });
  if (!user) throw new ApiError(401, "Not authenticated");

  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) throw new ApiError(400, "Current password is incorrect");

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { password: passwordHash } });

  res.status(200).json({ success: true });
}

export default methodRouter({ POST: withAuth(changePassword) });
