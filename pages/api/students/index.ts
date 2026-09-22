import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { studentCreateSchema, paginationSchema } from "@/lib/validators";
import type { Paginated } from "@/lib/types";

async function getStudents(req: NextApiRequest, res: NextApiResponse) {
  const { page, pageSize } = paginationSchema.parse(req.query);

  const [data, total] = await prisma.$transaction([
    prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count(),
  ]);

  const response: Paginated<(typeof data)[number]> = {
    data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  };

  res.status(200).json(response);
}

async function createStudent(req: NextApiRequest, res: NextApiResponse) {
  const input = studentCreateSchema.parse(req.body);

  const student = await prisma.student.create({
    data: {
      ...input,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      profilePic: input.profilePic || null,
    },
  });

  res.status(201).json(student);
}

export default methodRouter({
  GET: withAuth(getStudents),
  POST: withAuth(createStudent, ["ADMIN"]),
});
