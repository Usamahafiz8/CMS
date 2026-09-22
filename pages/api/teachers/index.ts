import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth, withPermission } from "@/lib/api-handler";
import { teacherCreateSchema, paginationSchema } from "@/lib/validators";
import type { Paginated } from "@/lib/types";

async function getTeachers(req: NextApiRequest, res: NextApiResponse) {
  const { page, pageSize } = paginationSchema.parse(req.query);

  const [data, total] = await prisma.$transaction([
    prisma.teacher.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.teacher.count(),
  ]);

  const response: Paginated<(typeof data)[number]> = {
    data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  };

  res.status(200).json(response);
}

async function createTeacher(req: NextApiRequest, res: NextApiResponse) {
  const input = teacherCreateSchema.parse(req.body);

  const teacher = await prisma.teacher.create({
    data: {
      ...input,
      phone: input.phone || null,
      email: input.email || null,
      qualifications: input.qualifications || null,
      address: input.address || null,
      profilePic: input.profilePic || null,
    },
  });

  res.status(201).json(teacher);
}

export default methodRouter({
  GET: withAuth(getTeachers),
  POST: withPermission(createTeacher, "teachers.create"),
});
