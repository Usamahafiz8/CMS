import type { Subject } from "@/generated/prisma/client";

interface SubjectTableProps {
  subjects: Subject[];
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

export default function SubjectTable({ subjects, onEdit, onDelete }: SubjectTableProps) {
  if (subjects.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        No subjects found. Add a subject to get started.
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
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {subjects.map((subject) => (
              <tr key={subject.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{subject.name}</td>
                <td className="px-4 py-3 text-slate-600">{subject.code}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      subject.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {subject.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(subject)}
                    className="mr-3 font-medium text-brand-600 hover:text-brand-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(subject)}
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
        {subjects.map((subject) => (
          <div key={subject.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{subject.name}</p>
                <p className="mt-0.5 text-sm text-slate-500">Code {subject.code}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                  subject.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {subject.status}
              </span>
            </div>
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => onEdit(subject)}
                className="min-h-10 flex-1 rounded-md border border-slate-300 text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(subject)}
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
