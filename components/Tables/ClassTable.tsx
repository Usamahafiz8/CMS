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
    <div className="overflow-x-auto rounded-md border border-slate-200">
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
  );
}
