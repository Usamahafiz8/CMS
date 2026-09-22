import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { attendanceReportRequestSchema } from "@/lib/validators";

async function getAttendanceReport(req: NextApiRequest, res: NextApiResponse) {
  const { classId, startDate, endDate } = attendanceReportRequestSchema.parse(req.query);

  const dateFilter =
    startDate || endDate
      ? { date: { ...(startDate ? { gte: startDate } : {}), ...(endDate ? { lte: endDate } : {}) } }
      : {};

  const classes = await prisma.class.findMany({
    where: classId ? { id: classId } : {},
    include: { enrollments: true },
  });

  const byClass = await Promise.all(
    classes.map(async (classItem) => {
      const studentIds = classItem.enrollments.map((e) => e.studentId);
      const records = await prisma.attendanceRecord.findMany({
        where: { studentId: { in: studentIds }, ...dateFilter },
      });
      const present = records.filter((r) => r.status === "PRESENT").length;
      const total = records.length;
      return {
        classId: classItem.id,
        className: `${classItem.name} - ${classItem.section}`,
        studentCount: studentIds.length,
        present,
        absent: records.filter((r) => r.status === "ABSENT").length,
        leave: records.filter((r) => r.status === "LEAVE").length,
        attendancePercentage: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
      };
    }),
  );

  res.status(200).json({ data: byClass });
}

export default methodRouter({ GET: withAuth(getAttendanceReport, ["ADMIN", "TEACHER"]) });
