import { prisma } from "@/lib/db";
import type { NotificationType } from "@/generated/prisma/client";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
) {
  return prisma.notification.create({ data: { userId, type, title, message } });
}
