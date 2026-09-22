import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { subjectCreateSchema, paginationSchema } from "@/lib/validators";
import type { Paginated } from "@/lib/types";

async function getSubjects(req: NextApiRequest, res: NextApiResponse) {
  const { page, pageSize } = paginationSchema.parse(req.query);

  const [data, total] = await prisma.$transaction([
    prisma.subject.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.subject.count(),
  ]);

  const response: Paginated<(typeof data)[number]> = {
    data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  };

  res.status(200).json(response);
}

async function createSubject(req: NextApiRequest, res: NextApiResponse) {
  const input = subjectCreateSchema.parse(req.body);
  const subject = await prisma.subject.create({ data: input });
  res.status(201).json(subject);
}

export default methodRouter({
  GET: withAuth(getSubjects),
  POST: withAuth(createSubject, ["ADMIN"]),
});
