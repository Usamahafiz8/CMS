import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";

async function getOutstandingReport(req: NextApiRequest, res: NextApiResponse) {
  const today = new Date();

  // Any PENDING fee whose due date has passed is effectively overdue,
  // regardless of whether a scheduled job has flipped its status yet.
  await prisma.fee.updateMany({
    where: { status: "PENDING", dueDate: { lt: today } },
    data: { status: "OVERDUE" },
  });

  const outstanding = await prisma.fee.findMany({
    where: { status: { in: ["PENDING", "OVERDUE"] } },
    include: { student: true },
    orderBy: { dueDate: "asc" },
  });

  const totalOutstanding = outstanding.reduce((sum, fee) => sum + fee.amount, 0);
  const overdueCount = outstanding.filter((f) => f.status === "OVERDUE").length;

  res.status(200).json({
    data: outstanding,
    summary: { totalOutstanding, count: outstanding.length, overdueCount },
  });
}

export default methodRouter({ GET: withAuth(getOutstandingReport, ["ADMIN"]) });
