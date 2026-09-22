import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { calculateGPA } from "@/lib/calculations";
import { NotFoundError } from "@/lib/errors";
import { assertCanViewStudent } from "@/lib/permissions";
import type { TokenPayload } from "@/lib/jwt";

const gpaQuerySchema = z.object({
  studentId: z.string().trim().min(1, "studentId is required"),
  examId: z.string().trim().optional(),
});

async function getGpa(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const { studentId, examId } = gpaQuerySchema.parse(req.query);

  await assertCanViewStudent(user, studentId);

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new NotFoundError("Student");

  const marks = await prisma.mark.findMany({
    where: { studentId, isPublished: true, ...(examId ? { examId } : {}) },
  });

  const gpa = calculateGPA(marks.map((m) => m.grade ?? "F"));
  res.status(200).json({ studentId, examId: examId ?? null, gpa, subjectsCounted: marks.length });
}

export default methodRouter({ GET: withAuth(getGpa) });
