import PortalLayout from "@/components/Common/PortalLayout";
import TeacherDashboard from "@/components/Dashboards/TeacherDashboard";
import { TEACHER_NAV_ITEMS } from "@/lib/constants";

export default function TeacherHome() {
  return (
    <PortalLayout title="Teacher Dashboard" role="TEACHER" navItems={TEACHER_NAV_ITEMS}>
      <TeacherDashboard />
    </PortalLayout>
  );
}
