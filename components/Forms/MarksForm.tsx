import { useState } from "react";
import type { Student } from "@/generated/prisma/client";

interface MarksFormProps {
  students: Student[];
  onSubmit: (studentId: string, marks: number, totalMarks: number) => void;
  isSubmitting?: boolean;
  existingMarks: Record<string, { marks: number; totalMarks: number }>;
}

export default function MarksForm({ students, onSubmit, isSubmitting = false, existingMarks }: MarksFormProps) {
  const [drafts, setDrafts] = useState<Record<string, { marks: string; totalMarks: string }>>({});

  const draftFor = (studentId: string) =>
    drafts[studentId] ?? {
      marks: existingMarks[studentId]?.marks?.toString() ?? "",
      totalMarks: existingMarks[studentId]?.totalMarks?.toString() ?? "100",
    };

  const setDraft = (studentId: string, field: "marks" | "totalMarks", value: string) => {
    setDrafts((prev) => ({ ...prev, [studentId]: { ...draftFor(studentId), [field]: value } }));
  };

  if (students.length === 0) {
    return <p className="text-sm text-slate-500">No students enrolled in this class.</p>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-md border border-slate-200 sm:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Student</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Marks Obtained</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Total Marks</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {students.map((student) => {
              const draft = draftFor(student.id);
              return (
                <tr key={student.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={draft.marks}
                      onChange={(e) => setDraft(student.id, "marks", e.target.value)}
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={1}
                      value={draft.totalMarks}
                      onChange={(e) => setDraft(student.id, "totalMarks", e.target.value)}
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={isSubmitting || !draft.marks || !draft.totalMarks}
                      onClick={() => onSubmit(student.id, Number(draft.marks), Number(draft.totalMarks))}
                      className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:hidden">
        {students.map((student) => {
          const draft = draftFor(student.id);
          return (
            <div key={student.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-semibold text-slate-900">
                {student.firstName} {student.lastName}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400">Marks Obtained</label>
                  <input
                    type="number"
                    min={0}
                    value={draft.marks}
                    onChange={(e) => setDraft(student.id, "marks", e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400">Total Marks</label>
                  <input
                    type="number"
                    min={1}
                    value={draft.totalMarks}
                    onChange={(e) => setDraft(student.id, "totalMarks", e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base"
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmitting || !draft.marks || !draft.totalMarks}
                onClick={() => onSubmit(student.id, Number(draft.marks), Number(draft.totalMarks))}
                className="mt-3 min-h-10 w-full rounded-md bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
