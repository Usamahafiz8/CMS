import { useState } from "react";
import PortalLayout from "@/components/Common/PortalLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import AttendanceForm from "@/components/Forms/AttendanceForm";
import AttendanceTable from "@/components/Tables/AttendanceTable";
import { useMyTeacherProfile } from "@/hooks/useMyProfile";
import { useClassStudents } from "@/hooks/useClass";
import { useBulkMarkAttendance, useClassAttendanceReport } from "@/hooks/useAttendance";
import { useToast } from "@/hooks/useToast";
import { TEACHER_NAV_ITEMS } from "@/lib/constants";
import { ApiClientError } from "@/lib/api-client";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherAttendancePage() {
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(todayIso());
  const { toast, showToast, dismissToast } = useToast();

  const { data: teacher, isLoading: profileLoading } = useMyTeacherProfile();
  const classStudents = useClassStudents(classId || undefined);
  const bulkMark = useBulkMarkAttendance();
  const report = useClassAttendanceReport(classId || undefined);

  const classes = teacher?.classAssignments.map((a) => a.class) ?? [];

  return (
    <PortalLayout title="Mark Attendance" role="TEACHER" navItems={TEACHER_NAV_ITEMS}>
      {profileLoading ? (
        <LoadingSpinner label="Loading your classes..." />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Class</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select a class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.section}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {!classId ? (
            <p className="text-sm text-slate-500">Select a class to mark or view attendance.</p>
          ) : classStudents.isLoading ? (
            <LoadingSpinner label="Loading students..." />
          ) : (
            <div className="flex flex-col gap-6">
              <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                <h2 className="mb-4 text-base font-semibold text-slate-900">Mark Attendance — {date}</h2>
                <AttendanceForm
                  students={classStudents.data ?? []}
                  isSubmitting={bulkMark.isPending}
                  onSubmit={(records) => {
                    bulkMark.mutate(
                      { classId, date, records },
                      {
                        onSuccess: () => showToast("Attendance saved"),
                        onError: (error) =>
                          showToast(
                            error instanceof ApiClientError ? error.message : "Failed to save attendance",
                            "error",
                          ),
                      },
                    );
                  }}
                />
              </div>

              <div>
                <h2 className="mb-4 text-base font-semibold text-slate-900">Attendance Report</h2>
                {report.isLoading ? (
                  <LoadingSpinner label="Loading report..." />
                ) : (
                  <AttendanceTable rows={report.data?.byStudent ?? []} />
                )}
              </div>
            </div>
          )}
        </>
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </PortalLayout>
  );
}
