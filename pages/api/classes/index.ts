import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth, withPermission } from "@/lib/api-handler";
import { classCreateSchema, paginationSchema } from "@/lib/validators";
import type { Paginated } from "@/lib/types";

async function getClasses(req: NextApiRequest, res: NextApiResponse) {
  const { page, pageSize } = paginationSchema.parse(req.query);

  const [data, total] = await prisma.$transaction([
    prisma.class.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { enrollments: true } } },
    }),
    prisma.class.count(),
  ]);

  const response: Paginated<(typeof data)[number]> = {
    data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  };

  res.status(200).json(response);
}

async function createClass(req: NextApiRequest, res: NextApiResponse) {
  const input = classCreateSchema.parse(req.body);
  const newClass = await prisma.class.create({ data: input });
  res.status(201).json(newClass);
}

export default methodRouter({
  GET: withAuth(getClasses),
  POST: withPermission(createClass, "classes.create"),
});
