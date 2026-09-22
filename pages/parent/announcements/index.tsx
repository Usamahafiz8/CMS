import PortalLayout from "@/components/Common/PortalLayout";
import AnnouncementsPanel from "@/components/Common/AnnouncementsPanel";
import { PARENT_NAV_ITEMS } from "@/lib/constants";

export default function ParentAnnouncementsPage() {
  return (
    <PortalLayout title="Announcements" role="PARENT" navItems={PARENT_NAV_ITEMS}>
      <AnnouncementsPanel />
    </PortalLayout>
  );
}
