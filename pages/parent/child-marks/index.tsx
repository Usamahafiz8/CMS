import { useState } from "react";
import PortalLayout from "@/components/Common/PortalLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import StatCard from "@/components/Dashboards/StatCard";
import MarksTable from "@/components/Tables/MarksTable";
import { useMyParentProfile } from "@/hooks/useMyProfile";
import { useMarks, useReportCard } from "@/hooks/useMarks";
import { PARENT_NAV_ITEMS } from "@/lib/constants";

export default function ParentChildMarksPage() {
  const [studentId, setStudentId] = useState("");
  const [examId, setExamId] = useState("");
  const { data: parent, isLoading: profileLoading } = useMyParentProfile();
  const marks = useMarks({ studentId: studentId || undefined });
  const reportCard = useReportCard(studentId || undefined, examId || undefined);

  const examOptions = [...new Map((marks.data ?? []).map((m) => [m.exam.id, m.exam])).values()];

  return (
    <PortalLayout title="Child Marks" role="PARENT" navItems={PARENT_NAV_ITEMS}>
      {profileLoading ? (
        <LoadingSpinner label="Loading your children..." />
      ) : (parent?.children.length ?? 0) === 0 ? (
        <p className="text-sm text-slate-500">Link a child from your dashboard to view their marks.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <select
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              setExamId("");
            }}
            className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select a child...</option>
            {parent?.children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.rollNumber})
              </option>
            ))}
          </select>

          {studentId && (
            <>
              <div>
                <h2 className="mb-4 text-base font-semibold text-slate-900">All Published Marks</h2>
                {marks.isLoading ? <LoadingSpinner label="Loading marks..." /> : <MarksTable marks={marks.data ?? []} />}
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
                {examId &&
                  (reportCard.isLoading ? (
                    <LoadingSpinner label="Loading report card..." />
                  ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <StatCard label="Overall %" value={`${reportCard.data?.overallPercentage ?? 0}%`} />
                      <StatCard label="GPA" value={reportCard.data?.gpa ?? 0} />
                      <StatCard label="Subjects" value={reportCard.data?.marks.length ?? 0} />
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
