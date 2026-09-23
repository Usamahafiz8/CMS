import { useState } from "react";
import AdminLayout from "@/components/Common/AdminLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import Toast from "@/components/Common/Toast";
import AttendanceForm from "@/components/Forms/AttendanceForm";
import AttendanceTable from "@/components/Tables/AttendanceTable";
import AttendanceLogTable from "@/components/Tables/AttendanceLogTable";
import { useClasses, useClassStudents } from "@/hooks/useClass";
import { useBulkMarkAttendance, useClassAttendanceReport } from "@/hooks/useAttendance";
import { useToast } from "@/hooks/useToast";
import { ApiClientError } from "@/lib/api-client";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(todayIso());
  const { toast, showToast, dismissToast } = useToast();

  const classes = useClasses(1, 100);
  const classStudents = useClassStudents(classId || undefined);
  const bulkMark = useBulkMarkAttendance();
  const report = useClassAttendanceReport(classId || undefined);

  return (
    <AdminLayout title="Attendance">
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Class</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select a class...</option>
            {classes.data?.data.map((c) => (
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
        <div className="flex flex-col gap-8">
          <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
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
            <h2 className="mb-4 text-base font-semibold text-slate-900">Attendance Summary</h2>
            <p className="mb-3 text-sm text-slate-500">Totals across every date this class has been marked.</p>
            {report.isLoading ? (
              <LoadingSpinner label="Loading report..." />
            ) : (
              <AttendanceTable rows={report.data?.byStudent ?? []} />
            )}
          </div>

          <div>
            <h2 className="mb-4 text-base font-semibold text-slate-900">Attendance Log</h2>
            <p className="mb-3 text-sm text-slate-500">Every recorded entry, newest first — which date each mark was for.</p>
            {report.isLoading ? (
              <LoadingSpinner label="Loading log..." />
            ) : (
              <AttendanceLogTable
                records={report.data?.records ?? []}
                studentsById={Object.fromEntries((classStudents.data ?? []).map((s) => [s.id, s]))}
              />
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </AdminLayout>
  );
}
