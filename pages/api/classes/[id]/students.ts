import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { enrollStudentSchema } from "@/lib/validators";

function getClassId(req: NextApiRequest): string {
  const { id } = req.query;
  if (typeof id !== "string") throw new NotFoundError("Class");
  return id;
}

async function getClassStudents(req: NextApiRequest, res: NextApiResponse) {
  const classId = getClassId(req);

  const classExists = await prisma.class.findUnique({ where: { id: classId } });
  if (!classExists) throw new NotFoundError("Class");

  const enrollments = await prisma.classEnrollment.findMany({
    where: { classId },
    include: { student: true },
    orderBy: { enrollmentDate: "desc" },
  });

  res.status(200).json({ data: enrollments.map((e) => e.student) });
}

async function enrollStudent(req: NextApiRequest, res: NextApiResponse) {
  const classId = getClassId(req);
  const { studentId } = enrollStudentSchema.parse(req.body);

  const [classItem, student, enrolledCount] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId } }),
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.classEnrollment.count({ where: { classId } }),
  ]);

  if (!classItem) throw new NotFoundError("Class");
  if (!student) throw new NotFoundError("Student");
  if (enrolledCount >= classItem.capacity) {
    throw new ConflictError("Class has reached its capacity");
  }

  const enrollment = await prisma.classEnrollment.create({
    data: { classId, studentId },
    include: { student: true },
  });

  res.status(201).json(enrollment);
}

export default methodRouter({
  GET: withAuth(getClassStudents),
  POST: withAuth(enrollStudent, ["ADMIN"]),
});
