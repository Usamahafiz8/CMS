import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withAuth } from "@/lib/api-handler";
import { attendanceReportQuerySchema } from "@/lib/validators";
import { ApiError, NotFoundError } from "@/lib/errors";
import { assertCanViewStudent } from "@/lib/permissions";
import type { TokenPayload } from "@/lib/jwt";
import type { AttendanceStatus } from "@/generated/prisma/client";

function summarize(records: { status: AttendanceStatus }[]) {
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const leave = records.filter((r) => r.status === "LEAVE").length;
  const total = records.length;
  const percentage = total > 0 ? Math.round((present / total) * 1000) / 10 : 0;
  return { present, absent, leave, total, percentage };
}

async function getReport(req: NextApiRequest, res: NextApiResponse, user: TokenPayload) {
  const { studentId, teacherId, classId, startDate, endDate } = attendanceReportQuerySchema.parse(
    req.query,
  );

  const dateFilter =
    startDate || endDate
      ? { date: { ...(startDate ? { gte: startDate } : {}), ...(endDate ? { lte: endDate } : {}) } }
      : {};

  if (studentId) {
    await assertCanViewStudent(user, studentId);
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId, ...dateFilter },
      orderBy: { date: "desc" },
    });
    res.status(200).json({ records, summary: summarize(records) });
    return;
  }

  if (teacherId) {
    if (user.role !== "ADMIN" && user.role !== "TEACHER") {
      throw new ApiError(403, "You do not have permission to view teacher attendance");
    }
    const records = await prisma.attendanceRecord.findMany({
      where: { teacherId, ...dateFilter },
      orderBy: { date: "desc" },
    });
    res.status(200).json({ records, summary: summarize(records) });
    return;
  }

  if (classId) {
    if (user.role !== "ADMIN" && user.role !== "TEACHER") {
      throw new ApiError(403, "You do not have permission to view class attendance");
    }
    const classItem = await prisma.class.findUnique({
      where: { id: classId },
      include: { enrollments: { include: { student: true } } },
    });
    if (!classItem) throw new NotFoundError("Class");

    const studentIds = classItem.enrollments.map((e) => e.studentId);
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: { in: studentIds }, ...dateFilter },
      orderBy: { date: "desc" },
    });

    const byStudent = classItem.enrollments.map((enrollment) => {
      const studentRecords = records.filter((r) => r.studentId === enrollment.studentId);
      return {
        student: enrollment.student,
        summary: summarize(studentRecords),
      };
    });

    res.status(200).json({ records, byStudent, summary: summarize(records) });
    return;
  }

  throw new ApiError(400, "Provide studentId, teacherId, or classId");
}

export default methodRouter({ GET: withAuth(getReport) });
