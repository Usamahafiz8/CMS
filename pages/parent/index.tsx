import PortalLayout from "@/components/Common/PortalLayout";
import ParentDashboard from "@/components/Dashboards/ParentDashboard";
import { PARENT_NAV_ITEMS } from "@/lib/constants";

export default function ParentHome() {
  return (
    <PortalLayout title="Parent Dashboard" role="PARENT" navItems={PARENT_NAV_ITEMS}>
      <ParentDashboard />
    </PortalLayout>
  );
}
