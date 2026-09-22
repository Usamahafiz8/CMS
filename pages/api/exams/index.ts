import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { examCreateSchema, paginationSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";
import type { Paginated } from "@/lib/types";

async function getExams(req: NextApiRequest, res: NextApiResponse) {
  const { page, pageSize } = paginationSchema.parse(req.query);

  const [data, total] = await prisma.$transaction([
    prisma.exam.findMany({
      orderBy: { startDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { class: true, subjects: true },
    }),
    prisma.exam.count(),
  ]);

  const response: Paginated<(typeof data)[number]> = {
    data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  };

  res.status(200).json(response);
}

async function createExam(req: NextApiRequest, res: NextApiResponse) {
  const input = examCreateSchema.parse(req.body);

  const classItem = await prisma.class.findUnique({ where: { id: input.classId } });
  if (!classItem) throw new NotFoundError("Class");

  const exam = await prisma.exam.create({
    data: {
      name: input.name,
      classId: input.classId,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      subjects: { connect: input.subjectIds.map((id) => ({ id })) },
    },
    include: { class: true, subjects: true },
  });

  res.status(201).json(exam);
}

export default methodRouter({
  GET: withAuth(getExams),
  POST: withAuth(createExam, ["ADMIN"]),
});
