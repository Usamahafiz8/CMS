import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { invoicesQuerySchema } from "@/lib/validators";
import { assertCanViewStudent } from "@/lib/permissions";
import { isFullAccessRole } from "@/lib/roles";
import { ApiError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";
import type { Prisma } from "@/generated/prisma/client";

async function getInvoices(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const { studentId, classId, status } = invoicesQuerySchema.parse(req.query);

  if ((user.role === "STUDENT" || user.role === "PARENT") && !studentId) {
    throw new ApiError(400, "studentId is required");
  }
  if (studentId) await assertCanViewStudent(user, studentId);
  if (classId && !isFullAccessRole(user.role) && user.role !== "TEACHER") {
    throw new ApiError(403, "You do not have permission to view class invoices");
  }

  const where: Prisma.FeeWhereInput = {
    ...(studentId ? { studentId } : {}),
    ...(classId ? { student: { classEnrollments: { some: { classId } } } } : {}),
    ...(status ? { status } : {}),
  };

  const fees = await prisma.fee.findMany({
    where,
    include: { student: true, feeStructure: true },
    orderBy: { dueDate: "asc" },
  });

  res.status(200).json({ data: fees });
}

export default methodRouter({ GET: withAuth(getInvoices) });
