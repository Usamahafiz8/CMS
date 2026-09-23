import type { Subject, Teacher, TimetableSlot } from "@/generated/prisma/client";

type SlotRow = TimetableSlot & { teacher: Teacher; subject: Subject };

interface TimetableTableProps {
  slots: SlotRow[];
}

const DAY_LABELS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TimetableTable({ slots }: TimetableTableProps) {
  if (slots.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        No timetable slots set yet.
      </div>
    );
  }

  const periods = [...new Set(slots.map((s) => s.periodNumber))].sort((a, b) => a - b);
  const days = [...new Set(slots.map((s) => s.dayOfWeek))].sort((a, b) => a - b);

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-600">
              Period
            </th>
            {days.map((day) => (
              <th key={day} className="px-4 py-3 text-left font-semibold text-slate-600">
                {DAY_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {periods.map((period) => (
            <tr key={period}>
              <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-slate-900">
                Period {period}
              </td>
              {days.map((day) => {
                const slot = slots.find((s) => s.dayOfWeek === day && s.periodNumber === period);
                return (
                  <td key={day} className="px-4 py-3 text-slate-600">
                    {slot ? (
                      <div>
                        <div className="font-medium text-slate-800">{slot.subject.name}</div>
                        <div className="text-xs text-slate-500">
                          {slot.teacher.firstName} {slot.teacher.lastName} · Room {slot.room}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
