import PortalLayout from "@/components/Common/PortalLayout";
import MessagingPanel from "@/components/Common/MessagingPanel";
import { STUDENT_NAV_ITEMS } from "@/lib/constants";

export default function StudentMessagesPage() {
  return (
    <PortalLayout title="Messages" role="STUDENT" navItems={STUDENT_NAV_ITEMS}>
      <MessagingPanel />
    </PortalLayout>
  );
}
