import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { getMessagesSchema } from "@/lib/validators";
import { ApiError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";

function conversationIdFor(userIdA: string, userIdB: string): string {
  return [userIdA, userIdB].sort().join("_");
}

async function getMessages(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const { conversationId, withUserId } = getMessagesSchema.parse(req.query);

  const resolvedConversationId =
    conversationId ?? (withUserId ? conversationIdFor(user.sub, withUserId) : undefined);

  if (!resolvedConversationId) {
    throw new ApiError(400, "Provide conversationId or withUserId");
  }

  // Only participants of the conversation may read it.
  if (!resolvedConversationId.split("_").includes(user.sub)) {
    throw new ApiError(403, "You do not have access to this conversation");
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: resolvedConversationId },
    include: { sender: true, recipient: true },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { conversationId: resolvedConversationId, recipientId: user.sub, isRead: false },
    data: { isRead: true },
  });

  res.status(200).json({ data: messages });
}

export default methodRouter({ GET: withAuth(getMessages) });
