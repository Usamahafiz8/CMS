import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { sendReminderSchema } from "@/lib/validators";
import { createNotification } from "@/lib/notifications";
import { NotFoundError, ApiError } from "@/lib/errors";
import { formatCurrency } from "@/lib/helpers";

async function sendReminder(req: NextApiRequest, res: NextApiResponse) {
  const { feeId } = sendReminderSchema.parse(req.body);

  const fee = await prisma.fee.findUnique({ where: { id: feeId }, include: { student: true } });
  if (!fee) throw new NotFoundError("Fee");
  if (!fee.student.userId) {
    throw new ApiError(400, "This student has no linked login account to notify");
  }

  await createNotification(
    fee.student.userId,
    "FEE",
    "Fee payment reminder",
    `A payment of ${formatCurrency(fee.amount)} for ${fee.feeType} is due on ${fee.dueDate.toLocaleDateString()}.`,
  );

  res.status(200).json({ success: true });
}

export default methodRouter({ POST: withPermission(sendReminder, "fees.manage") });
