import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { assignInvigilatorSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";

async function assignInvigilator(req: NextApiRequest, res: NextApiResponse) {
  const { examId, teacherId } = assignInvigilatorSchema.parse(req.body);

  const [exam, teacher] = await Promise.all([
    prisma.exam.findUnique({ where: { id: examId } }),
    prisma.teacher.findUnique({ where: { id: teacherId } }),
  ]);
  if (!exam) throw new NotFoundError("Exam");
  if (!teacher) throw new NotFoundError("Teacher");

  const invigilator = await prisma.examInvigilator.create({
    data: { examId, teacherId },
    include: { teacher: true },
  });

  res.status(201).json(invigilator);
}

export default methodRouter({ POST: withAuth(assignInvigilator, ["ADMIN"]) });
