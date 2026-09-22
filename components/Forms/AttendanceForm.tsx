import { useState } from "react";
import type { Student } from "@/generated/prisma/client";
import type { AttendanceStatusValue } from "@/hooks/useAttendance";

interface AttendanceFormProps {
  students: Student[];
  onSubmit: (records: { studentId: string; status: AttendanceStatusValue; remarks?: string }[]) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS: AttendanceStatusValue[] = ["PRESENT", "ABSENT", "LEAVE"];

const STATUS_STYLES: Record<AttendanceStatusValue, string> = {
  PRESENT: "bg-green-100 text-green-700 border-green-300",
  ABSENT: "bg-red-100 text-red-700 border-red-300",
  LEAVE: "bg-amber-100 text-amber-700 border-amber-300",
};

export default function AttendanceForm({ students, onSubmit, isSubmitting = false }: AttendanceFormProps) {
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatusValue>>(
    Object.fromEntries(students.map((s) => [s.id, "PRESENT" as AttendanceStatusValue])),
  );

  const setStatus = (studentId: string, status: AttendanceStatusValue) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatusValue) => {
    setStatuses(Object.fromEntries(students.map((s) => [s.id, status])));
  };

  if (students.length === 0) {
    return <p className="text-sm text-slate-500">No students enrolled in this class.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <span className="text-sm font-medium text-slate-600">Mark all:</span>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => markAll(status)}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            {status}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm font-medium text-slate-900">
              {student.firstName} {student.lastName}{" "}
              <span className="text-slate-400">({student.rollNumber})</span>
            </span>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatus(student.id, status)}
                  className={`rounded-md border px-3 py-1 text-xs font-medium ${
                    statuses[student.id] === status
                      ? STATUS_STYLES[status]
                      : "border-slate-200 text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={isSubmitting}
        onClick={() =>
          onSubmit(students.map((s) => ({ studentId: s.id, status: statuses[s.id] ?? "PRESENT" })))
        }
        className="self-end rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Save Attendance"}
      </button>
    </div>
  );
}
