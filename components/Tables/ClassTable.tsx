import type { Class } from "@/generated/prisma/client";

type ClassRow = Class & { _count: { enrollments: number } };

interface ClassTableProps {
  classes: ClassRow[];
  onEdit: (classItem: ClassRow) => void;
  onDelete: (classItem: ClassRow) => void;
}

export default function ClassTable({ classes, onEdit, onDelete }: ClassTableProps) {
  if (classes.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        No classes found. Add a class to get started.
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
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Section</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Capacity</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Academic Year</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {classes.map((classItem) => (
              <tr key={classItem.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{classItem.name}</td>
                <td className="px-4 py-3 text-slate-600">{classItem.section}</td>
                <td className="px-4 py-3 text-slate-600">
                  {classItem._count.enrollments} / {classItem.capacity}
                </td>
                <td className="px-4 py-3 text-slate-600">{classItem.academicYear}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(classItem)}
                    className="mr-3 font-medium text-brand-600 hover:text-brand-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(classItem)}
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
        {classes.map((classItem) => (
          <div key={classItem.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {classItem.name} - {classItem.section}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{classItem.academicYear}</p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {classItem._count.enrollments} / {classItem.capacity}
              </span>
            </div>
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => onEdit(classItem)}
                className="min-h-10 flex-1 rounded-md border border-slate-300 text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(classItem)}
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
