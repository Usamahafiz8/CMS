import StatCard from "@/components/Dashboards/StatCard";
import AnnouncementCard from "@/components/Cards/AnnouncementCard";
import { useMyStudentProfile } from "@/hooks/useMyProfile";
import { useStudentAttendanceReport } from "@/hooks/useAttendance";
import { useAnnouncements } from "@/hooks/useAnnouncements";

export default function StudentDashboard() {
  const { data: student } = useMyStudentProfile();
  const attendance = useStudentAttendanceReport(student?.id);
  const announcements = useAnnouncements(1, 5);

  const currentClass = student?.classEnrollments[0]?.class;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatCard label="Roll Number" value={student?.rollNumber ?? "—"} />
        <StatCard label="Class" value={currentClass ? `${currentClass.name} - ${currentClass.section}` : "—"} />
        <StatCard label="Attendance" value={`${attendance.data?.summary.percentage ?? 0}%`} href="/student/attendance" />
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-900">Recent Announcements</h2>
        <div className="flex flex-col gap-3">
          {announcements.data?.data.map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
        </div>
      </div>
    </div>
  );
}
