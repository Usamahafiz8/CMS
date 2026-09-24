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
      <div className="rounded-md border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
        No attendance records yet for this range.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-md border border-slate-200 sm:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Student</th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Present</th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Absent</th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Leave</th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Attendance %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map(({ student, summary }) => (
              <tr key={student.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  {student.firstName} {student.lastName}
                </td>
                <td className="px-4 py-2.5 text-green-700">{summary.present}</td>
                <td className="px-4 py-2.5 text-red-700">{summary.absent}</td>
                <td className="px-4 py-2.5 text-amber-700">{summary.leave}</td>
                <td className="px-4 py-2.5 font-medium text-slate-700">{summary.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2.5 sm:hidden">
        {rows.map(({ student, summary }) => (
          <div key={student.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="truncate font-semibold text-slate-900">
                {student.firstName} {student.lastName}
              </p>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                {summary.percentage}%
              </span>
            </div>
            <dl className="mt-2.5 grid grid-cols-3 gap-y-2 border-t border-slate-100 pt-2.5 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Present</dt>
                <dd className="font-medium text-green-700">{summary.present}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Absent</dt>
                <dd className="font-medium text-red-700">{summary.absent}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Leave</dt>
                <dd className="font-medium text-amber-700">{summary.leave}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}
