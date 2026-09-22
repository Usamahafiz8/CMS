import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { hashPassword } from "@/lib/password";
import { NotFoundError } from "@/lib/errors";

// Admin-initiated password reset for another user.
// A true "forgot password" email flow needs an SMTP/email provider, which
// isn't configured for this project yet — this covers the administrative case.
const resetPasswordSchema = z.object({
  userId: z.string().trim().min(1, "userId is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

async function resetPassword(req: NextApiRequest, res: NextApiResponse) {
  const { userId, newPassword } = resetPasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User");

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { password: passwordHash } });

  res.status(200).json({ success: true });
}

export default methodRouter({ POST: withAuth(resetPassword, ["ADMIN"]) });
