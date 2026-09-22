import { useState } from "react";
import PortalLayout from "@/components/Common/PortalLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import StatCard from "@/components/Dashboards/StatCard";
import MarksTable from "@/components/Tables/MarksTable";
import { useMyStudentProfile } from "@/hooks/useMyProfile";
import { useMarks, useReportCard } from "@/hooks/useMarks";
import { STUDENT_NAV_ITEMS } from "@/lib/constants";

export default function StudentMarksPage() {
  const [examId, setExamId] = useState("");
  const { data: student, isLoading: profileLoading } = useMyStudentProfile();
  const marks = useMarks({ studentId: student?.id });
  const reportCard = useReportCard(student?.id, examId || undefined);

  const examOptions = [...new Map((marks.data ?? []).map((m) => [m.exam.id, m.exam])).values()];

  return (
    <PortalLayout title="My Marks" role="STUDENT" navItems={STUDENT_NAV_ITEMS}>
      {profileLoading || marks.isLoading ? (
        <LoadingSpinner label="Loading marks..." />
      ) : (
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="mb-4 text-base font-semibold text-slate-900">All Published Marks</h2>
            <MarksTable marks={marks.data ?? []} />
          </div>

          <div>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-base font-semibold text-slate-900">Report Card</h2>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select an exam...</option>
                {examOptions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            {examId && (
              reportCard.isLoading ? (
                <LoadingSpinner label="Loading report card..." />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <StatCard label="Overall %" value={`${reportCard.data?.overallPercentage ?? 0}%`} />
                  <StatCard label="GPA" value={reportCard.data?.gpa ?? 0} />
                  <StatCard label="Subjects" value={reportCard.data?.marks.length ?? 0} />
                </div>
              )
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
