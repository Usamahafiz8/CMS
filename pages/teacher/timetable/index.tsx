import PortalLayout from "@/components/Common/PortalLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import { useMyTeacherProfile } from "@/hooks/useMyProfile";
import { useTeacherTimetable } from "@/hooks/useTimetable";
import { TEACHER_NAV_ITEMS } from "@/lib/constants";

const DAY_LABELS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TeacherTimetablePage() {
  const { data: teacher, isLoading: profileLoading } = useMyTeacherProfile();
  const timetable = useTeacherTimetable(teacher?.id);

  return (
    <PortalLayout title="My Timetable" role="TEACHER" navItems={TEACHER_NAV_ITEMS}>
      {profileLoading || timetable.isLoading ? (
        <LoadingSpinner label="Loading timetable..." />
      ) : (timetable.data ?? []).length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
          No timetable slots assigned yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Day</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Period</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Class</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(timetable.data ?? []).map((slot) => (
                <tr key={slot.id}>
                  <td className="px-4 py-3 text-slate-600">{DAY_LABELS[slot.dayOfWeek]}</td>
                  <td className="px-4 py-3 text-slate-600">{slot.periodNumber}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {slot.class.name} - {slot.class.section}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{slot.subject.name}</td>
                  <td className="px-4 py-3 text-slate-600">{slot.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PortalLayout>
  );
}
