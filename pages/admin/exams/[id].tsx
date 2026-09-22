import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "@/components/Common/AdminLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import { useExam, useCreateExamTimetable, useAssignInvigilator } from "@/hooks/useExam";
import { useTeachers } from "@/hooks/useTeacher";
import { usePublishResults } from "@/hooks/useMarks";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

export default function ExamDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const { toast, showToast, dismissToast } = useToast();

  const { data: exam, isLoading } = useExam(id);
  const createTimetable = useCreateExamTimetable(id ?? "");
  const assignInvigilator = useAssignInvigilator(id ?? "");
  const publishResults = usePublishResults();
  const teachers = useTeachers(1, 100);

  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [room, setRoom] = useState("");
  const [invigilatorId, setInvigilatorId] = useState("");

  return (
    <AdminLayout title="Manage Exam">
      <Link href="/admin/exams" className="mb-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-800">
        ← Back to Exams
      </Link>

      {isLoading || !exam ? (
        <LoadingSpinner label="Loading exam..." />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{exam.name}</h2>
              <p className="text-sm text-slate-500">
                {exam.class.name} - {exam.class.section} · {exam.type.replace("_", " ")}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/academics?examId=${exam.id}&classId=${exam.classId}`}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Enter Marks
              </Link>
              <button
                type="button"
                disabled={publishResults.isPending}
                onClick={() =>
                  publishResults.mutate(exam.id, {
                    onSuccess: (data) => showToast(`Published ${data.publishedCount} results`),
                    onError: (error) =>
                      showToast(
                        error instanceof ApiClientError ? error.message : "Failed to publish results",
                        "error",
                      ),
                  })
                }
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                Publish Results
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-3 text-base font-semibold text-slate-900">Exam Timetable</h3>
            {exam.timetables.length === 0 ? (
              <p className="mb-4 text-sm text-slate-500">No timetable entries yet.</p>
            ) : (
              <ul className="mb-4 divide-y divide-slate-100">
                {exam.timetables.map((t: { id: string; subject: { name: string }; date: string; room: string }) => (
                  <li key={t.id} className="py-2 text-sm text-slate-700">
                    {t.subject.name} — {new Date(t.date).toLocaleDateString()} — Room {t.room}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-end gap-2">
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">Subject...</option>
                {exam.subjects.map((s: { id: string; name: string }) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input placeholder="Room" value={room} onChange={(e) => setRoom(e.target.value)} className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <button
                type="button"
                disabled={!subjectId || !date || !room || createTimetable.isPending}
                onClick={() => {
                  createTimetable.mutate(
                    [
                      {
                        subjectId,
                        date,
                        startTime: `${date}T${startTime}:00`,
                        endTime: `${date}T${endTime}:00`,
                        room,
                      },
                    ],
                    {
                      onSuccess: () => {
                        showToast("Timetable entry added");
                        setSubjectId("");
                        setDate("");
                        setRoom("");
                      },
                      onError: (error) =>
                        showToast(
                          error instanceof ApiClientError ? error.message : "Failed to add entry",
                          "error",
                        ),
                    },
                  );
                }}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-3 text-base font-semibold text-slate-900">Invigilators</h3>
            {exam.invigilators.length === 0 ? (
              <p className="mb-4 text-sm text-slate-500">No invigilators assigned yet.</p>
            ) : (
              <ul className="mb-4 divide-y divide-slate-100">
                {exam.invigilators.map((inv: { id: string; teacher: { firstName: string; lastName: string } }) => (
                  <li key={inv.id} className="py-2 text-sm text-slate-700">
                    {inv.teacher.firstName} {inv.teacher.lastName}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <select
                value={invigilatorId}
                onChange={(e) => setInvigilatorId(e.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select a teacher...</option>
                {teachers.data?.data.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!invigilatorId || assignInvigilator.isPending}
                onClick={() =>
                  assignInvigilator.mutate(invigilatorId, {
                    onSuccess: () => {
                      showToast("Invigilator assigned");
                      setInvigilatorId("");
                    },
                    onError: (error) =>
                      showToast(
                        error instanceof ApiClientError ? error.message : "Failed to assign invigilator",
                        "error",
                      ),
                  })
                }
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
