import { useState } from "react";
import PortalLayout from "@/components/Common/PortalLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import StatCard from "@/components/Dashboards/StatCard";
import { useMyParentProfile } from "@/hooks/useMyProfile";
import { useStudentAttendanceReport } from "@/hooks/useAttendance";
import { PARENT_NAV_ITEMS } from "@/lib/constants";

export default function ParentChildAttendancePage() {
  const [studentId, setStudentId] = useState("");
  const { data: parent, isLoading: profileLoading } = useMyParentProfile();
  const attendance = useStudentAttendanceReport(studentId || undefined);

  return (
    <PortalLayout title="Child Attendance" role="PARENT" navItems={PARENT_NAV_ITEMS}>
      {profileLoading ? (
        <LoadingSpinner label="Loading your children..." />
      ) : (parent?.children.length ?? 0) === 0 ? (
        <p className="text-sm text-slate-500">Link a child from your dashboard to view their attendance.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select a child...</option>
            {parent?.children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.rollNumber})
              </option>
            ))}
          </select>

          {studentId &&
            (attendance.isLoading ? (
              <LoadingSpinner label="Loading attendance..." />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <StatCard label="Present" value={attendance.data?.summary.present ?? 0} />
                  <StatCard label="Absent" value={attendance.data?.summary.absent ?? 0} />
                  <StatCard label="Leave" value={attendance.data?.summary.leave ?? 0} />
                  <StatCard label="Attendance %" value={`${attendance.data?.summary.percentage ?? 0}%`} />
                </div>
                <div className="overflow-x-auto rounded-md border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(attendance.data?.records ?? []).map((r) => (
                        <tr key={r.id}>
                          <td className="px-4 py-3 text-slate-600">{new Date(r.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-slate-600">{r.status}</td>
                          <td className="px-4 py-3 text-slate-600">{r.remarks ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ))}
        </div>
      )}
    </PortalLayout>
  );
}
