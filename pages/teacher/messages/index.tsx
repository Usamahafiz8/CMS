import PortalLayout from "@/components/Common/PortalLayout";
import MessagingPanel from "@/components/Common/MessagingPanel";
import { TEACHER_NAV_ITEMS } from "@/lib/constants";

export default function TeacherMessagesPage() {
  return (
    <PortalLayout title="Messages" role="TEACHER" navItems={TEACHER_NAV_ITEMS}>
      <MessagingPanel />
    </PortalLayout>
  );
}
