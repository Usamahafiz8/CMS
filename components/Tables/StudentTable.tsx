import type { Student } from "@/generated/prisma/client";

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export default function StudentTable({ students, onEdit, onDelete }: StudentTableProps) {
  if (students.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        No students found. Add a student to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Roll Number</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Guardian</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Phone</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {students.map((student) => (
            <tr key={student.id} className="transition-colors hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">
                {student.firstName} {student.lastName}
              </td>
              <td className="px-4 py-3 text-slate-600">{student.rollNumber}</td>
              <td className="px-4 py-3 text-slate-600">{student.guardianName}</td>
              <td className="px-4 py-3 text-slate-600">{student.phone ?? "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    student.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {student.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(student)}
                  className="mr-3 font-medium text-brand-600 hover:text-brand-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(student)}
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
