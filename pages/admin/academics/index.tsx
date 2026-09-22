import { useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/Common/AdminLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import MarksForm from "@/components/Forms/MarksForm";
import MarksTable from "@/components/Tables/MarksTable";
import { useExams, useExam } from "@/hooks/useExam";
import { useClassStudents } from "@/hooks/useClass";
import { useTeachers } from "@/hooks/useTeacher";
import { useEnterMark, useMarks } from "@/hooks/useMarks";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

export default function AcademicsPage() {
  const router = useRouter();
  const { toast, showToast, dismissToast } = useToast();

  const [manualExamId, setManualExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const examId = manualExamId || (typeof router.query.examId === "string" ? router.query.examId : "");
  const setExamId = setManualExamId;

  const exams = useExams(1, 50);
  const { data: exam } = useExam(examId || undefined);
  const classStudents = useClassStudents(exam?.classId);
  const teachers = useTeachers(1, 100);
  const enterMark = useEnterMark();
  const marks = useMarks({ examId: examId || undefined, subjectId: subjectId || undefined });

  const existingMarks = Object.fromEntries(
    (marks.data ?? [])
      .filter((m) => m.subjectId === subjectId)
      .map((m) => [m.studentId, { marks: m.marks, totalMarks: m.totalMarks }]),
  );

  return (
    <AdminLayout title="Academics & Marks">
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Exam</label>
          <select
            value={examId}
            onChange={(e) => {
              setExamId(e.target.value);
              setSubjectId("");
            }}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select an exam...</option>
            {exams.data?.data.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.class.name} - {e.class.section})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={!exam}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          >
            <option value="">Select a subject...</option>
            {exam?.subjects.map((s: { id: string; name: string }) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Entered By (Teacher)</label>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select a teacher...</option>
            {teachers.data?.data.map((t) => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!examId || !subjectId || !teacherId ? (
        <p className="text-sm text-slate-500">Select an exam, subject, and teacher to enter marks.</p>
      ) : classStudents.isLoading ? (
        <LoadingSpinner label="Loading students..." />
      ) : (
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="mb-4 text-base font-semibold text-slate-900">Enter Marks</h2>
            <MarksForm
              students={classStudents.data ?? []}
              existingMarks={existingMarks}
              isSubmitting={enterMark.isPending}
              onSubmit={(studentId, marksValue, totalMarks) => {
                enterMark.mutate(
                  { studentId, teacherId, examId, subjectId, marks: marksValue, totalMarks },
                  {
                    onSuccess: () => showToast("Marks saved"),
                    onError: (error) =>
                      showToast(
                        error instanceof ApiClientError ? error.message : "Failed to save marks",
                        "error",
                      ),
                  },
                );
              }}
            />
          </div>

          <div>
            <h2 className="mb-4 text-base font-semibold text-slate-900">Marks for this Exam</h2>
            <MarksTable marks={marks.data ?? []} />
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
