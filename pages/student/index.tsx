import PortalLayout from "@/components/Common/PortalLayout";
import StudentDashboard from "@/components/Dashboards/StudentDashboard";
import { STUDENT_NAV_ITEMS } from "@/lib/constants";

export default function StudentHome() {
  return (
    <PortalLayout title="Student Dashboard" role="STUDENT" navItems={STUDENT_NAV_ITEMS}>
      <StudentDashboard />
    </PortalLayout>
  );
}
