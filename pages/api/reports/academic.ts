import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { methodRouter, withPermission } from "@/lib/api-handler";
import { academicReportRequestSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";

async function getAcademicReport(req: NextApiRequest, res: NextApiResponse) {
  const { examId } = academicReportRequestSchema.parse(req.query);

  const exam = await prisma.exam.findUnique({ where: { id: examId }, include: { subjects: true } });
  if (!exam) throw new NotFoundError("Exam");

  const marks = await prisma.mark.findMany({ where: { examId }, include: { subject: true } });

  const bySubject = exam.subjects.map((subject) => {
    const subjectMarks = marks.filter((m) => m.subjectId === subject.id);
    const avgPercentage =
      subjectMarks.length > 0
        ? Math.round((subjectMarks.reduce((sum, m) => sum + m.percentage, 0) / subjectMarks.length) * 10) / 10
        : 0;
    const gradeDistribution = ["A", "B", "C", "D", "F"].map((grade) => ({
      grade,
      count: subjectMarks.filter((m) => m.grade === grade).length,
    }));
    return { subjectId: subject.id, subjectName: subject.name, avgPercentage, gradeDistribution, entryCount: subjectMarks.length };
  });

  res.status(200).json({ exam, bySubject });
}

export default methodRouter({ GET: withPermission(getAcademicReport, "reports.view") });
