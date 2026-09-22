import type { Student } from "@/generated/prisma/client";

interface AttendanceSummary {
  present: number;
  absent: number;
  leave: number;
  total: number;
  percentage: number;
}

interface AttendanceTableProps {
  rows: { student: Student; summary: AttendanceSummary }[];
}

export default function AttendanceTable({ rows }: AttendanceTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        No attendance records yet for this range.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Student</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Present</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Absent</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Leave</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Attendance %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map(({ student, summary }) => (
            <tr key={student.id} className="transition-colors hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">
                {student.firstName} {student.lastName}
              </td>
              <td className="px-4 py-3 text-green-700">{summary.present}</td>
              <td className="px-4 py-3 text-red-700">{summary.absent}</td>
              <td className="px-4 py-3 text-amber-700">{summary.leave}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{summary.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
