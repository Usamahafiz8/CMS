import type { Mark, Student, Subject } from "@/generated/prisma/client";

type MarkRow = Mark & { student: Student; subject: Subject };

interface MarksTableProps {
  marks: MarkRow[];
}

export default function MarksTable({ marks }: MarksTableProps) {
  if (marks.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
        No marks entered yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Student</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Subject</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Marks</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Percentage</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Grade</th>
            <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Published</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {marks.map((mark) => (
            <tr key={mark.id} className="transition-colors hover:bg-slate-50">
              <td className="px-4 py-2.5 font-medium text-slate-900">
                {mark.student.firstName} {mark.student.lastName}
              </td>
              <td className="px-4 py-2.5 text-slate-600">{mark.subject.name}</td>
              <td className="px-4 py-2.5 text-slate-600">
                {mark.marks} / {mark.totalMarks}
              </td>
              <td className="px-4 py-2.5 text-slate-600">{mark.percentage}%</td>
              <td className="px-4 py-2.5 font-semibold text-slate-700">{mark.grade}</td>
              <td className="px-4 py-2.5">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    mark.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {mark.isPublished ? "Published" : "Draft"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
