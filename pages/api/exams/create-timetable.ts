import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { createExamTimetableSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";

async function createTimetable(req: NextApiRequest, res: NextApiResponse) {
  const { examId, entries } = createExamTimetableSchema.parse(req.body);

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) throw new NotFoundError("Exam");

  const created = await prisma.$transaction(
    entries.map((entry) =>
      prisma.examTimetable.create({
        data: { examId, ...entry },
        include: { subject: true },
      }),
    ),
  );

  res.status(201).json({ data: created });
}

export default methodRouter({ POST: withAuth(createTimetable, ["ADMIN"]) });
