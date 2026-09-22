import { useState } from "react";
import PortalLayout from "@/components/Common/PortalLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import TimetableTable from "@/components/Tables/TimetableTable";
import { useMyParentProfile } from "@/hooks/useMyProfile";
import { useClassTimetable } from "@/hooks/useTimetable";
import { PARENT_NAV_ITEMS } from "@/lib/constants";

export default function ParentChildTimetablePage() {
  const [studentId, setStudentId] = useState("");
  const { data: parent, isLoading: profileLoading } = useMyParentProfile();

  const selectedChild = parent?.children.find((c) => c.id === studentId);
  const classId = selectedChild?.classEnrollments[0]?.classId;
  const timetable = useClassTimetable(classId);

  return (
    <PortalLayout title="Child Timetable" role="PARENT" navItems={PARENT_NAV_ITEMS}>
      {profileLoading ? (
        <LoadingSpinner label="Loading your children..." />
      ) : (parent?.children.length ?? 0) === 0 ? (
        <p className="text-sm text-slate-500">Link a child from your dashboard to view their timetable.</p>
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
            (!classId ? (
              <p className="text-sm text-slate-500">This child is not enrolled in a class yet.</p>
            ) : timetable.isLoading ? (
              <LoadingSpinner label="Loading timetable..." />
            ) : (
              <TimetableTable slots={timetable.data ?? []} />
            ))}
        </div>
      )}
    </PortalLayout>
  );
}
