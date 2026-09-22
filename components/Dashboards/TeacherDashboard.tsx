import Link from "next/link";
import StatCard from "@/components/Dashboards/StatCard";
import AnnouncementCard from "@/components/Cards/AnnouncementCard";
import { useMyTeacherProfile } from "@/hooks/useMyProfile";
import { useAnnouncements } from "@/hooks/useAnnouncements";

export default function TeacherDashboard() {
  const { data: teacher } = useMyTeacherProfile();
  const announcements = useAnnouncements(1, 5);

  const classes = teacher?.classAssignments.map((a) => a.class) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="My Classes" value={classes.length} href="/teacher/timetable" />
        <StatCard label="Employee ID" value={teacher?.employeeId ?? "—"} />
        <StatCard label="Status" value={teacher?.status ?? "—"} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">My Classes</h2>
        {classes.length === 0 ? (
          <p className="text-sm text-slate-500">You have not been assigned to any classes yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {classes.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-700">
                  {c.name} - {c.section} ({c.academicYear})
                </span>
                <Link href="/teacher/attendance" className="font-medium text-brand-600 hover:text-brand-800">
                  Mark Attendance
                </Link>
              </li>
            ))}
          </ul>
        )}
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
