import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { bulkMarkAttendanceSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";
import { assertTeacherOwnsClass } from "@/lib/permissions";
import type { TokenPayload } from "@/lib/jwt";

async function bulkMark(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const input = bulkMarkAttendanceSchema.parse(req.body);

  const classItem = await prisma.class.findUnique({ where: { id: input.classId } });
  if (!classItem) throw new NotFoundError("Class");

  await assertTeacherOwnsClass(user, input.classId);

  const records = await prisma.$transaction(
    input.records.map((record) =>
      prisma.attendanceRecord.upsert({
        where: { studentId_date: { studentId: record.studentId, date: input.date } },
        create: {
          studentId: record.studentId,
          date: input.date,
          status: record.status,
          remarks: record.remarks || null,
          isStudent: true,
        },
        update: {
          status: record.status,
          remarks: record.remarks || null,
        },
      }),
    ),
  );

  res.status(200).json({ data: records });
}

export default methodRouter({ POST: withPermission(bulkMark, "attendance.mark") });
