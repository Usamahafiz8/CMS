import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, getId, withAuth } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";
import { examUpdateSchema } from "@/lib/validators";

async function getExam(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      class: true,
      subjects: true,
      timetables: { include: { subject: true }, orderBy: { date: "asc" } },
      invigilators: { include: { teacher: true } },
    },
  });
  if (!exam) throw new NotFoundError("Exam");
  res.status(200).json(exam);
}

async function updateExam(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);
  const input = examUpdateSchema.parse(req.body);

  const exists = await prisma.exam.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Exam");

  const { subjectIds, ...rest } = input;

  const exam = await prisma.exam.update({
    where: { id },
    data: {
      ...rest,
      ...(subjectIds ? { subjects: { set: subjectIds.map((subjectId) => ({ id: subjectId })) } } : {}),
    },
    include: { class: true, subjects: true },
  });

  res.status(200).json(exam);
}

async function deleteExam(req: NextApiRequest, res: NextApiResponse) {
  const id = getId(req);

  const exists = await prisma.exam.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Exam");

  await prisma.exam.delete({ where: { id } });
  res.status(200).json({ success: true });
}

export default methodRouter({
  GET: withAuth(getExam),
  PUT: withAuth(updateExam, ["ADMIN"]),
  DELETE: withAuth(deleteExam, ["ADMIN"]),
});
