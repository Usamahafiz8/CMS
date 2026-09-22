import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withPermission } from "@/lib/api-handler";

async function getFinancialReport(req: NextApiRequest, res: NextApiResponse) {
  const fees = await prisma.fee.findMany();

  const totalRevenue = fees.filter((f) => f.status === "PAID").reduce((sum, f) => sum + f.amount, 0);
  const totalOutstanding = fees
    .filter((f) => f.status !== "PAID")
    .reduce((sum, f) => sum + f.amount, 0);

  const byFeeType = [...new Set(fees.map((f) => f.feeType))].map((feeType) => {
    const typeFees = fees.filter((f) => f.feeType === feeType);
    return {
      feeType,
      collected: typeFees.filter((f) => f.status === "PAID").reduce((sum, f) => sum + f.amount, 0),
      outstanding: typeFees.filter((f) => f.status !== "PAID").reduce((sum, f) => sum + f.amount, 0),
    };
  });

  res.status(200).json({
    totalRevenue,
    totalOutstanding,
    totalInvoiced: totalRevenue + totalOutstanding,
    byFeeType,
  });
}

export default methodRouter({ GET: withPermission(getFinancialReport, "reports.viewFinancial") });
