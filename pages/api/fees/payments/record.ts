import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { recordPaymentSchema } from "@/lib/validators";
import { NotFoundError, ConflictError } from "@/lib/errors";

async function recordPayment(req: NextApiRequest, res: NextApiResponse) {
  const { feeId, paidDate } = recordPaymentSchema.parse(req.body);

  const fee = await prisma.fee.findUnique({ where: { id: feeId } });
  if (!fee) throw new NotFoundError("Fee");
  if (fee.status === "PAID") throw new ConflictError("This fee has already been paid");

  const updated = await prisma.fee.update({
    where: { id: feeId },
    data: { status: "PAID", paidDate: paidDate ?? new Date() },
    include: { student: true },
  });

  res.status(200).json(updated);
}

export default methodRouter({ POST: withPermission(recordPayment, "fees.manage") });
