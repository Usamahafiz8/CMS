import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { markTeacherAttendanceSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";

async function markTeacher(req: NextApiRequest, res: NextApiResponse) {
  const input = markTeacherAttendanceSchema.parse(req.body);

  const teacher = await prisma.teacher.findUnique({ where: { id: input.teacherId } });
  if (!teacher) throw new NotFoundError("Teacher");

  const record = await prisma.attendanceRecord.upsert({
    where: { teacherId_date: { teacherId: input.teacherId, date: input.date } },
    create: {
      teacherId: input.teacherId,
      date: input.date,
      status: input.status,
      remarks: input.remarks || null,
      isStudent: false,
    },
    update: {
      status: input.status,
      remarks: input.remarks || null,
    },
  });

  res.status(200).json(record);
}

export default methodRouter({ POST: withPermission(markTeacher, "attendance.manage") });
