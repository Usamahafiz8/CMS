import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { adminResetPasswordSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/password";
import { NotFoundError, ApiError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";

// Admin-initiated password reset for another user.
// A true "forgot password" email flow needs an SMTP/email provider, which
// isn't configured for this project yet — this covers the administrative case.
async function resetPassword(req: NextApiRequest, res: NextApiResponse, currentUser: TokenPayload) {
  const { userId, newPassword } = adminResetPasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user) throw new NotFoundError("User");

  // Only a Super Admin may reset another Super Admin's password, so a
  // regular Admin can't lock a Super Admin out of their own account.
  if (user.role.key === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "Only a Super Admin can reset another Super Admin's password");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { password: passwordHash } });

  res.status(200).json({ success: true });
}

export default methodRouter({ POST: withPermission(resetPassword, "users.changePassword") });
