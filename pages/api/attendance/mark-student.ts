import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { markStudentAttendanceSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";
import { createNotification } from "@/lib/notifications";
import { assertTeacherOwnsStudent } from "@/lib/permissions";
import type { TokenPayload } from "@/lib/jwt";

async function markStudent(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const input = markStudentAttendanceSchema.parse(req.body);

  const student = await prisma.student.findUnique({ where: { id: input.studentId } });
  if (!student) throw new NotFoundError("Student");

  await assertTeacherOwnsStudent(user, input.studentId);

  const record = await prisma.attendanceRecord.upsert({
    where: { studentId_date: { studentId: input.studentId, date: input.date } },
    create: {
      studentId: input.studentId,
      date: input.date,
      status: input.status,
      remarks: input.remarks || null,
      isStudent: true,
    },
    update: {
      status: input.status,
      remarks: input.remarks || null,
    },
  });

  if (input.status === "ABSENT" && student.userId) {
    await createNotification(
      student.userId,
      "ATTENDANCE",
      "Absence recorded",
      `You were marked absent on ${input.date.toLocaleDateString()}.`,
    );
  }

  res.status(200).json(record);
}

export default methodRouter({ POST: withPermission(markStudent, "attendance.mark") });
