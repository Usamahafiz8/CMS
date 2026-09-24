import { useState } from "react";
import AdminLayout from "@/components/Common/AdminLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import TimetableTable from "@/components/Tables/TimetableTable";
import { useClasses } from "@/hooks/useClass";
import { useTeachers } from "@/hooks/useTeacher";
import { useSubjects } from "@/hooks/useSubject";
import { useClassTimetable, useTeacherTimetable, useSaveClassTimetable, type SlotInput } from "@/hooks/useTimetable";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
];

export default function TimetablePage() {
  const [view, setView] = useState<"class" | "teacher">("class");
  const [classId, setClassId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const { toast, showToast, dismissToast } = useToast();

  const classes = useClasses(1, 100);
  const teachers = useTeachers(1, 100);
  const subjects = useSubjects(1, 100);
  const classTimetable = useClassTimetable(classId || undefined);
  const teacherTimetable = useTeacherTimetable(teacherId || undefined);
  const saveTimetable = useSaveClassTimetable();

  const [pendingSlots, setPendingSlots] = useState<SlotInput[]>([]);
  const [draft, setDraft] = useState<SlotInput>({
    dayOfWeek: 1,
    periodNumber: 1,
    startTime: "09:00",
    endTime: "10:00",
    room: "",
    teacherId: "",
    subjectId: "",
  });

  const startEditing = () => {
    setPendingSlots(
      (classTimetable.data ?? []).map((s) => ({
        dayOfWeek: s.dayOfWeek,
        periodNumber: s.periodNumber,
        startTime: s.startTime,
        endTime: s.endTime,
        room: s.room,
        teacherId: s.teacherId,
        subjectId: s.subjectId,
      })),
    );
  };

  return (
    <AdminLayout title="Timetable">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setView("class")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${view === "class" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600"}`}
        >
          By Class
        </button>
        <button
          type="button"
          onClick={() => setView("teacher")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${view === "teacher" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600"}`}
        >
          By Teacher
        </button>
      </div>

      {view === "class" ? (
        <div className="flex flex-col gap-6">
          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setPendingSlots([]);
            }}
            className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select a class...</option>
            {classes.data?.data.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.section}
              </option>
            ))}
          </select>

          {classId && (
            <>
              {classTimetable.isLoading ? (
                <LoadingSpinner label="Loading timetable..." />
              ) : (
                <TimetableTable slots={classTimetable.data ?? []} />
              )}

              <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">Edit Weekly Timetable</h3>
                  {pendingSlots.length === 0 && (
                    <button
                      type="button"
                      onClick={startEditing}
                      className="text-sm font-medium text-brand-600 hover:text-brand-800"
                    >
                      Load current timetable to edit
                    </button>
                  )}
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-2">
                  <select
                    value={draft.dayOfWeek}
                    onChange={(e) => setDraft({ ...draft, dayOfWeek: Number(e.target.value) })}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    {DAYS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={draft.periodNumber}
                    onChange={(e) => setDraft({ ...draft, periodNumber: Number(e.target.value) })}
                    className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="Period"
                  />
                  <input
                    type="time"
                    value={draft.startTime}
                    onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="time"
                    value={draft.endTime}
                    onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    value={draft.room}
                    onChange={(e) => setDraft({ ...draft, room: e.target.value })}
                    placeholder="Room"
                    className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                  <select
                    value={draft.subjectId}
                    onChange={(e) => setDraft({ ...draft, subjectId: e.target.value })}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value="">Subject...</option>
                    {subjects.data?.data.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={draft.teacherId}
                    onChange={(e) => setDraft({ ...draft, teacherId: e.target.value })}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value="">Teacher...</option>
                    {teachers.data?.data.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!draft.room || !draft.subjectId || !draft.teacherId}
                    onClick={() => {
                      setPendingSlots((prev) => [
                        ...prev.filter(
                          (s) => !(s.dayOfWeek === draft.dayOfWeek && s.periodNumber === draft.periodNumber),
                        ),
                        draft,
                      ]);
                    }}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Add Slot
                  </button>
                </div>

                {pendingSlots.length > 0 && (
                  <>
                    <p className="mb-2 text-sm text-slate-500">{pendingSlots.length} slot(s) staged.</p>
                    <button
                      type="button"
                      disabled={saveTimetable.isPending}
                      onClick={() => {
                        saveTimetable.mutate(
                          { classId, slots: pendingSlots },
                          {
                            onSuccess: () => {
                              showToast("Timetable saved");
                              setPendingSlots([]);
                            },
                            onError: (error) =>
                              showToast(
                                error instanceof ApiClientError ? error.message : "Failed to save timetable",
                                "error",
                              ),
                          },
                        );
                      }}
                      className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      {saveTimetable.isPending ? "Saving..." : "Save Timetable"}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select a teacher...</option>
            {teachers.data?.data.map((t) => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>

          {teacherId &&
            (teacherTimetable.isLoading ? (
              <LoadingSpinner label="Loading timetable..." />
            ) : (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Day</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Period</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Class</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Subject</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(teacherTimetable.data ?? []).map((slot) => (
                      <tr key={slot.id}>
                        <td className="px-4 py-3 text-slate-600">{DAYS.find((d) => d.value === slot.dayOfWeek)?.label ?? slot.dayOfWeek}</td>
                        <td className="px-4 py-3 text-slate-600">{slot.periodNumber}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {slot.class.name} - {slot.class.section}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{slot.subject.name}</td>
                        <td className="px-4 py-3 text-slate-600">{slot.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
