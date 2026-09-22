import PortalLayout from "@/components/Common/PortalLayout";
import MessagingPanel from "@/components/Common/MessagingPanel";
import { PARENT_NAV_ITEMS } from "@/lib/constants";

export default function ParentMessagesPage() {
  return (
    <PortalLayout title="Messages" role="PARENT" navItems={PARENT_NAV_ITEMS}>
      <MessagingPanel />
    </PortalLayout>
  );
}
