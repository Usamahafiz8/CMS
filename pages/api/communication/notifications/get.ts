import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import type { TokenPayload } from "@/lib/jwt";

async function getNotifications(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const notifications = await prisma.notification.findMany({
    where: { userId: user.sub },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.status(200).json({ data: notifications });
}

export default methodRouter({ GET: withAuth(getNotifications) });
