import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { marksQuerySchema } from "@/lib/validators";
import { assertCanViewStudent } from "@/lib/permissions";
import { ApiError } from "@/lib/errors";
import type { TokenPayload } from "@/lib/jwt";
import type { Prisma } from "@/generated/prisma/client";

async function getMarks(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const { studentId, examId, subjectId, classId } = marksQuerySchema.parse(req.query);

  if ((user.role === "STUDENT" || user.role === "PARENT") && !studentId) {
    throw new ApiError(400, "studentId is required");
  }
  if (studentId) await assertCanViewStudent(user, studentId);

  const where: Prisma.MarkWhereInput = {
    ...(studentId ? { studentId } : {}),
    ...(examId ? { examId } : {}),
    ...(subjectId ? { subjectId } : {}),
    ...(classId ? { student: { classEnrollments: { some: { classId } } } } : {}),
    // Students and parents may only see published results.
    ...(user.role === "STUDENT" || user.role === "PARENT" ? { isPublished: true } : {}),
  };

  const marks = await prisma.mark.findMany({
    where,
    include: { student: true, subject: true, exam: true },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ data: marks });
}

export default methodRouter({ GET: withAuth(getMarks) });
