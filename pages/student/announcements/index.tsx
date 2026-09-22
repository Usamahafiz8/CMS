import PortalLayout from "@/components/Common/PortalLayout";
import AnnouncementsPanel from "@/components/Common/AnnouncementsPanel";
import { STUDENT_NAV_ITEMS } from "@/lib/constants";

export default function StudentAnnouncementsPage() {
  return (
    <PortalLayout title="Announcements" role="STUDENT" navItems={STUDENT_NAV_ITEMS}>
      <AnnouncementsPanel />
    </PortalLayout>
  );
}
