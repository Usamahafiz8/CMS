import { useState } from "react";
import PortalLayout from "@/components/Common/PortalLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import MarksForm from "@/components/Forms/MarksForm";
import MarksTable from "@/components/Tables/MarksTable";
import { useMyTeacherProfile } from "@/hooks/useMyProfile";
import { useExams } from "@/hooks/useExam";
import { useClassStudents } from "@/hooks/useClass";
import { useEnterMark, useMarks } from "@/hooks/useMarks";
import { useToast } from "@/hooks/useToast";
import { TEACHER_NAV_ITEMS } from "@/lib/constants";
import { ApiClientError } from "@/lib/api-client";

export default function TeacherMarksPage() {
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const { toast, showToast, dismissToast } = useToast();

  const { data: teacher, isLoading: profileLoading } = useMyTeacherProfile();
  const exams = useExams(1, 50);

  const myClassIds = new Set((teacher?.classAssignments ?? []).map((a) => a.classId));
  const myExams = (exams.data?.data ?? []).filter((e) => myClassIds.has(e.classId));
  const exam = myExams.find((e) => e.id === examId);

  const classStudents = useClassStudents(exam?.classId);
  const enterMark = useEnterMark();
  const marks = useMarks({ examId: examId || undefined, subjectId: subjectId || undefined });

  const existingMarks = Object.fromEntries(
    (marks.data ?? [])
      .filter((m) => m.subjectId === subjectId)
      .map((m) => [m.studentId, { marks: m.marks, totalMarks: m.totalMarks }]),
  );

  return (
    <PortalLayout title="Enter Marks" role="TEACHER" navItems={TEACHER_NAV_ITEMS}>
      {profileLoading ? (
        <LoadingSpinner label="Loading your classes..." />
      ) : (
        <>
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
                {myExams.map((e) => (
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
          </div>

          {!examId || !subjectId ? (
            <p className="text-sm text-slate-500">Select an exam and subject to enter marks.</p>
          ) : classStudents.isLoading ? (
            <LoadingSpinner label="Loading students..." />
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="mb-4 text-base font-semibold text-slate-900">Enter Marks</h2>
                <MarksForm
                  students={classStudents.data ?? []}
                  existingMarks={existingMarks}
                  isSubmitting={enterMark.isPending}
                  onSubmit={(studentId, marksValue, totalMarks) => {
                    enterMark.mutate(
                      { studentId, teacherId: teacher!.id, examId, subjectId, marks: marksValue, totalMarks },
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
        </>
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </PortalLayout>
  );
}
