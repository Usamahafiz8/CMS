import { useState } from "react";
import AdminLayout from "@/components/Common/AdminLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import AttendanceChart from "@/components/Charts/AttendanceChart";
import PerformanceChart from "@/components/Charts/PerformanceChart";
import FeeChart from "@/components/Charts/FeeChart";
import { useAttendanceReport, useAcademicReport, useFinancialReport, useExportReport } from "@/hooks/useReports";
import { useExams } from "@/hooks/useExam";
import { formatCurrency } from "@/lib/helpers";

type ReportTab = "attendance" | "academic" | "financial";

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>("attendance");
  const [examId, setExamId] = useState("");

  const attendance = useAttendanceReport();
  const exams = useExams(1, 50);
  const academic = useAcademicReport(examId || undefined);
  const financial = useFinancialReport();
  const exportReport = useExportReport();

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="mb-6 flex gap-2">
        {(["attendance", "academic", "financial"] as ReportTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium capitalize ${tab === t ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "attendance" && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-900">Attendance by Class</h2>
            <button
              type="button"
              onClick={() => exportReport.mutate({ type: "attendance" })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto sm:py-1.5"
            >
              Export CSV
            </button>
          </div>
          {attendance.isLoading ? (
            <LoadingSpinner label="Loading report..." />
          ) : (
            <AttendanceChart data={attendance.data ?? []} />
          )}
        </div>
      )}

      {tab === "academic" && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-900">Academic Performance by Subject</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-base sm:w-auto sm:py-2 sm:text-sm"
              >
                <option value="">Select an exam...</option>
                {exams.data?.data.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!examId}
                onClick={() => exportReport.mutate({ type: "academic", examId })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:w-auto sm:py-1.5"
              >
                Export CSV
              </button>
            </div>
          </div>
          {!examId ? (
            <p className="text-sm text-slate-500">Select an exam to view its performance breakdown.</p>
          ) : academic.isLoading ? (
            <LoadingSpinner label="Loading report..." />
          ) : (
            <PerformanceChart data={academic.data ?? []} />
          )}
        </div>
      )}

      {tab === "financial" && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-900">Financial Summary</h2>
            <button
              type="button"
              onClick={() => exportReport.mutate({ type: "financial" })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto sm:py-1.5"
            >
              Export CSV
            </button>
          </div>
          {financial.isLoading ? (
            <LoadingSpinner label="Loading report..." />
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-500">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(financial.data?.totalRevenue ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Outstanding</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(financial.data?.totalOutstanding ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Invoiced</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(financial.data?.totalInvoiced ?? 0)}
                  </p>
                </div>
              </div>
              <FeeChart data={financial.data?.byFeeType ?? []} />
            </>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
