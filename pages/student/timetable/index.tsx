import PortalLayout from "@/components/Common/PortalLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import TimetableTable from "@/components/Tables/TimetableTable";
import { useMyStudentProfile } from "@/hooks/useMyProfile";
import { useClassTimetable } from "@/hooks/useTimetable";
import { STUDENT_NAV_ITEMS } from "@/lib/constants";

export default function StudentTimetablePage() {
  const { data: student, isLoading: profileLoading } = useMyStudentProfile();
  const classId = student?.classEnrollments[0]?.classId;
  const timetable = useClassTimetable(classId);

  return (
    <PortalLayout title="My Timetable" role="STUDENT" navItems={STUDENT_NAV_ITEMS}>
      {profileLoading ? (
        <LoadingSpinner label="Loading your class..." />
      ) : !classId ? (
        <p className="text-sm text-slate-500">You are not enrolled in a class yet.</p>
      ) : timetable.isLoading ? (
        <LoadingSpinner label="Loading timetable..." />
      ) : (
        <TimetableTable slots={timetable.data ?? []} />
      )}
    </PortalLayout>
  );
}
