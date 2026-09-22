import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { markEntrySchema } from "@/lib/validators";
import { calculatePercentage, calculateGrade } from "@/lib/calculations";
import { NotFoundError } from "@/lib/errors";
import { assertTeacherOwnsClass } from "@/lib/permissions";
import type { TokenPayload } from "@/lib/jwt";

async function enterMark(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const input = markEntrySchema.parse(req.body);

  const [student, exam, subject] = await Promise.all([
    prisma.student.findUnique({ where: { id: input.studentId } }),
    prisma.exam.findUnique({ where: { id: input.examId } }),
    prisma.subject.findUnique({ where: { id: input.subjectId } }),
  ]);

  if (!student) throw new NotFoundError("Student");
  if (!exam) throw new NotFoundError("Exam");
  if (!subject) throw new NotFoundError("Subject");

  // Teachers may only enter marks for classes they're assigned to; the
  // resolved teacher record (not the client-supplied teacherId) is used
  // below so a teacher can't attribute marks to someone else.
  const ownTeacher = await assertTeacherOwnsClass(user, exam.classId);
  const teacherId = ownTeacher?.id ?? input.teacherId;

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) throw new NotFoundError("Teacher");

  const percentage = calculatePercentage(input.marks, input.totalMarks);
  const grade = calculateGrade(percentage);

  const mark = await prisma.mark.upsert({
    where: {
      studentId_examId_subjectId: {
        studentId: input.studentId,
        examId: input.examId,
        subjectId: input.subjectId,
      },
    },
    create: {
      studentId: input.studentId,
      teacherId,
      examId: input.examId,
      subjectId: input.subjectId,
      marks: input.marks,
      totalMarks: input.totalMarks,
      percentage,
      grade,
      remarks: input.remarks || null,
    },
    update: {
      teacherId,
      marks: input.marks,
      totalMarks: input.totalMarks,
      percentage,
      grade,
      remarks: input.remarks || null,
    },
  });

  res.status(200).json(mark);
}

export default methodRouter({ POST: withAuth(enterMark, ["ADMIN", "TEACHER"]) });
