import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { generateInvoicesSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";

async function generateInvoices(req: NextApiRequest, res: NextApiResponse) {
  const { feeStructureId, studentId, classId } = generateInvoicesSchema.parse(req.body);

  const structure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } });
  if (!structure) throw new NotFoundError("Fee structure");

  let studentIds: string[];
  if (studentId) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundError("Student");
    studentIds = [studentId];
  } else {
    const classItem = await prisma.class.findUnique({
      where: { id: classId },
      include: { enrollments: true },
    });
    if (!classItem) throw new NotFoundError("Class");
    studentIds = classItem.enrollments.map((e) => e.studentId);
  }

  const alreadyInvoiced = await prisma.fee.findMany({
    where: { feeStructureId, studentId: { in: studentIds } },
    select: { studentId: true },
  });
  const alreadyInvoicedIds = new Set(alreadyInvoiced.map((f) => f.studentId));
  const toInvoice = studentIds.filter((id) => !alreadyInvoicedIds.has(id));

  const created = await prisma.$transaction(
    toInvoice.map((sid) =>
      prisma.fee.create({
        data: {
          studentId: sid,
          feeStructureId,
          amount: structure.amount,
          feeType: structure.feeType,
          dueDate: structure.dueDate,
          status: "PENDING",
        },
      }),
    ),
  );

  res.status(201).json({ data: created, skipped: alreadyInvoicedIds.size });
}

export default methodRouter({ POST: withAuth(generateInvoices, ["ADMIN"]) });
