import type { AttendanceRecord, Student } from "@/generated/prisma/client";

interface AttendanceLogTableProps {
  records: AttendanceRecord[];
  studentsById: Record<string, Student>;
}

const STATUS_STYLES: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LEAVE: "bg-amber-100 text-amber-700",
};

// The per-day record of who was marked what, so "which date was this
// attendance for" has an actual answer — the summary table above this one
// only shows rolled-up totals across every date, with no date column of
// its own.
export default function AttendanceLogTable({ records, studentsById }: AttendanceLogTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
        No attendance has been marked yet.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-md border border-slate-200 sm:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Date</th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Student</th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {records.map((record) => {
              const student = record.studentId ? studentsById[record.studentId] : undefined;
              return (
                <tr key={record.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-600">
                    {new Date(record.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {student ? `${student.firstName} ${student.lastName}` : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[record.status] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 sm:hidden">
        {records.map((record) => {
          const student = record.studentId ? studentsById[record.studentId] : undefined;
          return (
            <div
              key={record.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {student ? `${student.firstName} ${student.lastName}` : "—"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {new Date(record.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[record.status] ?? "bg-slate-100 text-slate-600"}`}
              >
                {record.status}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
