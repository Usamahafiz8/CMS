import PortalLayout from "@/components/Common/PortalLayout";
import AnnouncementsPanel from "@/components/Common/AnnouncementsPanel";
import { TEACHER_NAV_ITEMS } from "@/lib/constants";

export default function TeacherAnnouncementsPage() {
  return (
    <PortalLayout title="Announcements" role="TEACHER" navItems={TEACHER_NAV_ITEMS}>
      <AnnouncementsPanel canPost />
    </PortalLayout>
  );
}
