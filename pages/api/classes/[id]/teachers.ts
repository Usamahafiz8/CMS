import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth, withPermission } from "@/lib/api-handler";
import { NotFoundError } from "@/lib/errors";
import { assignTeacherSchema } from "@/lib/validators";

function getClassId(req: NextApiRequest): string {
  const { id } = req.query;
  if (typeof id !== "string") throw new NotFoundError("Class");
  return id;
}

async function getClassTeachers(req: NextApiRequest, res: NextApiResponse) {
  const classId = getClassId(req);

  const classExists = await prisma.class.findUnique({ where: { id: classId } });
  if (!classExists) throw new NotFoundError("Class");

  const assignments = await prisma.classAssignment.findMany({
    where: { classId },
    include: { teacher: true },
  });

  res.status(200).json({ data: assignments.map((a) => a.teacher) });
}

async function assignTeacher(req: NextApiRequest, res: NextApiResponse) {
  const classId = getClassId(req);
  const { teacherId } = assignTeacherSchema.parse(req.body);

  const [classItem, teacher] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId } }),
    prisma.teacher.findUnique({ where: { id: teacherId } }),
  ]);

  if (!classItem) throw new NotFoundError("Class");
  if (!teacher) throw new NotFoundError("Teacher");

  const assignment = await prisma.classAssignment.create({
    data: { classId, teacherId },
    include: { teacher: true },
  });

  res.status(201).json(assignment);
}

export default methodRouter({
  GET: withAuth(getClassTeachers),
  POST: withPermission(assignTeacher, "classes.edit"),
});
