import type { Teacher } from "@/generated/prisma/client";

interface TeacherTableProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

export default function TeacherTable({ teachers, onEdit, onDelete }: TeacherTableProps) {
  if (teachers.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        No teachers found. Add a teacher to get started.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-md border border-slate-200 sm:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Employee ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Phone</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {teacher.firstName} {teacher.lastName}
                </td>
                <td className="px-4 py-3 text-slate-600">{teacher.employeeId}</td>
                <td className="px-4 py-3 text-slate-600">{teacher.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      teacher.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {teacher.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(teacher)}
                    className="mr-3 font-medium text-brand-600 hover:text-brand-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(teacher)}
                    className="font-medium text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:hidden">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {teacher.firstName} {teacher.lastName}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">ID {teacher.employeeId}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                  teacher.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {teacher.status}
              </span>
            </div>
            <dl className="mt-3 border-t border-slate-100 pt-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Phone</dt>
                <dd className="text-slate-700">{teacher.phone ?? "—"}</dd>
              </div>
            </dl>
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => onEdit(teacher)}
                className="min-h-10 flex-1 rounded-md border border-slate-300 text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(teacher)}
                className="min-h-10 flex-1 rounded-md border border-slate-300 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
