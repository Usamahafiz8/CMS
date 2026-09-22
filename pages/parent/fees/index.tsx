import { useState } from "react";
import PortalLayout from "@/components/Common/PortalLayout";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import FeeTable from "@/components/Tables/FeeTable";
import { useMyParentProfile } from "@/hooks/useMyProfile";
import { useInvoices } from "@/hooks/useFees";
import { PARENT_NAV_ITEMS } from "@/lib/constants";

export default function ParentFeesPage() {
  const [studentId, setStudentId] = useState("");
  const { data: parent, isLoading: profileLoading } = useMyParentProfile();
  const invoices = useInvoices({ studentId: studentId || undefined });

  return (
    <PortalLayout title="Child Fees" role="PARENT" navItems={PARENT_NAV_ITEMS}>
      {profileLoading ? (
        <LoadingSpinner label="Loading your children..." />
      ) : (parent?.children.length ?? 0) === 0 ? (
        <p className="text-sm text-slate-500">Link a child from your dashboard to view their fees.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select a child...</option>
            {parent?.children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.rollNumber})
              </option>
            ))}
          </select>

          {studentId &&
            (invoices.isLoading ? (
              <LoadingSpinner label="Loading fees..." />
            ) : (
              <FeeTable fees={invoices.data ?? []} />
            ))}
        </div>
      )}
    </PortalLayout>
  );
}
