import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { examScheduleQuerySchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";

async function getSchedule(req: NextApiRequest, res: NextApiResponse) {
  const { examId } = examScheduleQuerySchema.parse(req.query);

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) throw new NotFoundError("Exam");

  const [timetable, invigilators] = await Promise.all([
    prisma.examTimetable.findMany({
      where: { examId },
      include: { subject: true },
      orderBy: { date: "asc" },
    }),
    prisma.examInvigilator.findMany({
      where: { examId },
      include: { teacher: true },
    }),
  ]);

  res.status(200).json({ exam, timetable, invigilators });
}

export default methodRouter({ GET: withAuth(getSchedule) });
