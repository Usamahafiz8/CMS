import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { reportCardQuerySchema } from "@/lib/validators";
import { calculateGPA } from "@/lib/calculations";
import { NotFoundError } from "@/lib/errors";
import { assertCanViewStudent } from "@/lib/permissions";
import type { TokenPayload } from "@/lib/jwt";

async function getReportCard(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const { studentId, examId } = reportCardQuerySchema.parse(req.query);

  await assertCanViewStudent(user, studentId);

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new NotFoundError("Student");

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) throw new NotFoundError("Exam");

  const marks = await prisma.mark.findMany({
    where: {
      studentId,
      examId,
      ...(user.role === "STUDENT" || user.role === "PARENT" ? { isPublished: true } : {}),
    },
    include: { subject: true },
    orderBy: { subject: { name: "asc" } },
  });

  const totalMarks = marks.reduce((sum, m) => sum + m.marks, 0);
  const totalPossible = marks.reduce((sum, m) => sum + m.totalMarks, 0);
  const overallPercentage = totalPossible > 0 ? Math.round((totalMarks / totalPossible) * 1000) / 10 : 0;
  const gpa = calculateGPA(marks.map((m) => m.grade ?? "F"));

  res.status(200).json({
    student,
    exam,
    marks,
    overallPercentage,
    gpa,
  });
}

export default methodRouter({ GET: withAuth(getReportCard) });
