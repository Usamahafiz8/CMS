import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { exportReportSchema } from "@/lib/validators";
import { toCsv } from "@/lib/helpers";
import { ApiError, NotFoundError } from "@/lib/errors";

// Exports as CSV (opens directly in Excel/Sheets). True PDF/XLSX binaries
// would need an extra library (pdfkit/exceljs) that isn't installed yet.
async function exportReport(req: NextApiRequest, res: NextApiResponse) {
  const { type, examId, classId } = exportReportSchema.parse(req.body);

  let csv: string;
  let filename: string;

  if (type === "financial") {
    const fees = await prisma.fee.findMany({ include: { student: true } });
    csv = toCsv(
      fees.map((f) => ({
        student: `${f.student.firstName} ${f.student.lastName}`,
        rollNumber: f.student.rollNumber,
        feeType: f.feeType,
        amount: f.amount,
        status: f.status,
        dueDate: f.dueDate.toISOString().slice(0, 10),
        paidDate: f.paidDate ? f.paidDate.toISOString().slice(0, 10) : "",
      })),
    );
    filename = "financial-report.csv";
  } else if (type === "academic") {
    if (!examId) throw new ApiError(400, "examId is required for academic export");
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundError("Exam");
    const marks = await prisma.mark.findMany({
      where: { examId },
      include: { student: true, subject: true },
    });
    csv = toCsv(
      marks.map((m) => ({
        student: `${m.student.firstName} ${m.student.lastName}`,
        rollNumber: m.student.rollNumber,
        subject: m.subject.name,
        marks: m.marks,
        totalMarks: m.totalMarks,
        percentage: m.percentage,
        grade: m.grade ?? "",
      })),
    );
    filename = `academic-report-${exam.name.replace(/\s+/g, "-")}.csv`;
  } else {
    const students = await prisma.student.findMany({
      where: classId ? { classEnrollments: { some: { classId } } } : {},
      include: { attendanceRecords: true },
    });
    csv = toCsv(
      students.map((s) => {
        const total = s.attendanceRecords.length;
        const present = s.attendanceRecords.filter((r) => r.status === "PRESENT").length;
        return {
          student: `${s.firstName} ${s.lastName}`,
          rollNumber: s.rollNumber,
          present,
          absent: s.attendanceRecords.filter((r) => r.status === "ABSENT").length,
          leave: s.attendanceRecords.filter((r) => r.status === "LEAVE").length,
          attendancePercentage: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
        };
      }),
    );
    filename = "attendance-report.csv";
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csv);
}

export default methodRouter({ POST: withPermission(exportReport, "reports.export") });
