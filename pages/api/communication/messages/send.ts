import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { sendMessageSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";
import { createNotification } from "@/lib/notifications";
import type { TokenPayload } from "@/lib/jwt";

function conversationIdFor(userIdA: string, userIdB: string): string {
  return [userIdA, userIdB].sort().join("_");
}

async function sendMessage(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const input = sendMessageSchema.parse(req.body);

  const recipient = await prisma.user.findUnique({ where: { id: input.recipientId } });
  if (!recipient) throw new NotFoundError("Recipient");

  const message = await prisma.message.create({
    data: {
      content: input.content,
      senderId: user.sub,
      recipientId: input.recipientId,
      studentId: input.studentId || null,
      conversationId: conversationIdFor(user.sub, input.recipientId),
    },
    include: { sender: true, recipient: true },
  });

  await createNotification(
    input.recipientId,
    "MESSAGE",
    "New message",
    `${message.sender.firstName} ${message.sender.lastName} sent you a message.`,
  );

  res.status(201).json(message);
}

export default methodRouter({ POST: withAuth(sendMessage) });
