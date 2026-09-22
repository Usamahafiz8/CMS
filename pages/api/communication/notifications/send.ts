import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { sendNotificationSchema } from "@/lib/validators";
import { createNotification } from "@/lib/notifications";
import { NotFoundError } from "@/lib/errors";

async function sendNotification(req: NextApiRequest, res: NextApiResponse) {
  const { userId, type, title, message } = sendNotificationSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User");

  const notification = await createNotification(userId, type, title, message);
  res.status(201).json(notification);
}

export default methodRouter({ POST: withAuth(sendNotification, ["ADMIN"]) });
